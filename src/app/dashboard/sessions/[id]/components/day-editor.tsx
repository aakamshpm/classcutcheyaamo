"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "@/app/components/icons";
import { STATUS_OPTIONS } from "@/app/dashboard/components/status-options";
import type { AttendanceStats, DayStatus } from "@/lib/attendance";
import { NOTE_MAX } from "@/lib/day-note";
import { CHIP, toneFor, toPercent, verdict } from "@/lib/semester-status";

export type DayState = {
  // what counts for the day right now: the explicit mark, or the weekend /
  // kerala-holiday default, or null for a regular day nobody has marked
  status: DayStatus | null;
  explicit: boolean;
  note: string;
};

// edits one day: status, an optional short note, and what the change would do
// to the semester percentage before it's saved. a bottom sheet on phones, a
// panel in the side column on wide screens.
export function DayEditor({
  date,
  subtitle,
  current,
  required,
  before,
  simulate,
  online,
  saving,
  onSave,
  onClear,
  onClose,
}: {
  date: string;
  subtitle: string | null;
  current: DayState;
  required: number;
  before: AttendanceStats | null;
  simulate: (status: DayStatus) => AttendanceStats | null;
  online: boolean;
  saving: boolean;
  onSave: (status: DayStatus, note: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<DayStatus | null>(current.status);
  const [note, setNote] = useState(current.note);
  // set while the sheet slides back down, right before it is removed
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noteId = useId();

  // phones play the slide-down first; wide screens show a plain panel (and
  // reduced motion skips animation), so those close straight away
  const requestClose = useCallback(() => {
    if (closing) return;
    const instant =
      window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant) {
      onClose();
      return;
    }
    setClosing(true);
    closeTimer.current = setTimeout(onClose, 200);
  }, [closing, onClose]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  const changed = status !== current.status || note.trim() !== current.note;
  const canSave = online && !saving && status !== null && changed;
  const after = status ? simulate(status) : null;

  return (
    <>
      {/* only phones get the dimmed backdrop, wide screens show a panel */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="close"
        onClick={requestClose}
        className={`${closing ? "backdrop-out" : "backdrop-in"} fixed inset-0 z-40 bg-foreground/30 lg:hidden`}
      />
      <section
        role="dialog"
        aria-labelledby="day-heading"
        className={`${closing ? "sheet-out" : "sheet-in"} fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[var(--radius)] border border-b-0 border-card-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:static lg:z-auto lg:mx-0 lg:max-h-none lg:max-w-none lg:rounded-[var(--radius)] lg:border-b lg:pb-5`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="day-heading"
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-semibold lowercase outline-none"
            >
              {new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              })}
            </h2>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="close"
            className="-mt-1 -mr-2 flex h-12 w-12 items-center justify-center rounded-full text-muted hover:bg-status-holiday-bg"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((o) => {
            const active = status === o.status;
            return (
              <button
                key={o.status}
                type="button"
                aria-pressed={active}
                disabled={!online}
                onClick={() => setStatus(o.status)}
                className="choice"
                style={
                  {
                    "--tone": `var(--status-${o.tone})`,
                    "--tone-bg": `var(--status-${o.tone}-bg)`,
                  } as React.CSSProperties
                }
              >
                {o.icon}
                {o.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <label htmlFor={noteId} className="text-sm font-medium">
              add a note <span className="font-normal text-muted">(optional)</span>
            </label>
            <span className="tnum text-xs text-muted">
              {note.length}/{NOTE_MAX}
            </span>
          </div>
          <input
            id={noteId}
            type="text"
            value={note}
            maxLength={NOTE_MAX}
            disabled={!online}
            onChange={(e) => setNote(e.target.value)}
            placeholder="slept in after the hackathon"
            className="input mt-1.5 w-full"
          />
        </div>

        <Impact
          before={before}
          after={after}
          picked={status !== null}
          sameAsNow={status === current.status}
          required={required}
        />

        <button
          type="button"
          disabled={!canSave}
          onClick={() => status && onSave(status, note)}
          className="btn-primary mt-4 w-full"
        >
          {saving ? "saving..." : "save"}
        </button>
        {current.explicit && (
          <button
            type="button"
            disabled={!online || saving}
            onClick={onClear}
            className="mt-1 flex min-h-12 w-full items-center justify-center text-sm font-medium text-status-absent disabled:opacity-60"
          >
            clear this day
          </button>
        )}
        {!online && (
          <p className="mt-2 text-center text-xs text-muted">
            offline, so changes can&apos;t be saved right now
          </p>
        )}
      </section>
    </>
  );
}

// the before → after percentage for the picked status, and where that leaves you
function Impact({
  before,
  after,
  picked,
  sameAsNow,
  required,
}: {
  before: AttendanceStats | null;
  after: AttendanceStats | null;
  picked: boolean;
  sameAsNow: boolean;
  required: number;
}) {
  if (!picked) {
    return (
      <p className="notice mt-4">
        pick what happened to see how it moves your attendance
      </p>
    );
  }
  if (!after || after.percentage === null) {
    return (
      <p className="notice mt-4">
        {sameAsNow
          ? "this day doesn't count towards the percentage"
          : "not a class day, so it won't count towards the percentage"}
      </p>
    );
  }

  const tone = toneFor(after, required);
  const from = before?.percentage ?? null;
  const delta =
    from === null
      ? null
      : Math.round((after.percentage - from) * 1000) / 10;

  return (
    <div className="notice mt-4 flex-col" aria-live="polite">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="tnum flex items-baseline gap-2 text-foreground">
          <span className="text-muted line-through">
            {from === null ? "–" : `${toPercent(from)}%`}
          </span>
          <span aria-hidden="true">→</span>
          <span className="text-lg font-semibold">
            {toPercent(after.percentage)}%
          </span>
        </p>
        {delta !== null && (
          <span
            className={`chip tnum ${
              delta < 0 ? "chip-danger" : delta > 0 ? "chip-safe" : ""
            }`}
          >
            {delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta}%`}
          </span>
        )}
      </div>
      {tone && (
        <p className="w-full text-foreground">
          <span className={`${CHIP[tone].className} mr-2`}>
            {CHIP[tone].label}
          </span>
          {verdict(tone, after.safeToBunk, after.needToAttend, required)}
        </p>
      )}
    </div>
  );
}
