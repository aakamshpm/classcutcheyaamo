import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { CalendarView } from "./components/calendar-view";
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
    .select({
      date: attendanceDays.date,
      status: attendanceDays.status,
      note: attendanceDays.note,
    })
    .from(attendanceDays)
    .where(eq(attendanceDays.semesterId, semester.id));

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">
          {semester.name}
        </h1>
        <p className="text-sm text-muted">
          {semester.startDate}{" "}
          {semester.endDate ? `→ ${semester.endDate}` : "→ ongoing"} · needs{" "}
          {semester.requiredPercentage}%
        </p>
      </div>

      <CalendarView
        semesterId={semester.id}
        startDate={semester.startDate}
        endDate={semester.endDate}
        requiredPercentage={semester.requiredPercentage}
        marks={marks}
      />

      <details className="card mt-4 p-5">
        <summary className="cursor-pointer text-sm font-medium">
          semester settings
        </summary>
        <div className="mt-4 flex flex-col items-start gap-3">
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
      </details>
    </main>
  );
}
