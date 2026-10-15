"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, type ToastTone } from "@/lib/toast";
import { AlertIcon, CheckIcon } from "./icons";

// how long a toast sits fully visible before it starts to fade, and how long
// that fade takes (matches .toast-out)
const VISIBLE_MS = 2000;
const FADE_MS = 250;

type Toast = { id: number; message: string; tone: ToastTone; leaving: boolean };

// slides in from the top, fades out after two seconds. one at a time: a new
// toast replaces the one on screen.
export function Toaster() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    let counter = 0;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    function clearTimers() {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    }

    const unsubscribe = subscribeToasts((message, tone) => {
      clearTimers();
      const id = ++counter;
      setToast({ id, message, tone, leaving: false });
      fadeTimer = setTimeout(
        () => setToast((t) => (t?.id === id ? { ...t, leaving: true } : t)),
        VISIBLE_MS,
      );
      removeTimer = setTimeout(
        () => setToast((t) => (t?.id === id ? null : t)),
        VISIBLE_MS + FADE_MS,
      );
    });

    return () => {
      unsubscribe();
      clearTimers();
    };
  }, []);

  // the live region stays mounted so screen readers pick up what is added
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top))]"
    >
      {toast && (
        <p
          key={toast.id}
          className={`${toast.leaving ? "toast-out" : "toast-in"} flex max-w-full items-center gap-2 rounded-full border border-card-border bg-card px-4 py-2.5 text-sm font-medium`}
          style={{
            color: toast.tone === "error" ? "var(--status-absent)" : undefined,
          }}
        >
          {toast.tone === "error" ? (
            <AlertIcon className="h-4 w-4 flex-none" />
          ) : (
            <CheckIcon className="h-4 w-4 flex-none text-primary" />
          )}
          {toast.message}
        </p>
      )}
    </div>
  );
}
