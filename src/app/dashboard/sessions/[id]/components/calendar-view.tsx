"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  AlertIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  HalfIcon,
} from "@/app/components/icons";
import {
  computeAttendanceStats,
  type AttendanceStats,
  type DayStatus,
} from "@/lib/attendance";
import {
  addDaysISO,
  addMonths,
  getMonthMatrix,
  isWeekend,
  monthLabel,
  parseISODate,
  todayISO,
  toISODate,
} from "@/lib/date";
import { KERALA_HOLIDAY_MAP } from "@/lib/kerala-holidays";
import {
  CHIP,
  plural,
  toneFor,
  toPercent,
  TONE_COLOR,
  verdict,
} from "@/lib/semester-status";
import { showToast } from "@/lib/toast";
import { useOnlineStatus } from "@/lib/use-online-status";
import { clearDayStatus, saveDay } from "../actions";
import { DayEditor, type DayState } from "./day-editor";

export type CalendarMark = {
  date: string;
  status: DayStatus;
  note: string | null;
};

// monday first, same as the week strip on home
const WEEKDAY_LABELS = ["mo", "tu", "we", "th", "fr", "sa", "su"];

// what a day looks like before any explicit mark is applied
function defaultStatus(dateISO: string): DayStatus | null {
  if (isWeekend(dateISO) || KERALA_HOLIDAY_MAP.has(dateISO)) return "holiday";
  return null;
}

const TONE: Record<DayStatus, string> = {
  present: "present",
  absent: "absent",
  half_day: "half",
  holiday: "holiday",
};

function StatusGlyph({ status }: { status: DayStatus | null }) {
  switch (status) {
    case "present":
      return <CheckIcon className="h-3 w-3" />;
    case "absent":
      return <CloseIcon className="h-3 w-3" />;
    case "half_day":
      return <HalfIcon className="h-3 w-3" />;
    default:
      return <span className="h-3 w-3" />;
  }
}

function statsFor(
  startDate: string,
  upTo: string,
  list: CalendarMark[],
  required: number,
): AttendanceStats | null {
  if (startDate > upTo) return null;
  return computeAttendanceStats(startDate, upTo, list, required);
}

export function CalendarView({
  semesterId,
  startDate,
  endDate,
  requiredPercentage,
  marks: savedMarks,
}: {
  semesterId: string;
  startDate: string;
  endDate: string | null;
  requiredPercentage: number;
  marks: CalendarMark[];
}) {
  const online = useOnlineStatus();
  const today = todayISO();
  const notStartedYet = startDate > today;
  // nothing past today (or past the end of a finished semester) can be marked
  const maxSelectable = endDate && endDate < today ? endDate : today;
  const statsUpTo = endDate ?? today;

  // land on today's month if it's inside the semester, else the nearest edge
  const landingISO =
    startDate <= today && today <= maxSelectable
      ? today
      : notStartedYet
        ? startDate
        : (endDate ?? startDate);
  const landing = parseISODate(landingISO);

  const [year, setYear] = useState(landing.getUTCFullYear());
  const [month, setMonth] = useState(landing.getUTCMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // shows a save right away and falls back to the server copy once it lands
  const [marks, applyMark] = useOptimistic<
    CalendarMark[],
    { date: string; mark: { status: DayStatus; note: string | null } | null }
  >(savedMarks, (current, change) => {
    const rest = current.filter((m) => m.date !== change.date);
    return change.mark ? [...rest, { date: change.date, ...change.mark }] : rest;
  });
  const markMap = useMemo(
    () => new Map(marks.map((m) => [m.date, m])),
    [marks],
  );

  const stats = useMemo(
    () => statsFor(startDate, statsUpTo, marks, requiredPercentage),
    [startDate, statsUpTo, marks, requiredPercentage],
  );

  // the semester stats as if this day had the given status
  function simulate(date: string, status: DayStatus) {
    const rest = marks.filter((m) => m.date !== date);
    return statsFor(
      startDate,
      statsUpTo,
      [...rest, { date, status, note: null }],
      requiredPercentage,
    );
  }

  const tone = stats ? toneFor(stats, requiredPercentage) : null;

  // the visible month, limited to the days that count
  const monthStart = toISODate(new Date(Date.UTC(year, month, 1)));
  const monthEnd = toISODate(new Date(Date.UTC(year, month + 1, 0)));
  const from = monthStart < startDate ? startDate : monthStart;
  const to = monthEnd > maxSelectable ? maxSelectable : monthEnd;
  const monthStats =
    from <= to
      ? computeAttendanceStats(from, to, marks, requiredPercentage)
      : null;
  let monthHolidays = 0;
  if (from <= to) {
    for (let d = from; d <= to; d = addDaysISO(d, 1)) {
      if ((markMap.get(d)?.status ?? defaultStatus(d)) === "holiday") {
        monthHolidays++;
      }
    }
  }

  function goToMonth(delta: number) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function dayState(date: string): DayState {
    const mark = markMap.get(date);
    return {
      status: mark?.status ?? defaultStatus(date),
      explicit: mark !== undefined,
      note: mark?.note ?? "",
    };
  }

  function subtitleFor(date: string): string | null {
    const name = KERALA_HOLIDAY_MAP.get(date);
    const mark = markMap.get(date);
    if (name) return `${name}, kerala calendar holiday`;
    if (mark?.status === "holiday") return "a holiday you added";
    return date === today ? "today" : null;
  }

  function save(date: string, status: DayStatus, note: string) {
    setSelected(null);
    startTransition(async () => {
      applyMark({ date, mark: { status, note: note.trim() || null } });
      try {
        await saveDay(semesterId, date, status, note);
        showToast("saved");
      } catch {
        showToast("couldn't save, try again", "error");
      }
    });
  }

  function clear(date: string) {
    setSelected(null);
    startTransition(async () => {
      applyMark({ date, mark: null });
      try {
        await clearDayStatus(semesterId, date);
        showToast("day cleared");
      } catch {
        showToast("couldn't clear, try again", "error");
      }
    });
  }

  const weeks = getMonthMatrix(year, month, true);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_auto_1fr] lg:items-start">
      <section
        className="card p-5 lg:col-start-2 lg:row-start-1"
        aria-label="attendance status"
      >
        {notStartedYet ? (
          <p className="text-sm text-muted">
            this semester starts on{" "}
            <span className="font-medium text-foreground">{startDate}</span>,
            there&apos;s nothing to mark until then
          </p>
        ) : stats && stats.percentage !== null && tone ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  attendance
                </p>
                <p
                  className="tnum mt-1 text-5xl font-semibold tracking-tight"
                  style={{ color: TONE_COLOR[tone] }}
                >
                  {toPercent(stats.percentage)}%
                </p>
              </div>
              <span className={CHIP[tone].className}>{CHIP[tone].label}</span>
            </div>
            <p className="tnum mt-1 text-sm text-muted">
              {stats.presentDays} present / {stats.workingDays} working days
              {stats.halfDays > 0 &&
                ` (incl. ${plural(stats.halfDays, "half day")})`}
            </p>
            <div className="gold-rule mt-4 w-16" />
            <p className="mt-3 text-sm">
              {verdict(
                tone,
                stats.safeToBunk,
                stats.needToAttend,
                requiredPercentage,
              )}
            </p>
            {stats.unmarkedDays > 0 && (
              <p className="notice notice-warn mt-4">
                <AlertIcon className="h-4 w-4" />
                <span>
                  {plural(stats.unmarkedDays, "day")} up to today{" "}
                  {stats.unmarkedDays === 1 ? "isn't" : "aren't"} marked, so{" "}
                  {stats.unmarkedDays === 1 ? "it's" : "they're"} not in the
                  percentage yet
                </span>
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            no working days marked yet. tap a day on the calendar to get
            started.
          </p>
        )}
      </section>

      <section
        className="card p-5 lg:col-start-1 lg:row-span-3 lg:row-start-1"
        aria-label="calendar"
      >
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="previous month"
            className="-ml-2 flex h-12 w-12 items-center justify-center rounded-full text-muted hover:bg-status-holiday-bg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold lowercase" aria-live="polite">
            {monthLabel(year, month)}
          </h2>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="next month"
            className="-mr-2 flex h-12 w-12 items-center justify-center rounded-full text-muted hover:bg-status-holiday-bg"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {weeks.flat().map((dateISO, i) => {
            if (!dateISO) return <div key={i} />;

            const weekend = isWeekend(dateISO);
            const outside = dateISO < startDate || dateISO > maxSelectable;
            const markable = !outside && !weekend;
            const mark = markMap.get(dateISO);
            const status = mark?.status ?? defaultStatus(dateISO);
            const tint = status ? TONE[status] : null;
            const isToday = dateISO === today;
            const isSelected = dateISO === selected;
            const dayNum = parseISODate(dateISO).getUTCDate();

            const label = [
              new Date(dateISO + "T00:00:00Z").toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }),
              outside
                ? dateISO < startDate
                  ? "before the semester"
                  : "not reached yet"
                : status === "half_day"
                  ? "half day"
                  : status
                    ? status === "holiday"
                      ? "no class"
                      : status
                    : "not marked",
              mark?.note ? `note: ${mark.note}` : null,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <button
                key={dateISO}
                type="button"
                disabled={!markable}
                aria-label={label}
                aria-pressed={isSelected}
                aria-current={isToday ? "date" : undefined}
                onClick={() => setSelected(dateISO)}
                className={`relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-control)] border text-sm font-medium transition-colors ${
                  isSelected ? "outline-2 outline-offset-2 outline-foreground" : ""
                } ${markable ? "hover:brightness-95" : ""} ${
                  outside ? "opacity-35" : ""
                }`}
                style={{
                  background: tint && !outside ? `var(--status-${tint}-bg)` : "transparent",
                  color: tint ? `var(--status-${tint})` : "var(--muted)",
                  borderColor: isToday
                    ? "var(--primary)"
                    : tint && !outside
                      ? "transparent"
                      : "var(--card-border)",
                  borderWidth: isToday ? 2 : 1,
                }}
              >
                <span className="tnum leading-none">{dayNum}</span>
                {outside ? <span className="h-3 w-3" /> : <StatusGlyph status={status} />}
                {mark?.note && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold"
                  />
                )}
              </button>
            );
          })}
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <Legend tone="present" label="present" />
          <Legend tone="half" label="half day" />
          <Legend tone="absent" label="absent" />
          <Legend tone="holiday" label="holiday / weekend" />
          <li className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold" />
            has a note
          </li>
        </ul>
        {pending && <p className="mt-3 text-xs text-muted">saving...</p>}
      </section>

      <section
        className="card p-5 lg:col-start-2 lg:row-start-2"
        aria-labelledby="month-heading"
      >
        <h2 id="month-heading" className="text-lg font-semibold lowercase">
          {monthLabel(year, month)} log
        </h2>
        {monthStats ? (
          <>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <Tally label="present" value={monthStats.presentDays} tone="present" />
              <Tally label="absent" value={monthStats.absentDays} tone="absent" />
              <Tally label="holidays" value={monthHolidays} tone="holiday" />
            </dl>
            <p className="tnum mt-3 text-sm text-muted">
              {monthStats.percentage === null
                ? "no working days marked this month"
                : `attendance this month ${toPercent(monthStats.percentage)}%`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">
            nothing to count in this month
          </p>
        )}
      </section>

      {selected ? (
        <DayEditor
          key={selected}
          date={selected}
          subtitle={subtitleFor(selected)}
          current={dayState(selected)}
          required={requiredPercentage}
          before={stats}
          simulate={(status) => simulate(selected, status)}
          online={online}
          saving={pending}
          onSave={(status, note) => save(selected, status, note)}
          onClear={() => clear(selected)}
          onClose={() => setSelected(null)}
        />
      ) : (
        <p className="card hidden p-5 text-sm text-muted lg:col-start-2 lg:row-start-3 lg:block">
          pick a day to mark it, add a note or see what it does to your
          attendance
        </p>
      )}
    </div>
  );
}

function Legend({ tone, label }: { tone: string; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-sm"
        style={{ background: `var(--status-${tone})` }}
      />
      {label}
    </li>
  );
}

function Tally({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div
      className="rounded-[var(--radius-control)] p-3"
      style={{ background: `var(--status-${tone}-bg)` }}
    >
      <dt className="text-xs" style={{ color: `var(--status-${tone})` }}>
        {label}
      </dt>
      <dd className="tnum mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}
