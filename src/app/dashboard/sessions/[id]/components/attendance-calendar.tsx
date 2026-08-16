"use client";

import { useState, useTransition } from "react";
import {
  addMonths,
  getMonthMatrix,
  monthLabel,
  parseISODate,
  todayISO,
} from "@/lib/date";
import { KERALA_HOLIDAY_MAP } from "@/lib/kerala-holidays";
import { clearDayStatus, setDayStatus, type DayStatus } from "../actions";

type MarkedDay = { date: string; status: DayStatus };

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// what a day looks like before any explicit mark is applied
function defaultStatus(dateISO: string): DayStatus | null {
  const dow = parseISODate(dateISO).getUTCDay();
  if (dow === 0 || dow === 6) return "holiday"; // weekend
  if (KERALA_HOLIDAY_MAP.has(dateISO)) return "holiday";
  return null; // regular day, unmarked until the user says otherwise
}

// where a holiday came from. kerala holidays are seeded from the static list
// and have no db row of their own, so any explicit "holiday" mark on a date
// that isn't in that list must be one the user added themselves. derived
// rather than stored — no extra column needed.
type HolidaySource = "kerala" | "custom";

function holidaySource(
  dateISO: string,
  explicitStatus: DayStatus | undefined,
): HolidaySource {
  if (explicitStatus === "holiday" && !KERALA_HOLIDAY_MAP.has(dateISO)) {
    return "custom";
  }
  return "kerala";
}

// tailwind can't see these css vars at build time for arbitrary values in
// some setups, so status colors are applied via inline style instead of
// utility classes to guarantee they always match the design tokens
const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  present: { bg: "var(--status-present)", fg: "#ffffff" },
  absent: { bg: "var(--status-absent)", fg: "#ffffff" },
  half_day: { bg: "var(--status-half)", fg: "#ffffff" },
  holiday: { bg: "var(--status-holiday-bg)", fg: "var(--status-holiday)" },
  unmarked: { bg: "var(--card)", fg: "var(--muted)" },
};

export function AttendanceCalendar({
  semesterId,
  startDate,
  endDate,
  marks,
}: {
  semesterId: string;
  startDate: string;
  endDate: string | null;
  marks: MarkedDay[];
}) {
  const today = todayISO();
  const notStartedYet = startDate > today;

  // default to whichever month makes sense to land on: today's month if
  // today falls within the semester, otherwise the start (semester hasn't
  // begun yet) or end (semester already over) month
  const maxSelectableForDefault = endDate && endDate < today ? endDate : today;
  const defaultDateISO =
    startDate <= today && today <= maxSelectableForDefault
      ? today
      : notStartedYet
        ? startDate
        : (endDate ?? startDate);
  const defaultDate = parseISODate(defaultDateISO);

  const [year, setYear] = useState(defaultDate.getUTCFullYear());
  const [month, setMonth] = useState(defaultDate.getUTCMonth());
  const [isPending, startTransition] = useTransition();
  const [optimisticMarks, setOptimisticMarks] = useState<
    Map<string, DayStatus>
  >(new Map(marks.map((m) => [m.date, m.status])));

  const weeks = getMonthMatrix(year, month);
  const maxSelectable = endDate && endDate < today ? endDate : today;

  function goToMonth(delta: number) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function isWeekendDay(dateISO: string): boolean {
    const dow = parseISODate(dateISO).getUTCDay();
    return dow === 0 || dow === 6;
  }

  function handleDayClick(dateISO: string) {
    if (dateISO < startDate) return;
    if (dateISO > maxSelectable) return;
    if (isWeekendDay(dateISO)) return; // weekends are always off, not markable

    const current = optimisticMarks.get(dateISO) ?? defaultStatus(dateISO);

    // on a kerala-seed holiday the "holiday" state IS the cleared state (it's
    // derived from the static list, not stored), so including both "holiday"
    // and null in the cycle made the tap a silent no-op — it deleted a row
    // that never existed and the default re-derived straight back to holiday.
    // dropping "holiday" from the cycle lets you actually override the seed
    // list, with null cycling you back to the default holiday.
    const isSeedHoliday = defaultStatus(dateISO) === "holiday";
    const cycle: (DayStatus | null)[] = isSeedHoliday
      ? ["present", "half_day", "absent", null]
      : ["present", "half_day", "absent", "holiday", null];

    const currentIndex = cycle.indexOf(current);
    const next = cycle[(currentIndex + 1) % cycle.length];

    setOptimisticMarks((prev) => {
      const copy = new Map(prev);
      if (next === null) {
        copy.delete(dateISO);
      } else {
        copy.set(dateISO, next);
      }
      return copy;
    });

    startTransition(async () => {
      if (next === null) {
        await clearDayStatus(semesterId, dateISO);
      } else {
        await setDayStatus(semesterId, dateISO, next);
      }
    });
  }

  return (
    <div className="card p-5">
      {notStartedYet && (
        <p className="mb-4 rounded-lg bg-status-holiday-bg px-3 py-2 text-xs text-muted">
          this semester starts {startDate} — that date hasn&apos;t arrived
          yet, so there&apos;s nothing to mark until then.
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card-border"
        >
          ← prev
        </button>
        <p className="text-sm font-semibold">{monthLabel(year, month)}</p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-card-border"
        >
          next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weeks.flat().map((dateISO, i) => {
          if (!dateISO) return <div key={i} />;

          const weekend = isWeekendDay(dateISO);
          // a weekend inside the semester is a known holiday, not an unknown
          // future day — keep those two visually distinct. only dates outside
          // the semester window get the washed-out "nothing to see" treatment.
          const outsideWindow =
            dateISO < startDate || dateISO > maxSelectable;
          const notMarkable = outsideWindow || weekend;
          const explicitStatus = optimisticMarks.get(dateISO);
          const status = explicitStatus ?? defaultStatus(dateISO);
          const holidayName = KERALA_HOLIDAY_MAP.get(dateISO);
          const dayNum = parseISODate(dateISO).getUTCDate();
          const colors = STATUS_COLORS[status ?? "unmarked"];
          // only mark the dot on holidays you added yourself, so it's obvious
          // which ones are yours to remove vs which came from the seed list
          const isCustomHoliday =
            status === "holiday" &&
            !weekend &&
            holidaySource(dateISO, explicitStatus) === "custom";

          let title = holidayName;
          if (dateISO < startDate) title = "before the semester started";
          else if (dateISO > maxSelectable) title = "date not reached yet";
          else if (weekend) title = "weekend";
          else if (isCustomHoliday) title = "holiday you added — tap to remove";
          else if (holidayName && status === "holiday") {
            title = `${holidayName} (kerala calendar) — tap to override`;
          } else if (holidayName) {
            title = `${holidayName} (kerala calendar, overridden)`;
          }

          return (
            <button
              key={dateISO}
              type="button"
              disabled={notMarkable}
              title={title}
              onClick={() => handleDayClick(dateISO)}
              style={
                outsideWindow
                  ? undefined
                  : {
                      background: colors.bg,
                      color: colors.fg,
                      border:
                        status === null
                          ? "1px solid var(--card-border)"
                          : "none",
                    }
              }
              className={`relative aspect-square rounded-lg text-sm font-medium transition-transform ${
                outsideWindow
                  ? "cursor-default text-card-border"
                  : notMarkable
                    ? "cursor-default"
                    : "hover:scale-105"
              } ${
                dateISO === today
                  ? "ring-2 ring-offset-2 ring-offset-card ring-primary"
                  : ""
              }`}
            >
              {dayNum}
              {isCustomHoliday && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ background: "var(--status-holiday)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
        <LegendDot color="var(--status-present)" label="present" />
        <LegendDot color="var(--status-half)" label="half day" />
        <LegendDot color="var(--status-absent)" label="absent" />
        <LegendDot color="var(--status-holiday)" label="holiday / weekend" />
        <LegendDot color="var(--card-border)" label="unmarked" />
        <span className="flex items-center gap-1.5">
          <span
            className="relative h-3 w-3 rounded-sm"
            style={{ background: "var(--status-holiday-bg)" }}
          >
            <span
              className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
              style={{ background: "var(--status-holiday)" }}
            />
          </span>
          holiday you added
        </span>
      </div>

      {isPending && <p className="mt-2 text-xs text-muted">saving...</p>}
      <p className="mt-3 text-xs text-muted">
        tap a day to cycle through present → half day → absent → holiday →
        unmarked
      </p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-sm"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
