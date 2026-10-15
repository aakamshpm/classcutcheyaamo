"use client";

import { useMemo, useState } from "react";
import { AlertIcon, MinusIcon, PlusIcon } from "@/app/components/icons";
import type { MarkedDay } from "@/lib/attendance";
import {
  MAX_SIMULATED_DAYS,
  simulate,
  type Scenario,
} from "@/lib/cut-simulator";
import {
  CHIP,
  plural,
  toneFor,
  toPercent,
  TONE_COLOR,
  verdict,
} from "@/lib/semester-status";
import { AttendanceRing } from "../../components/attendance-ring";

export type SimulatorSemester = {
  id: string;
  name: string;
  startDate: string;
  requiredPercentage: number;
  marks: MarkedDay[];
};

// how many one-tap steps the ladder shows
const LADDER_STEPS = 10;

const SCENARIOS: { value: Scenario; label: string; tone: string }[] = [
  { value: "skip", label: "skip", tone: "absent" },
  { value: "attend", label: "attend", tone: "present" },
];

function formatDay(dateISO: string) {
  return new Date(dateISO + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// try out skipping or attending the next few class days and see where the
// percentage lands. runs the same stats as the rest of the app on a copy of
// the marks, so nothing here is saved.
export function SimulatorView({
  today,
  semesters,
}: {
  today: string;
  semesters: SimulatorSemester[];
}) {
  const [selectedId, setSelectedId] = useState(semesters[0].id);
  const [scenario, setScenario] = useState<Scenario>("skip");
  const [count, setCount] = useState(1);

  const semester = semesters.find((s) => s.id === selectedId) ?? semesters[0];
  const required = semester.requiredPercentage;

  const result = useMemo(
    () =>
      simulate(
        semester.startDate,
        today,
        semester.marks,
        required,
        scenario,
        count,
      ),
    [semester, today, required, scenario, count],
  );

  const ladder = useMemo(
    () =>
      Array.from({ length: LADDER_STEPS }, (_, i) => {
        const n = i + 1;
        const { after } = simulate(
          semester.startDate,
          today,
          semester.marks,
          required,
          scenario,
          n,
        );
        return {
          n,
          percent: after.percentage === null ? null : toPercent(after.percentage),
          tone: toneFor(after, required),
        };
      }),
    [semester, today, required, scenario],
  );

  const { before, after, days } = result;
  const beforePercent =
    before.percentage === null ? null : toPercent(before.percentage);
  const afterPercent =
    after.percentage === null ? null : toPercent(after.percentage);
  const tone = toneFor(after, required);
  const delta =
    beforePercent !== null && afterPercent !== null
      ? Math.round((afterPercent - beforePercent) * 10) / 10
      : null;

  // the one number worth jumping straight to for the current scenario
  const shortcut =
    scenario === "skip"
      ? { count: before.safeToBunk, label: "most i can skip" }
      : { count: before.needToAttend, label: "to get back to the line" };
  const shortcutCount = Math.min(shortcut.count, MAX_SIMULATED_DAYS);

  const verb = scenario === "skip" ? "skipping" : "attending";

  return (
    <div>
      {semesters.length > 1 && (
        <div
          role="tablist"
          aria-label="active semesters"
          className="mb-4 flex flex-wrap gap-2"
        >
          {semesters.map((s) => {
            const active = s.id === semester.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedId(s.id)}
                className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-status-present-bg text-primary"
                    : "border-card-border bg-card text-muted"
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <section
          className="card p-5 lg:col-start-1"
          aria-labelledby="scenario-heading"
        >
          <h2 id="scenario-heading" className="text-lg font-semibold">
            what if i…
          </h2>

          <div
            role="radiogroup"
            aria-label="skip or attend"
            className="mt-3 grid grid-cols-2 gap-2"
          >
            {SCENARIOS.map((o) => {
              const active = scenario === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setScenario(o.value)}
                  className="flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border text-sm font-semibold transition-colors"
                  style={
                    active
                      ? {
                          background: `var(--status-${o.tone}-bg)`,
                          color: `var(--status-${o.tone})`,
                          borderColor: `var(--status-${o.tone})`,
                        }
                      : {
                          background: "var(--card)",
                          borderColor: "var(--card-border)",
                        }
                  }
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-sm text-muted">the next</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label="one less day"
              disabled={count <= 0}
              onClick={() => setCount((c) => Math.max(0, c - 1))}
              className="btn-secondary w-12 disabled:opacity-40"
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="tnum text-5xl font-semibold tracking-tight">
                {count}
              </p>
              <p className="text-sm text-muted">
                class {count === 1 ? "day" : "days"}
              </p>
            </div>
            <button
              type="button"
              aria-label="one more day"
              disabled={count >= MAX_SIMULATED_DAYS}
              onClick={() =>
                setCount((c) => Math.min(MAX_SIMULATED_DAYS, c + 1))
              }
              className="btn-secondary w-12 disabled:opacity-40"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={MAX_SIMULATED_DAYS}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            aria-label="number of class days"
            className="mt-4 h-12 w-full accent-primary"
          />

          {shortcutCount > 0 && (
            <button
              type="button"
              onClick={() => setCount(shortcutCount)}
              className="btn-secondary mt-1 w-full text-sm"
            >
              {shortcut.label}: {plural(shortcutCount, "day")}
            </button>
          )}
        </section>

        <section
          className="card p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          aria-label="result"
        >
          <p className="sr-only" aria-live="polite">
            {count === 0
              ? "no days selected"
              : `${verb} ${plural(count, "class day")}: ${beforePercent ?? "no"}% to ${afterPercent ?? "no"}%`}
          </p>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{semester.name}</h2>
              <p className="text-sm text-muted">needs {required}%</p>
            </div>
            {tone && (
              <span className={CHIP[tone].className}>{CHIP[tone].label}</span>
            )}
          </div>

          <div className="mt-5">
            <AttendanceRing
              percent={afterPercent}
              required={required}
              tone={tone}
              animate={false}
              caption={count === 0 ? "right now" : `after ${verb}`}
            />
          </div>

          <p className="tnum mt-4 text-center text-sm text-muted">
            {beforePercent === null ? "--" : `${beforePercent}%`}
            {" → "}
            <span
              className="font-semibold"
              style={{ color: tone ? TONE_COLOR[tone] : undefined }}
            >
              {afterPercent === null ? "--" : `${afterPercent}%`}
            </span>
            {delta !== null && delta !== 0 && (
              <span className="ml-2">
                ({delta > 0 ? "+" : ""}
                {delta}%)
              </span>
            )}
          </p>

          <div className="gold-rule mx-auto mt-4 w-16" />
          <p className="mt-4 text-center text-sm">
            {tone
              ? `${count === 0 ? "" : "after that, "}${verdict(
                  tone,
                  after.safeToBunk,
                  after.needToAttend,
                  required,
                )}`
              : "mark a few days to see where you stand"}
          </p>

          {days.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                the days this covers
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {days.map((d) => (
                  <li
                    key={d}
                    className="rounded-full bg-status-holiday-bg px-2.5 py-1 text-xs lowercase"
                  >
                    {formatDay(d)}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">
                weekends and holidays are left out
              </p>
            </div>
          )}

          {before.percentage === null && (
            <p className="notice mt-4">
              nothing is marked yet, so this starts from zero
            </p>
          )}
          {before.unmarkedDays > 0 && (
            <p className="notice notice-warn mt-4">
              <AlertIcon className="h-4 w-4" />
              <span>
                {plural(before.unmarkedDays, "day")} up to today{" "}
                {before.unmarkedDays === 1 ? "isn't" : "aren't"} marked, so{" "}
                {before.unmarkedDays === 1 ? "it's" : "they're"} not counted
                here
              </span>
            </p>
          )}
        </section>

        <section
          className="card p-5 lg:col-start-1"
          aria-labelledby="ladder-heading"
        >
          <h2 id="ladder-heading" className="text-lg font-semibold">
            {scenario === "skip" ? "how far can i go" : "how fast do i recover"}
          </h2>
          <p className="text-sm text-muted">
            {scenario === "skip" ? "skipping" : "attending"} this many class
            days in a row. tap one to try it.
          </p>
          <ul className="mt-3 grid grid-cols-5 gap-2">
            {ladder.map((row) => (
              <li key={row.n}>
                <button
                  type="button"
                  aria-pressed={row.n === count}
                  aria-label={`${plural(row.n, "day")}: ${row.percent ?? "no"}%`}
                  onClick={() => setCount(row.n)}
                  className="flex min-h-14 w-full flex-col items-center justify-center rounded-[var(--radius-control)] border"
                  style={{
                    background: row.tone
                      ? `var(--status-${TONE_VAR[row.tone]}-bg)`
                      : "var(--card)",
                    borderColor:
                      row.n === count
                        ? "var(--foreground)"
                        : "var(--card-border)",
                  }}
                >
                  <span className="tnum text-xs text-muted">{row.n}</span>
                  <span
                    className="tnum text-sm font-semibold"
                    style={{
                      color: row.tone ? TONE_COLOR[row.tone] : undefined,
                    }}
                  >
                    {row.percent === null ? "--" : `${row.percent}%`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            green stays safe, amber is right at the line, red drops below{" "}
            {required}%
          </p>
        </section>
      </div>
    </div>
  );
}

// tone name -> the --status-* variable it is drawn with
const TONE_VAR = { safe: "present", edge: "half", danger: "absent" } as const;
