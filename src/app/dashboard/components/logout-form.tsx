"use client";

import { LogoutIcon } from "@/app/components/icons";
import { clearOfflineData } from "@/lib/offline";

// the logout action itself stays a server action passed in from the page.
// this only adds wiping the offline copies of the dashboard, so the next
// person on this device can't open them.
export function LogoutForm({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action} onSubmit={() => void clearOfflineData()}>
      <button
        type="submit"
        className="flex min-h-12 w-full items-center gap-3 rounded-[var(--radius-control)] px-1 text-left text-sm font-medium transition-colors hover:bg-status-holiday-bg"
      >
        <LogoutIcon className="h-5 w-5 text-muted" />
        log out
      </button>
    </form>
  );
}
