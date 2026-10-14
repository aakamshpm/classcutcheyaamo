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

export const TONE_COLOR: Record<Tone, string> = {
  safe: "var(--status-present)",
  edge: "var(--status-half)",
  danger: "var(--status-absent)",
};

// one decimal place, e.g. 0.82437 -> 82.4
export function toPercent(fraction: number): number {
  return Math.round(fraction * 1000) / 10;
}
