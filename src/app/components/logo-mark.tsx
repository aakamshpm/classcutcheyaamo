// the app icon's glyph (attendance ring at 75% with a check) on a soft tile.
// same drawing as src/lib/pwa-icon.tsx, kept in the theme colours here so it
// follows dark mode
export function LogoMark({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-2xl bg-status-present-bg ${className}`}
    >
      <svg viewBox="0 0 100 100" className="h-3/5 w-3/5">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="var(--primary)"
          strokeOpacity="0.25"
          strokeWidth="9"
        />
        <path
          d="M 50 10 A 40 40 0 1 1 10 50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M 35 51 L 46 62 L 66 39"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
