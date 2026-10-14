import { CheckIcon, CloseIcon, HalfIcon } from "@/app/components/icons";
import type { WeekDay } from "@/lib/week";

function Mark({ day }: { day: WeekDay }) {
  switch (day.status) {
    case "present":
      return <CheckIcon className="h-4 w-4" />;
    case "absent":
      return <CloseIcon className="h-4 w-4" />;
    case "half_day":
      return <HalfIcon className="h-4 w-4" />;
    case "holiday":
      return <span className="text-[10px] font-semibold">off</span>;
    default:
      return null;
  }
}

const TONE: Record<string, string> = {
  present: "present",
  absent: "absent",
  half_day: "half",
  holiday: "holiday",
};

// this week at a glance, monday to sunday. days that haven't happened (or
// fall outside the semester) stay blank.
export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <section className="card p-5" aria-labelledby="week-heading">
      <h2 id="week-heading" className="text-lg font-semibold">
        this week
      </h2>
      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const tone = d.status && !d.inactive ? TONE[d.status] : null;
          return (
            <li key={d.date} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-xs ${d.isToday ? "font-semibold text-primary" : "text-muted"}`}
              >
                {d.label}
              </span>
              <span
                className="flex aspect-square w-full max-w-11 items-center justify-center rounded-full border"
                style={{
                  background: tone ? `var(--status-${tone}-bg)` : "transparent",
                  color: tone ? `var(--status-${tone})` : "var(--muted)",
                  borderColor: d.isToday
                    ? "var(--primary)"
                    : tone
                      ? "transparent"
                      : "var(--card-border)",
                  borderWidth: d.isToday ? 2 : 1,
                }}
              >
                {d.inactive ? null : <Mark day={d} />}
              </span>
              <span className="tnum text-xs text-muted">{d.dayNum}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
