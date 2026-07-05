import { computeAttendanceStats, type MarkedDay } from "@/lib/attendance";
import { todayISO } from "@/lib/date";

export function PercentageSummary({
  startDate,
  endDate,
  marks,
}: {
  startDate: string;
  endDate: string | null;
  marks: MarkedDay[];
}) {
  const upTo = endDate ?? todayISO();
  const stats = computeAttendanceStats(startDate, upTo, marks);

  if (stats.percentage === null) {
    return (
      <div className="rounded-lg border border-zinc-200 p-5 text-sm text-zinc-500 dark:border-zinc-800">
        no working days marked yet. tap a day on the calendar below to get
        started.
      </div>
    );
  }

  const pct = Math.round(stats.percentage * 1000) / 10;
  const isSafe = stats.percentage >= 0.75;

  return (
    <div
      className={`rounded-lg border p-5 ${
        isSafe
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
          : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        attendance
      </p>
      <p
        className={`mt-1 text-4xl font-bold ${
          isSafe
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {pct}%
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {stats.presentDays} present / {stats.workingDays} working days
      </p>

      <div className="mt-3 text-sm">
        {isSafe ? (
          stats.safeToBunk > 0 ? (
            <p>
              you can safely miss{" "}
              <span className="font-semibold">{stats.safeToBunk}</span> more
              day{stats.safeToBunk === 1 ? "" : "s"} and stay at 75%+
            </p>
          ) : (
            <p>you&apos;re exactly at 75%, one more absence and you&apos;re below</p>
          )
        ) : (
          <p>
            attend the next{" "}
            <span className="font-semibold">{stats.needToAttend}</span> day
            {stats.needToAttend === 1 ? "" : "s"} in a row to get back to 75%
          </p>
        )}
      </div>
    </div>
  );
}
