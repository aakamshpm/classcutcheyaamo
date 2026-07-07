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

export type DayStatus = "present" | "absent" | "half_day" | "holiday";

export type ActionResult = { error: string } | { success: true };

export async function updateStartDate(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const semesterId = String(formData.get("semesterId") ?? "");
  const newStartDate = String(formData.get("startDate") ?? "");

  if (!semesterId || !newStartDate) return { error: "missing info" };

  const [semester] = await db
    .select({ endDate: semesters.endDate })
    .from(semesters)
    .where(
      and(eq(semesters.id, semesterId), eq(semesters.userId, session.user.id)),
    )
    .limit(1);

  if (!semester) return { error: "semester not found" };
  if (semester.endDate && newStartDate > semester.endDate) {
    return { error: "start date can't be after the end date" };
  }

  await db
    .update(semesters)
    .set({ startDate: newStartDate })
    .where(eq(semesters.id, semesterId));

  revalidatePath(`/dashboard/sessions/${semesterId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateRequiredPercentage(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const semesterId = String(formData.get("semesterId") ?? "");
  const requiredPercentage = Number(formData.get("requiredPercentage") ?? 0);

  if (!semesterId) return { error: "missing info" };
  if (
    !Number.isInteger(requiredPercentage) ||
    requiredPercentage < 1 ||
    requiredPercentage > 100
  ) {
    return { error: "required percentage needs to be between 1 and 100" };
  }

  await assertOwnsSemester(semesterId, session.user.id);

  await db
    .update(semesters)
    .set({ requiredPercentage })
    .where(eq(semesters.id, semesterId));

  revalidatePath(`/dashboard/sessions/${semesterId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

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
