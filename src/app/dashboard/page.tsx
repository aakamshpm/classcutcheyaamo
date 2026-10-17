import { desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/auth";
import { LogoMark } from "@/app/components/logo-mark";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { computeAttendanceStats } from "@/lib/attendance";
import { todayISO } from "@/lib/date";
import { isRunning, toneFor, toPercent, TONE_COLOR } from "@/lib/semester-status";
import { CreateSemesterForm } from "./components/create-semester-form";
import { SemesterOverview } from "./components/semester-overview";
import { SemesterSwitcher } from "./components/semester-switcher";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const allSemesters = await db
    .select()
    .from(semesters)
    .where(eq(semesters.userId, userId))
    .orderBy(desc(semesters.startDate));

  const semesterIds = allSemesters.map((s) => s.id);
  const allMarks = semesterIds.length
    ? await db
        .select({
          semesterId: attendanceDays.semesterId,
          date: attendanceDays.date,
          status: attendanceDays.status,
        })
        .from(attendanceDays)
        .where(inArray(attendanceDays.semesterId, semesterIds))
    : [];

  const today = todayISO();
  const activeSemesters = allSemesters.filter((s) => isRunning(s.endDate, today));
  const pastSemesters = allSemesters.filter((s) => !isRunning(s.endDate, today));
  const marksFor = (id: string) =>
    allMarks.filter((m) => m.semesterId === id);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <div className="mb-6 flex items-center gap-3">
        <LogoMark className="h-10 w-10 lg:hidden" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            hey, {session?.user?.name}
          </h1>
          <p className="text-sm text-muted lowercase">
            {new Date(today + "T00:00:00Z").toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone: "UTC",
            })}
          </p>
        </div>
      </div>

      {activeSemesters.length > 0 ? (
        <SemesterSwitcher
          items={activeSemesters.map((s) => ({
            id: s.id,
            name: s.name,
            content: <SemesterOverview semester={s} marks={marksFor(s.id)} />,
          }))}
        />
      ) : (
        <section className="card p-6 lg:mx-auto lg:w-full lg:max-w-md">
          <LogoMark className="h-14 w-14" />
          <h2 className="mt-4 text-lg font-semibold">nothing here yet</h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            no active semester right now. start one whenever your sem begins.
          </p>
          <CreateSemesterForm />
        </section>
      )}

      {activeSemesters.length > 0 && (
        <details className="card mt-4 p-5">
          <summary className="cursor-pointer text-sm font-medium">
            add another semester
          </summary>
          <div className="mt-4 lg:max-w-md">
            <CreateSemesterForm />
          </div>
        </details>
      )}

      {pastSemesters.length > 0 && (
        <section className="mt-8" aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted"
          >
            past semesters
          </h2>
          <ul className="grid gap-2 lg:grid-cols-2">
            {pastSemesters.map((s) => {
              const stats = computeAttendanceStats(
                s.startDate,
                s.endDate!,
                marksFor(s.id),
                s.requiredPercentage,
              );
              const tone = toneFor(stats, s.requiredPercentage);
              return (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="card flex min-h-16 items-center justify-between px-4 py-3 text-sm transition-colors hover:border-primary"
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted">
                        {s.startDate} → {s.endDate}
                      </span>
                    </span>
                    {stats.percentage !== null && tone && (
                      <span
                        className="tnum text-lg font-semibold"
                        style={{ color: TONE_COLOR[tone] }}
                      >
                        {toPercent(stats.percentage)}%
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
