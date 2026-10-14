// shared bits for the offline (read-only) support. the service worker in
// public/sw.js is plain js and can't import this, so the cache name prefix
// is duplicated there on purpose — keep them in sync.

export const PAGES_CACHE_PREFIX = "cc-pages";
export const CACHED_AT_HEADER = "x-cc-cached-at";

// the saved dashboard pages hold one user's attendance data, so they must not
// outlive the session. called on logout.
export async function clearOfflineData() {
  if (typeof caches === "undefined") return;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith(PAGES_CACHE_PREFIX))
      .map((key) => caches.delete(key)),
  );
}
