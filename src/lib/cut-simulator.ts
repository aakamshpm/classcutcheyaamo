import {
  computeAttendanceStats,
  type AttendanceStats,
  type MarkedDay,
} from "./attendance";
import { addDaysISO, isWeekend } from "./date";
import { KERALA_HOLIDAY_MAP } from "./kerala-holidays";

export type Scenario = "skip" | "attend";

// a month of class days is plenty, and keeps the walk below cheap
export const MAX_SIMULATED_DAYS = 30;

// the next `count` days on which there is class: not a weekend, not a kerala
// holiday and not already marked (a marked day is whatever the user said)
export function upcomingClassDays(
  from: string,
  count: number,
  marked: Set<string>,
): string[] {
  const days: string[] = [];
  let cursor = from;
  while (days.length < count) {
    if (
      !isWeekend(cursor) &&
      !KERALA_HOLIDAY_MAP.has(cursor) &&
      !marked.has(cursor)
    ) {
      days.push(cursor);
    }
    cursor = addDaysISO(cursor, 1);
  }
  return days;
}

export type Simulation = {
  days: string[]; // the class days the scenario covers, in order
  before: AttendanceStats;
  after: AttendanceStats;
};

// runs the real stats on a hypothetical: skip (absent) or attend (present)
// the next `count` class days. nothing is saved, the marks are only copied.
export function simulate(
  startDate: string,
  today: string,
  marks: MarkedDay[],
  requiredPercentage: number,
  scenario: Scenario,
  count: number,
): Simulation {
  const before = computeAttendanceStats(
    startDate,
    today,
    marks,
    requiredPercentage,
  );
  if (count <= 0) return { days: [], before, after: before };

  // a semester that hasn't started has nothing before its first day
  const from = today < startDate ? startDate : today;
  const marked = new Set(marks.map((m) => m.date));
  const days = upcomingClassDays(from, count, marked);

  const status = scenario === "skip" ? "absent" : "present";
  const after = computeAttendanceStats(
    startDate,
    days[days.length - 1],
    [...marks, ...days.map((date) => ({ date, status }) as MarkedDay)],
    requiredPercentage,
  );
  return { days, before, after };
}
