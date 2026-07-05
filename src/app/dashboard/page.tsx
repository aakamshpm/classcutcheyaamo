import { desc, eq, isNull } from "drizzle-orm";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { semesters } from "@/db/schema";
import { CreateSemesterForm } from "./components/create-semester-form";
import { EndSemesterForm } from "./components/end-semester-form";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const allSemesters = await db
    .select()
    .from(semesters)
    .where(eq(semesters.userId, userId))
    .orderBy(desc(semesters.startDate));

  const activeSemester = allSemesters.find((s) => s.endDate === null);
  const pastSemesters = allSemesters.filter((s) => s.endDate !== null);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold">hey, {session?.user?.name}</h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 underline"
            >
              log out
            </button>
          </form>
        </div>

        {activeSemester ? (
          <div className="mb-8 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              active semester
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              {activeSemester.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              started {activeSemester.startDate} · needs{" "}
              {activeSemester.requiredPercentage}%
            </p>

            <div className="mt-4">
              <Link
                href={`/dashboard/sessions/${activeSemester.id}`}
                className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                mark attendance
              </Link>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-zinc-500">
                sem got over? end it here
              </summary>
              <div className="mt-3">
                <EndSemesterForm semesterId={activeSemester.id} />
              </div>
            </details>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
            <p className="mb-4 text-sm text-zinc-500">
              no active semester right now. start one whenever your sem
              begins.
            </p>
            <CreateSemesterForm />
          </div>
        )}

        {pastSemesters.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
              past semesters
            </p>
            <ul className="flex flex-col gap-2">
              {pastSemesters.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-zinc-500">
                      {s.startDate} → {s.endDate}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
