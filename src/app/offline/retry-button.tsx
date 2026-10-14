"use client";

// reload rather than navigate: the service worker serves this page at
// whatever url you asked for, so reloading retries exactly that page
export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="btn-primary px-6 py-3 text-sm"
    >
      try again
    </button>
  );
}
