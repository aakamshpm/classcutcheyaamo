import { type AttendanceStats } from "@/lib/api";
import { type ThemeColors } from "@/constants/theme";

// shared display helpers so the dashboard and the (upcoming) detail screen
// format percentages the exact same way the website does.

export function formatPercent(pct: number): string {
  // one decimal place, matching the web app (e.g. 62.5)
  return `${Math.round(pct * 1000) / 10}%`;
}

// teal when safe (at/above required), pink/red when below — mirrors the
// web app's safe/unsafe coloring
export function percentColor(
  pct: number,
  requiredPercentage: number,
  theme: ThemeColors,
): string {
  return pct >= requiredPercentage / 100
    ? theme.statusPresent
    : theme.statusAbsent;
}

// short human line about where you stand, same logic as the web summary
export function statusLine(
  stats: AttendanceStats,
  requiredPercentage: number,
): string {
  if (stats.percentage === null) return "nothing marked yet";
  const isSafe = stats.percentage >= requiredPercentage / 100;
  if (isSafe) {
    if (stats.safeToBunk > 0) {
      return `can miss ${stats.safeToBunk} more day${
        stats.safeToBunk === 1 ? "" : "s"
      }`;
    }
    return `right at ${requiredPercentage}%, don't miss more`;
  }
  return `attend ${stats.needToAttend} day${
    stats.needToAttend === 1 ? "" : "s"
  } to recover`;
}
