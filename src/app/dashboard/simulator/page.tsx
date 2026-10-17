import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { todayISO } from "@/lib/date";
import { isRunning } from "@/lib/semester-status";
import { SimulatorView } from "./components/simulator-view";

export default async function SimulatorPage() {
  const session = await auth();
  const userId = session!.user.id;

  // only a running semester has days left to try out
  const active = await db
    .select()
    .from(semesters)
    .where(eq(semesters.userId, userId))
    .orderBy(desc(semesters.startDate))
    .then((rows) => rows.filter((s) => isRunning(s.endDate, todayISO())));

  const marks = active.length
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
            active.map((s) => s.id),
          ),
        )
    : [];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-8 pb-6 lg:max-w-5xl lg:px-6 lg:pt-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">cut simulator</h1>
        <p className="text-sm text-muted">
          see what a few days off would do, before you take them
        </p>
      </div>

      {active.length > 0 ? (
        <SimulatorView
          today={todayISO()}
          semesters={active.map((s) => ({
            id: s.id,
            name: s.name,
            startDate: s.startDate,
            requiredPercentage: s.requiredPercentage,
            marks: marks
              .filter((m) => m.semesterId === s.id)
              .map((m) => ({ date: m.date, status: m.status })),
          }))}
        />
      ) : (
        <section className="card p-6 lg:mx-auto lg:w-full lg:max-w-md">
          <h2 className="text-lg font-semibold">no running semester</h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            the simulator works on a semester that&apos;s still going. start
            one from home.
          </p>
          <Link href="/dashboard" className="btn-primary px-5">
            go home
          </Link>
        </section>
      )}
    </main>
  );
}
