"use client";

import { useEffect, useState } from "react";
import { CACHED_AT_HEADER } from "@/lib/offline";
import { useOnlineStatus } from "@/lib/use-online-status";

// shown at the very top while there's no connection. the app is read-only
// offline: pages come from the service worker's cache, so nothing can be
// saved until the connection is back.
export function OfflineBanner() {
  const online = useOnlineStatus();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // flag the whole document and block form submits while offline, so every
  // form in the app (and any added later) is read-only without each one
  // having to know about it. capture phase so it runs before react's own
  // submit handling.
  useEffect(() => {
    if (online) {
      delete document.documentElement.dataset.offline;
      return;
    }
    document.documentElement.dataset.offline = "true";

    function blockSubmit(e: Event) {
      e.preventDefault();
      e.stopPropagation();
    }
    document.addEventListener("submit", blockSubmit, true);
    return () => document.removeEventListener("submit", blockSubmit, true);
  }, [online]);

  // find out how old the copy of this page is, so nobody mistakes it for live
  useEffect(() => {
    if (online || typeof caches === "undefined") return;
    let cancelled = false;
    caches
      .match(window.location.pathname, { ignoreVary: true })
      .then((res) => {
        const stamp = Number(res?.headers.get(CACHED_AT_HEADER));
        if (!cancelled && stamp) setSavedAt(stamp);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [online]);

  if (online) return null;

  const when = savedAt
    ? new Date(savedAt).toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      role="status"
      className="bg-status-half-bg px-4 py-2 text-center text-xs font-medium text-status-half"
    >
      you&apos;re offline
      {when ? ` · showing what was saved on ${when}` : ""}
      {" · "}changes can&apos;t be saved until you&apos;re back
    </div>
  );
}
