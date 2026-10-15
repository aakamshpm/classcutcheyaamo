"use client";

import { useOptimistic, useTransition } from "react";
import { showToast } from "@/lib/toast";
import { useOnlineStatus } from "@/lib/use-online-status";
import {
  clearDayStatus,
  setDayStatus,
  type DayStatus,
} from "../sessions/[id]/actions";
import { STATUS_OPTIONS } from "./status-options";

// marks today in one tap. `status` is what counts for today right now (an
// explicit mark, or the kerala-holiday default). tapping the active choice
// again clears an explicit mark.
export function TodayCard({
  semesterId,
  date,
  dateLabel,
  status,
  hasExplicitMark,
  holidayName,
}: {
  semesterId: string;
  date: string;
  dateLabel: string;
  status: DayStatus | null;
  hasExplicitMark: boolean;
  holidayName: string | null;
}) {
  const online = useOnlineStatus();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic<
    { status: DayStatus | null; explicit: boolean },
    { status: DayStatus | null; explicit: boolean }
  >({ status, explicit: hasExplicitMark }, (_, next) => next);

  function choose(next: DayStatus) {
    if (!online || pending) return;
    const clearing = shown.explicit && shown.status === next;
    startTransition(async () => {
      try {
        if (clearing) {
          setShown({ status: holidayName ? "holiday" : null, explicit: false });
          await clearDayStatus(semesterId, date);
          showToast("today's mark cleared");
        } else {
          setShown({ status: next, explicit: true });
          await setDayStatus(semesterId, date, next);
          const label = STATUS_OPTIONS.find((o) => o.status === next)?.label;
          showToast(`marked ${label} for today`);
        }
      } catch {
        showToast("couldn't save, try again", "error");
      }
    });
  }

  return (
    <section className="card p-5" aria-labelledby="today-heading">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          today
        </p>
        <p className="text-sm text-muted lowercase">{dateLabel}</p>
      </div>
      <h2 id="today-heading" className="mt-1 text-lg font-semibold">
        did you attend today?
      </h2>
      {holidayName && (
        <p className="mt-1 text-sm text-muted">
          {holidayName} is a holiday on the kerala calendar, tap to override
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATUS_OPTIONS.map((o) => {
          const active = shown.status === o.status;
          return (
            <button
              key={o.status}
              type="button"
              disabled={!online}
              aria-pressed={active}
              onClick={() => choose(o.status)}
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
      {!online && (
        <p className="mt-3 text-xs text-muted">
          offline, so today can&apos;t be marked right now
        </p>
      )}
    </section>
  );
}
