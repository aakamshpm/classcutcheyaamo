"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// a thin progress bar at the top of the page, shown while navigating
// between pages. starts as soon as an internal link is clicked, and
// finishes once the new route has actually rendered (pathname/search
// params changed).
export function TopLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickleInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // whenever the route actually changes, finish and hide the bar
  useEffect(() => {
    if (!visible) return;

    if (trickleInterval.current) clearInterval(trickleInterval.current);
    setProgress(100);

    hideTimeout.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    function isInternalNavClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return false;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return false;
      if (anchor.target && anchor.target !== "_self") return false;
      if (anchor.hasAttribute("download")) return false;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return false;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        // same page, just a hash or identical path+search — nothing to load
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return false;
        }
      } catch {
        return false;
      }

      return true;
    }

    function handleClick(e: MouseEvent) {
      if (!isInternalNavClick(e)) return;

      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      setVisible(true);
      setProgress(15);

      if (trickleInterval.current) clearInterval(trickleInterval.current);
      trickleInterval.current = setInterval(() => {
        setProgress((p) => (p < 80 ? p + (80 - p) * 0.1 : p));
      }, 200);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (trickleInterval.current) clearInterval(trickleInterval.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 z-50 h-[3px] w-full bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
