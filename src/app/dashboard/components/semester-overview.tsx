import Link from "next/link";
import { AlertIcon, ArrowRightIcon } from "@/app/components/icons";
import {
  computeAttendanceStats,
  type MarkedDay,
} from "@/lib/attendance";
import { parseISODate, todayISO } from "@/lib/date";
import { KERALA_HOLIDAY_MAP } from "@/lib/kerala-holidays";
import {
  CHIP,
  plural,
  toneFor,
  toPercent,
  verdict,
} from "@/lib/semester-status";
import { currentWeek } from "@/lib/week";
import { AttendanceRing } from "./attendance-ring";
import { EndSemesterForm } from "./end-semester-form";
import { TodayCard } from "./today-card";
import { WeekStrip } from "./week-strip";

type Semester = {
  id: string;
  name: string;
  startDate: string;
  requiredPercentage: number;
};

// the home view of one active semester: gauge, counts, today's mark and the
// week. laid out as one column on phones and two on wide screens.
export function SemesterOverview({
  semester,
  marks,
}: {
  semester: Semester;
  marks: MarkedDay[];
}) {
  const today = todayISO();
  const started = semester.startDate <= today;
  const stats = started
    ? computeAttendanceStats(
        semester.startDate,
        today,
        marks,
        semester.requiredPercentage,
      )
    : null;
  const tone = stats ? toneFor(stats, semester.requiredPercentage) : null;
  const percent =
    stats && stats.percentage !== null ? toPercent(stats.percentage) : null;

  const todayMark = marks.find((m) => m.date === today)?.status ?? null;
  const dow = parseISODate(today).getUTCDay();
  const weekend = dow === 0 || dow === 6;
  const holidayName = KERALA_HOLIDAY_MAP.get(today) ?? null;
  const todayStatus =
    todayMark ?? (weekend || holidayName ? "holiday" : null);

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex flex-col gap-4">
        <section className="card p-5" aria-label="attendance status">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{semester.name}</h2>
              <p className="text-sm text-muted">
                since {semester.startDate} · needs {semester.requiredPercentage}%
              </p>
            </div>
            {tone && (
              <span className={CHIP[tone].className}>{CHIP[tone].label}</span>
            )}
          </div>

          {started ? (
            <>
              <div className="mt-5">
                <AttendanceRing
                  percent={percent}
                  required={semester.requiredPercentage}
                  tone={tone}
                />
              </div>

              <div className="gold-rule mx-auto mt-5 w-16" />
              <p className="mt-4 text-center text-sm">
                {stats && tone
                  ? verdict(
                      tone,
                      stats.safeToBunk,
                      stats.needToAttend,
                      semester.requiredPercentage,
                    )
                  : "mark a few days to see where you stand"}
              </p>

              {stats && stats.unmarkedDays > 0 && (
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
            <p className="notice mt-4">
              this semester starts on {semester.startDate}, there&apos;s
              nothing to track until then
            </p>
          )}
        </section>

        {stats && (
          <dl className="grid grid-cols-3 gap-3">
            <Stat label="present" value={stats.presentDays} />
            <Stat label="absent" value={stats.absentDays} />
            <Stat label="unmarked" value={stats.unmarkedDays} />
          </dl>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {started &&
          (weekend ? (
            <p className="card p-5 text-sm text-muted">
              it&apos;s the weekend, nothing to mark today
            </p>
          ) : (
            <TodayCard
              semesterId={semester.id}
              date={today}
              dateLabel={new Date(today + "T00:00:00Z").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                },
              )}
              status={todayStatus}
              hasExplicitMark={todayMark !== null}
              holidayName={holidayName}
            />
          ))}

        {started && (
          <WeekStrip
            days={currentWeek(today, semester.startDate, null, marks)}
          />
        )}

        <div className="card flex flex-col gap-3 p-5">
          <Link
            href={`/dashboard/sessions/${semester.id}`}
            className="flex min-h-12 items-center justify-between text-sm font-semibold text-primary"
          >
            open calendar
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <details className="border-t border-card-border pt-3">
            <summary className="cursor-pointer text-sm text-muted">
              sem got over? end it here
            </summary>
            <div className="mt-3">
              <EndSemesterForm semesterId={semester.id} />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="tnum mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}
