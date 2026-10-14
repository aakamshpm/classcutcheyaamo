import type { Metadata } from "next";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "offline · classcutcheyaamo?",
  robots: { index: false },
};

// what the service worker shows when you open a page it hasn't saved while
// you're offline. precached on install, so it has to stay fully static.
export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="text-5xl">📡</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">you&apos;re offline</h1>
        <p className="max-w-sm text-sm text-muted">
          this page isn&apos;t saved on this device yet. open your dashboard
          once while you&apos;re online and your semesters will be available
          here next time.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}
