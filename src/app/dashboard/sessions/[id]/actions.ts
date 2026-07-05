"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";

async function assertOwnsSemester(semesterId: string, userId: string) {
  const [semester] = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(and(eq(semesters.id, semesterId), eq(semesters.userId, userId)))
    .limit(1);
  if (!semester) throw new Error("semester not found");
}

export type DayStatus = "present" | "absent" | "holiday";

export async function setDayStatus(
  semesterId: string,
  date: string,
  status: DayStatus,
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");
  await assertOwnsSemester(semesterId, session.user.id);

  await db
    .insert(attendanceDays)
    .values({ semesterId, date, status })
    .onConflictDoUpdate({
      target: [attendanceDays.semesterId, attendanceDays.date],
      set: { status, updatedAt: new Date() },
    });

  revalidatePath(`/dashboard/sessions/${semesterId}`);
}

// removes any explicit mark, reverting the day back to its default
// (weekend/kerala-holiday or plain unmarked)
export async function clearDayStatus(semesterId: string, date: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("not logged in");
  await assertOwnsSemester(semesterId, session.user.id);

  await db
    .delete(attendanceDays)
    .where(
      and(
        eq(attendanceDays.semesterId, semesterId),
        eq(attendanceDays.date, date),
      ),
    );

  revalidatePath(`/dashboard/sessions/${semesterId}`);
}
