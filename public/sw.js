// handwritten service worker, no libraries. what it does:
//
// - precaches /offline (+ the js/css it needs) so there's always something to
//   show when a page isn't available
// - /_next/static/* is content-hashed, so those are cache-first forever
// - dashboard pages are network-first and the last good copy is kept, which is
//   what makes the app readable offline. it's read-only: nothing is queued.
// - every other request (api, auth, server actions, rsc fetches) is left alone

const SHELL_CACHE = "cc-shell-v1";
const STATIC_CACHE = "cc-static-v1";
// keep this prefix in sync with PAGES_CACHE_PREFIX in src/lib/offline.ts, the
// app deletes caches by it on logout
const PAGES_CACHE = "cc-pages-v1";
const KNOWN_CACHES = [SHELL_CACHE, STATIC_CACHE, PAGES_CACHE];

const OFFLINE_URL = "/offline";
const CACHED_AT_HEADER = "x-cc-cached-at";

// hashed chunks pile up across deploys, so cap them instead of growing forever
const MAX_STATIC_ENTRIES = 200;
// a slow connection is as bad as none: past this, show the saved copy
const NETWORK_TIMEOUT_MS = 4000;
// client side navigation doesn't hit the network for html, so the client asks
// us to save the page it landed on. don't redo it if it's recent.
const PAGE_MAX_AGE_MS = 5 * 60 * 1000;
// after a mark, wait for the taps to settle before re-rendering the pages
const ACTION_REFRESH_DELAY_MS = 1500;
const MAX_WARMED_PAGES = 12;

const SESSION_LINK = /\/dashboard\/sessions\/[0-9a-f-]{36}/g;
const BUILD_ASSET = /\/_next\/static\/[^"'\\\s<>)]+/g;

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOfflinePage().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("cc-") && !KNOWN_CACHES.includes(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "cache-page") return;
  const path = toDashboardPath(data.url);
  if (path) event.waitUntil(ensureFresh(path, PAGE_MAX_AGE_MS));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // a server action just changed something, so the saved copy of that page
  // (and the dashboard percentages) is out of date
  if (request.method === "POST" && request.headers.has("next-action")) {
    const response = fetch(request);
    event.respondWith(response);
    event.waitUntil(
      response
        .then((res) => {
          if (!res.ok) return;
          const paths = [toDashboardPath(url.pathname), "/dashboard"];
          return scheduleRefresh(paths.filter(Boolean));
        })
        .catch(() => {}),
    );
    return;
  }

  if (request.method !== "GET") return;

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    const path = toDashboardPath(url.pathname);
    if (path) {
      event.respondWith(dashboardPage(event, request, path));
    } else {
      // logging in as someone else must never show the last user's pages
      if (/^\/(login|signup|reset-password)\/?$/.test(url.pathname)) {
        event.waitUntil(caches.delete(PAGES_CACHE));
      }
      event.respondWith(networkOrOffline(request));
    }
  }
});

// only dashboard pages hold user data worth saving. returns a clean pathname
// (no query/hash, no trailing slash) or null for anything else.
function toDashboardPath(input) {
  try {
    const pathname = new URL(input, self.location.origin).pathname;
    const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
    return clean === "/dashboard" || clean.startsWith("/dashboard/")
      ? clean
      : null;
  } catch {
    return null;
  }
}

async function precacheOfflinePage() {
  const res = await fetch(OFFLINE_URL, { cache: "reload" });
  if (!res.ok) throw new Error("couldn't fetch the offline page");

  const html = await res.clone().text();
  const shell = await caches.open(SHELL_CACHE);
  await shell.put(OFFLINE_URL, res);

  // without its own css/js the offline page would render unstyled
  const assets = [...new Set(html.match(BUILD_ASSET) || [])];
  const statics = await caches.open(STATIC_CACHE);
  await Promise.all(
    assets.map(async (asset) => {
      try {
        const assetRes = await fetch(asset);
        if (assetRes.ok) await statics.put(asset, assetRes);
      } catch {
        // missing one asset shouldn't block the install
      }
    }),
  );
}

async function offlineResponse() {
  const cached = await caches.match(OFFLINE_URL);
  return (
    cached ||
    new Response("you're offline", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    })
  );
}

async function networkOrOffline(request) {
  try {
    return await fetch(request);
  } catch {
    return offlineResponse();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  const res = await fetch(request);
  if (res.ok) {
    await cache.put(request, res.clone());
    await trimCache(cache, MAX_STATIC_ENTRIES);
  }
  return res;
}

// cache.keys() comes back oldest first
async function trimCache(cache, max) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

// network first so you always see live data when you can, falling back to the
// last saved copy when the network fails, errors, or is too slow
async function dashboardPage(event, request, path) {
  const cache = await caches.open(PAGES_CACHE);
  const saved = await cache.match(path, { ignoreVary: true });

  const network = fetchAndStore(request, path, cache);
  // saving happens after the response is already on its way to the page
  event.waitUntil(network.then((r) => r.saving).catch(() => {}));

  if (!saved) {
    try {
      return (await network).res;
    } catch {
      return offlineResponse();
    }
  }

  const tooSlow = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null));
  try {
    const result = await Promise.race([network, tooSlow]);
    // a server error is no reason to hide data we already have
    if (result && result.res.status < 500) return result.res;
  } catch {
    // offline, fall through to the saved copy
  }
  return saved;
}

// gives the response back straight away, and a `saving` promise for the
// caching work (which for /dashboard includes warming every semester page)
async function fetchAndStore(request, path, cache) {
  const res = await fetch(request);

  // bounced to /login: the session is gone, so what's saved belongs to
  // someone who's no longer signed in. navigations report this as an opaque
  // redirect, plain fetches as a redirected response.
  if (res.type === "opaqueredirect" || res.redirected) {
    return { res, saving: caches.delete(PAGES_CACHE) };
  }
  if (!res.ok) return { res, saving: Promise.resolve() };

  const forCache = stamp(res.clone());
  const forLinks = path === "/dashboard" ? res.clone() : null;
  const saving = (async () => {
    try {
      await cache.put(path, forCache);
      if (forLinks) await warmSessionPages(forLinks, cache);
    } catch {
      // saving is best effort, the page itself already loaded
    }
  })();
  return { res, saving };
}

// remember when this copy was saved, the app shows it while offline
function stamp(res) {
  const headers = new Headers(res.headers);
  headers.set(CACHED_AT_HEADER, String(Date.now()));
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

// the dashboard links to every semester, so save those pages too. otherwise
// only the semesters you happened to open would work offline.
async function warmSessionPages(dashboardRes, cache) {
  const html = await dashboardRes.text();
  const links = [...new Set(html.match(SESSION_LINK) || [])].slice(0, MAX_WARMED_PAGES);
  for (const link of links) {
    try {
      await ensureFresh(link, PAGE_MAX_AGE_MS, cache);
    } catch {
      // best effort
    }
  }
}

async function ensureFresh(path, maxAge, openCache) {
  const cache = openCache || (await caches.open(PAGES_CACHE));
  const saved = await cache.match(path, { ignoreVary: true });
  if (saved) {
    const age = Date.now() - Number(saved.headers.get(CACHED_AT_HEADER));
    if (age < maxAge) return;
  }
  const request = new Request(path, { headers: { accept: "text/html" } });
  const { saving } = await fetchAndStore(request, path, cache);
  await saving;
}

let refreshTimer = null;
let dirtyPaths = new Set();
let refreshWaiters = [];

// batches refreshes so tapping through a few days re-renders the pages once
// instead of once per tap. every caller gets a promise that settles when the
// batch is done, so the worker stays alive until it is.
function scheduleRefresh(paths) {
  paths.forEach((p) => dirtyPaths.add(p));
  const done = new Promise((resolve) => refreshWaiters.push(resolve));

  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(async () => {
    const batch = [...dirtyPaths];
    const waiters = refreshWaiters;
    dirtyPaths = new Set();
    refreshWaiters = [];
    try {
      for (const p of batch) await ensureFresh(p, 0);
    } catch {
      // the old copy stays, which is fine
    } finally {
      waiters.forEach((resolve) => resolve());
    }
  }, ACTION_REFRESH_DELAY_MS);

  return done;
}
