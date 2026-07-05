import { computeAttendanceStats, type MarkedDay } from "@/lib/attendance";
import { todayISO } from "@/lib/date";

export function PercentageSummary({
  startDate,
  endDate,
  marks,
  requiredPercentage,
}: {
  startDate: string;
  endDate: string | null;
  marks: MarkedDay[];
  requiredPercentage: number;
}) {
  const today = todayISO();

  if (startDate > today) {
    return (
      <div className="card p-6 text-sm text-muted">
        this semester starts on <span className="font-medium">{startDate}</span>,
        which hasn&apos;t arrived yet — nothing to mark or track until then.
      </div>
    );
  }

  const upTo = endDate ?? today;
  const stats = computeAttendanceStats(
    startDate,
    upTo,
    marks,
    requiredPercentage,
  );

  if (stats.percentage === null) {
    return (
      <div className="card p-6 text-sm text-muted">
        no working days marked yet. tap a day on the calendar below to get
        started.
      </div>
    );
  }

  const pct = Math.round(stats.percentage * 1000) / 10;
  const isSafe = stats.percentage >= requiredPercentage / 100;
  const statusColor = isSafe ? "var(--status-present)" : "var(--status-absent)";
  const statusBg = isSafe ? "var(--status-present-bg)" : "var(--status-absent-bg)";

  return (
    <div
      className="rounded-[var(--radius)] p-6"
      style={{ background: statusBg, border: `1px solid ${statusColor}33` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        attendance
      </p>
      <p className="mt-1 text-5xl font-bold" style={{ color: statusColor }}>
        {pct}%
      </p>
      <p className="mt-1 text-sm text-muted">
        {stats.presentDays} present / {stats.workingDays} working days
        {stats.halfDays > 0 &&
          ` (incl. ${stats.halfDays} half day${stats.halfDays === 1 ? "" : "s"})`}
      </p>

      <div className="mt-3 text-sm">
        {isSafe ? (
          stats.safeToBunk > 0 ? (
            <p>
              you can safely miss{" "}
              <span className="font-semibold">{stats.safeToBunk}</span> more
              day{stats.safeToBunk === 1 ? "" : "s"} and stay at{" "}
              {requiredPercentage}%+
            </p>
          ) : (
            <p>
              you&apos;re exactly at {requiredPercentage}%, one more absence
              and you&apos;re below
            </p>
          )
        ) : (
          <p>
            attend the next{" "}
            <span className="font-semibold">{stats.needToAttend}</span> day
            {stats.needToAttend === 1 ? "" : "s"} in a row to get back to{" "}
            {requiredPercentage}%
          </p>
        )}
      </div>

      {stats.unmarkedDays > 0 && (
        <p className="mt-3 text-xs text-muted">
          ⚠ {stats.unmarkedDays} day{stats.unmarkedDays === 1 ? "" : "s"} up
          to today {stats.unmarkedDays === 1 ? "isn't" : "aren't"} marked yet
          — the percentage above doesn&apos;t include{" "}
          {stats.unmarkedDays === 1 ? "it" : "them"}.
        </p>
      )}
    </div>
  );
}
