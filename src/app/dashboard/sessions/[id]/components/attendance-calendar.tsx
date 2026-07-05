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

const STATUS_STYLES: Record<string, string> = {
  present: "bg-emerald-500 text-white",
  absent: "bg-red-500 text-white",
  holiday: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  unmarked:
    "bg-white text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700",
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
  const start = parseISODate(startDate);
  const [year, setYear] = useState(start.getUTCFullYear());
  const [month, setMonth] = useState(start.getUTCMonth());
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

  function handleDayClick(dateISO: string) {
    if (dateISO < startDate) return;
    if (dateISO > maxSelectable) return;

    const current = optimisticMarks.get(dateISO) ?? defaultStatus(dateISO);
    // cycle: unmarked -> present -> absent -> holiday -> unmarked
    const cycle: (DayStatus | null)[] = ["present", "absent", "holiday", null];
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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          className="rounded-md px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          ← prev
        </button>
        <p className="text-sm font-medium">{monthLabel(year, month)}</p>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          className="rounded-md px-3 py-1 text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((dateISO, i) => {
          if (!dateISO) return <div key={i} />;

          const outOfRange = dateISO < startDate || dateISO > maxSelectable;
          const explicitStatus = optimisticMarks.get(dateISO);
          const status = explicitStatus ?? defaultStatus(dateISO);
          const holidayName = KERALA_HOLIDAY_MAP.get(dateISO);
          const dayNum = parseISODate(dateISO).getUTCDate();

          return (
            <button
              key={dateISO}
              type="button"
              disabled={outOfRange}
              title={holidayName}
              onClick={() => handleDayClick(dateISO)}
              className={`aspect-square rounded-md text-sm transition-opacity ${
                outOfRange
                  ? "cursor-default text-zinc-300 dark:text-zinc-700"
                  : STATUS_STYLES[status ?? "unmarked"]
              } ${dateISO === today ? "ring-2 ring-offset-1 ring-zinc-900 dark:ring-zinc-50" : ""}`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
        <LegendDot className={STATUS_STYLES.present} label="present" />
        <LegendDot className={STATUS_STYLES.absent} label="absent" />
        <LegendDot className={STATUS_STYLES.holiday} label="holiday" />
        <LegendDot className={STATUS_STYLES.unmarked} label="unmarked" />
      </div>

      {isPending && <p className="mt-2 text-xs text-zinc-400">saving...</p>}
      <p className="mt-3 text-xs text-zinc-400">
        tap a day to cycle through present → absent → holiday → unmarked
      </p>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
