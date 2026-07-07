import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { AttendanceCalendar } from "./components/attendance-calendar";
import { PercentageSummary } from "./components/percentage-summary";
import { EditStartDateForm } from "./components/edit-start-date-form";
import { EditRequiredPercentageForm } from "./components/edit-required-percentage-form";
import { EndSemesterForm } from "@/app/dashboard/components/end-semester-form";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const [semester] = await db
    .select()
    .from(semesters)
    .where(and(eq(semesters.id, id), eq(semesters.userId, userId)))
    .limit(1);

  if (!semester) notFound();

  const marks = await db
    .select({ date: attendanceDays.date, status: attendanceDays.status })
    .from(attendanceDays)
    .where(eq(attendanceDays.semesterId, semester.id));

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="text-sm text-muted underline">
          ← back
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {semester.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {semester.startDate}{" "}
          {semester.endDate ? `→ ${semester.endDate}` : "→ ongoing"}
        </p>
        <p className="mt-1 text-sm text-muted">
          needs {semester.requiredPercentage}%
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <EditStartDateForm
            semesterId={semester.id}
            currentStartDate={semester.startDate}
          />
          <EditRequiredPercentageForm
            semesterId={semester.id}
            currentRequiredPercentage={semester.requiredPercentage}
          />
          {!semester.endDate && (
            <details className="text-sm text-muted">
              <summary className="cursor-pointer">
                sem got over? end it here
              </summary>
              <div className="mt-3">
                <EndSemesterForm semesterId={semester.id} />
              </div>
            </details>
          )}
        </div>

        <div className="mt-6">
          <PercentageSummary
            startDate={semester.startDate}
            endDate={semester.endDate}
            marks={marks}
            requiredPercentage={semester.requiredPercentage}
          />
        </div>

        <div className="mt-8">
          <AttendanceCalendar
            semesterId={semester.id}
            startDate={semester.startDate}
            endDate={semester.endDate}
            marks={marks}
          />
        </div>
      </div>
    </main>
  );
}
