import type { AttendanceStats } from "./attendance";

// how a semester is doing relative to its own threshold (not a fixed 75%):
// below it is danger, at it with at most one cut to spare is edge, else safe
export type Tone = "safe" | "edge" | "danger";

export function toneFor(
  stats: AttendanceStats,
  requiredPercentage: number,
): Tone | null {
  if (stats.percentage === null) return null;
  if (stats.percentage < requiredPercentage / 100) return "danger";
  if (stats.safeToBunk <= 1) return "edge";
  return "safe";
}

// a semester with an end date still runs until that day has passed
export function isRunning(endDate: string | null, today: string): boolean {
  return endDate === null || endDate >= today;
}

export const TONE_COLOR: Record<Tone, string> = {
  safe: "var(--status-present)",
  edge: "var(--status-half)",
  danger: "var(--status-absent)",
};

// one decimal place, e.g. 0.82437 -> 82.4
export function toPercent(fraction: number): number {
  return Math.round(fraction * 1000) / 10;
}

export const CHIP: Record<Tone, { className: string; label: string }> = {
  safe: { className: "chip chip-safe", label: "safe aanu" },
  edge: { className: "chip chip-edge", label: "edge-il aanu" },
  danger: { className: "chip chip-danger", label: "pani paalum" },
};

export function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// the one-line plain-english read on where a semester stands
export function verdict(
  tone: Tone,
  safeToBunk: number,
  needToAttend: number,
  required: number,
) {
  if (tone === "danger") {
    return `attend the next ${plural(needToAttend, "day")} in a row to get back to ${required}%`;
  }
  if (safeToBunk === 0) {
    return `no cuts left, one more absence and you're below ${required}%`;
  }
  return `you can skip ${plural(safeToBunk, "more day")} and stay at ${required}%+`;
}
