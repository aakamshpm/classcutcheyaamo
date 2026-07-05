import { isWeekend } from "./date";
import { KERALA_HOLIDAY_MAP } from "./kerala-holidays";

export type DayStatus = "present" | "absent" | "holiday";
export type MarkedDay = { date: string; status: DayStatus };

export type AttendanceStats = {
  workingDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number | null; // null when there are 0 working days yet
  // how many more days you can safely miss and stay at/above 75%
  safeToBunk: number;
  // how many more days in a row you'd need to attend to climb back to 75%
  // (only meaningful when currently below threshold)
  needToAttend: number;
};

const THRESHOLD = 0.75;

function defaultStatus(dateISO: string): DayStatus | null {
  if (isWeekend(dateISO)) return "holiday";
  if (KERALA_HOLIDAY_MAP.has(dateISO)) return "holiday";
  return null;
}

// walks every calendar day from start to end (inclusive), applying explicit
// marks where present and falling back to weekend/holiday defaults
// otherwise. unmarked regular days simply don't count as working days yet
// (mirrors "don't ask me total working days, i'll mark as i go").
export function computeAttendanceStats(
  startDate: string,
  endDateExclusive: string, // the last day to count, inclusive
  marks: MarkedDay[],
): AttendanceStats {
  const markMap = new Map(marks.map((m) => [m.date, m.status]));

  let cursor = startDate;
  let workingDays = 0;
  let presentDays = 0;
  let absentDays = 0;

  while (cursor <= endDateExclusive) {
    const status = markMap.get(cursor) ?? defaultStatus(cursor);
    if (status === "present") {
      workingDays++;
      presentDays++;
    } else if (status === "absent") {
      workingDays++;
      absentDays++;
    }
    // holiday or null (unmarked) -> doesn't count towards working days

    const next = new Date(cursor + "T00:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    cursor = next.toISOString().slice(0, 10);
  }

  const percentage = workingDays === 0 ? null : presentDays / workingDays;

  // safe to bunk: largest n such that presentDays / (workingDays + n) >= 0.75
  // solved for n: n <= presentDays / 0.75 - workingDays
  let safeToBunk = 0;
  if (workingDays > 0) {
    safeToBunk = Math.max(
      0,
      Math.floor(presentDays / THRESHOLD - workingDays),
    );
  }

  // need to attend: smallest n such that (presentDays + n) / (workingDays + n) >= 0.75
  // solved for n: n >= (0.75 * workingDays - presentDays) / (1 - 0.75)
  let needToAttend = 0;
  if (workingDays > 0 && (percentage ?? 1) < THRESHOLD) {
    needToAttend = Math.max(
      0,
      Math.ceil((THRESHOLD * workingDays - presentDays) / (1 - THRESHOLD)),
    );
  }

  return {
    workingDays,
    presentDays,
    absentDays,
    percentage,
    safeToBunk,
    needToAttend,
  };
}
