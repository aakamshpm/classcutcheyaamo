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
          <h1 className="text-xl font-bold tracking-tight">
            hey, {session?.user?.name}
          </h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm font-medium text-muted underline"
            >
              log out
            </button>
          </form>
        </div>

        {activeSemester ? (
          <div className="card mb-8 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              active semester
            </p>
            <h2 className="mt-1 text-lg font-bold">{activeSemester.name}</h2>
            <p className="mt-1 text-sm text-muted">
              started {activeSemester.startDate} · needs{" "}
              {activeSemester.requiredPercentage}%
            </p>

            <div className="mt-4">
              <Link
                href={`/dashboard/sessions/${activeSemester.id}`}
                className="btn-primary inline-block px-4 py-2 text-sm"
              >
                mark attendance
              </Link>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted">
                sem got over? end it here
              </summary>
              <div className="mt-3">
                <EndSemesterForm semesterId={activeSemester.id} />
              </div>
            </details>
          </div>
        ) : (
          <div className="card mb-8 p-6">
            <p className="mb-4 text-sm text-muted">
              no active semester right now. start one whenever your sem
              begins.
            </p>
            <CreateSemesterForm />
          </div>
        )}

        {pastSemesters.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
              past semesters
            </p>
            <ul className="flex flex-col gap-2">
              {pastSemesters.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dashboard/sessions/${s.id}`}
                    className="card flex items-center justify-between px-4 py-3 text-sm transition-colors hover:border-primary"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted">
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
