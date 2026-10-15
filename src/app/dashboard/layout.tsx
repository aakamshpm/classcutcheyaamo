import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { semesters } from "@/db/schema";
import { DashboardNav } from "./components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // the calendar tab opens the active semester, or the latest one if all of
  // them are over
  let calendarHref: string | null = null;
  if (session?.user?.id) {
    const rows = await db
      .select({ id: semesters.id, endDate: semesters.endDate })
      .from(semesters)
      .where(eq(semesters.userId, session.user.id))
      .orderBy(desc(semesters.startDate));
    const target = rows.find((s) => s.endDate === null) ?? rows[0];
    if (target) calendarHref = `/dashboard/sessions/${target.id}`;
  }

  return (
    <div className="flex flex-1 flex-col pb-[calc(6.25rem+env(safe-area-inset-bottom))] lg:pb-0">
      <DashboardNav calendarHref={calendarHref} />
      {children}
    </div>
  );
}
