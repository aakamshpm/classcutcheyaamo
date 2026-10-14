"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// registers the service worker, and keeps the offline copy of the dashboard
// pages up to date. client-side navigation never makes a real page request,
// so the service worker can't see it — it has to be told which page you're on.
export function ServiceWorkerRegister() {
  const pathname = usePathname();

  useEffect(() => {
    // in dev, chunks aren't hashed and change constantly, so a cache-first
    // service worker would serve stale code. production only.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // the app works fine without it, just no offline
      });
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator) || !navigator.onLine) return;
    if (!pathname.startsWith("/dashboard")) return;

    navigator.serviceWorker.ready
      .then((reg) => reg.active?.postMessage({ type: "cache-page", url: pathname }))
      .catch(() => {});
  }, [pathname]);

  return null;
}
