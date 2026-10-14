"use client";

import { useOptimistic, useTransition } from "react";
import {
  CheckIcon,
  CloseIcon,
  HalfIcon,
} from "@/app/components/icons";
import { useOnlineStatus } from "@/lib/use-online-status";
import {
  clearDayStatus,
  setDayStatus,
  type DayStatus,
} from "../sessions/[id]/actions";

const OPTIONS: {
  status: DayStatus;
  label: string;
  tone: string;
  icon: React.ReactNode;
}[] = [
  {
    status: "present",
    label: "present",
    tone: "present",
    icon: <CheckIcon className="h-4 w-4" />,
  },
  {
    status: "half_day",
    label: "half day",
    tone: "half",
    icon: <HalfIcon className="h-4 w-4" />,
  },
  {
    status: "absent",
    label: "absent",
    tone: "absent",
    icon: <CloseIcon className="h-4 w-4" />,
  },
  {
    status: "holiday",
    label: "no class",
    tone: "holiday",
    icon: null,
  },
];

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
    if (!online) return;
    const clearing = shown.explicit && shown.status === next;
    startTransition(async () => {
      if (clearing) {
        setShown({ status: holidayName ? "holiday" : null, explicit: false });
        await clearDayStatus(semesterId, date);
      } else {
        setShown({ status: next, explicit: true });
        await setDayStatus(semesterId, date, next);
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
        {OPTIONS.map((o) => {
          const active = shown.status === o.status;
          return (
            <button
              key={o.status}
              type="button"
              disabled={!online || pending}
              aria-pressed={active}
              onClick={() => choose(o.status)}
              className="flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--radius-control)] border text-sm font-semibold transition-colors disabled:opacity-60"
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
