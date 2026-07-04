import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/db";
import { semesters } from "@/db/schema";

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

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/dashboard" className="text-sm text-zinc-500 underline">
          ← back
        </Link>
        <h1 className="mt-4 text-xl font-semibold">{semester.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {semester.startDate} {semester.endDate ? `→ ${semester.endDate}` : "→ ongoing"}
        </p>
        <p className="mt-8 text-sm text-zinc-500">
          the calendar and attendance marking for this semester land here in
          the next phase.
        </p>
      </div>
    </main>
  );
}
