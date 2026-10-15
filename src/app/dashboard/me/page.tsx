import { desc, eq, inArray } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { attendanceDays, semesters, users } from "@/db/schema";
import { computeAttendanceStats } from "@/lib/attendance";
import { todayISO } from "@/lib/date";
import { plural, toneFor, toPercent } from "@/lib/semester-status";
import { MeView } from "./components/me-view";

export default async function MePage() {
  const session = await auth();
  const userId = session!.user.id;
  const username = session!.user.name ?? "";

  const [user] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId));

  const allSemesters = await db
    .select()
    .from(semesters)
    .where(eq(semesters.userId, userId))
    .orderBy(desc(semesters.startDate));

  const marks = allSemesters.length
    ? await db
        .select({
          semesterId: attendanceDays.semesterId,
          date: attendanceDays.date,
          status: attendanceDays.status,
        })
        .from(attendanceDays)
        .where(
          inArray(
            attendanceDays.semesterId,
            allSemesters.map((s) => s.id),
          ),
        )
    : [];

  const today = todayISO();
  // running semesters first, then finished ones newest first
  const ordered = [
    ...allSemesters.filter((s) => s.endDate === null),
    ...allSemesters.filter((s) => s.endDate !== null),
  ];

  const rows = ordered.map((s) => {
    const lastDay = s.endDate ?? today;
    const stats =
      s.startDate <= lastDay
        ? computeAttendanceStats(
            s.startDate,
            lastDay,
            marks.filter((m) => m.semesterId === s.id),
            s.requiredPercentage,
          )
        : null;
    const tone = stats ? toneFor(stats, s.requiredPercentage) : null;
    let detail = `needs ${s.requiredPercentage}%`;
    if (s.endDate === null && stats && tone) {
      detail +=
        tone === "danger"
          ? ` · attend ${plural(stats.needToAttend, "day")} in a row`
          : ` · ${plural(stats.safeToBunk, "day")} to spare`;
    } else if (s.endDate !== null) {
      detail += ` · ended ${s.endDate}`;
    }
    return {
      id: s.id,
      name: s.name,
      detail,
      percent:
        stats && stats.percentage !== null && tone
          ? { value: toPercent(stats.percentage), tone }
          : null,
    };
  });

  const since = user?.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <MeView
      username={username}
      since={since ?? null}
      rows={rows}
      logout={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    />
  );
}
