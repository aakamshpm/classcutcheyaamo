import { isWeekend } from "./date";
import { KERALA_HOLIDAY_MAP } from "./kerala-holidays";
import { type AttendanceStats, type DayStatus, type MarkedDay } from "./api";

// on-device port of the website's src/lib/attendance.ts so the percentage
// updates instantly as you tap, without a round-trip per mark. the server
// stays the source of truth (we still POST each change); this just keeps
// the ui live. must stay in sync with the web version.

function defaultStatus(dateISO: string): DayStatus | null {
  if (isWeekend(dateISO)) return "holiday";
  if (KERALA_HOLIDAY_MAP.has(dateISO)) return "holiday";
  return null;
}

export function computeAttendanceStats(
  startDate: string,
  endDateInclusive: string,
  marks: MarkedDay[],
  requiredPercentage: number = 75,
): AttendanceStats {
  const threshold = requiredPercentage / 100;
  const markMap = new Map(marks.map((m) => [m.date, m.status]));

  let cursor = startDate;
  let workingDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;
  let unmarkedDays = 0;

  while (cursor <= endDateInclusive) {
    const status = markMap.get(cursor) ?? defaultStatus(cursor);
    if (status === "present") {
      workingDays++;
      presentDays++;
    } else if (status === "absent") {
      workingDays++;
      absentDays++;
    } else if (status === "half_day") {
      workingDays++;
      presentDays += 0.5;
      halfDays++;
    } else if (status === null) {
      unmarkedDays++;
    }

    const next = new Date(cursor + "T00:00:00Z");
    next.setUTCDate(next.getUTCDate() + 1);
    cursor = next.toISOString().slice(0, 10);
  }

  const percentage = workingDays === 0 ? null : presentDays / workingDays;

  let safeToBunk = 0;
  if (workingDays > 0) {
    safeToBunk = Math.max(
      0,
      Math.floor(presentDays / threshold - workingDays),
    );
  }

  let needToAttend = 0;
  if (workingDays > 0 && (percentage ?? 1) < threshold) {
    needToAttend = Math.max(
      0,
      Math.ceil((threshold * workingDays - presentDays) / (1 - threshold)),
    );
  }

  return {
    workingDays,
    presentDays,
    absentDays,
    halfDays,
    percentage,
    safeToBunk,
    needToAttend,
    unmarkedDays,
  };
}
