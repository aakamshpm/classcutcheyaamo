"use client";

import { clearOfflineData } from "@/lib/offline";

// the logout action itself stays a server action passed in from the page.
// this only adds wiping the offline copies of the dashboard, so the next
// person on this device can't open them.
export function LogoutForm({ action }: { action: () => Promise<void> }) {
  return (
    <form action={action} onSubmit={() => void clearOfflineData()}>
      <button type="submit" className="text-sm font-medium text-muted underline">
        log out
      </button>
    </form>
  );
}
