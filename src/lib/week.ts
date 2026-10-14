import { addDaysISO, isWeekend, parseISODate } from "./date";
import { KERALA_HOLIDAY_MAP } from "./kerala-holidays";
import type { DayStatus } from "./attendance";

export type WeekDay = {
  date: string;
  label: string;
  dayNum: number;
  // null when it's a regular day nobody has marked
  status: DayStatus | null;
  isToday: boolean;
  // outside the semester, or a day that hasn't happened yet
  inactive: boolean;
};

const LABELS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

// monday to sunday of the week containing `today`
export function currentWeek(
  today: string,
  startDate: string,
  endDate: string | null,
  marks: { date: string; status: DayStatus }[],
): WeekDay[] {
  const markMap = new Map(marks.map((m) => [m.date, m.status]));
  const dow = parseISODate(today).getUTCDay();
  const monday = addDaysISO(today, -((dow + 6) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDaysISO(monday, i);
    const d = parseISODate(date);
    const fallback: DayStatus | null =
      isWeekend(date) || KERALA_HOLIDAY_MAP.has(date) ? "holiday" : null;
    return {
      date,
      label: LABELS[d.getUTCDay()],
      dayNum: d.getUTCDate(),
      status: markMap.get(date) ?? fallback,
      isToday: date === today,
      inactive:
        date < startDate || date > today || (endDate !== null && date > endDate),
    };
  });
}
