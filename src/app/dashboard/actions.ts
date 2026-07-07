"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { semesters } from "@/db/schema";

export type ActionResult = { error: string } | { success: true };

export async function createSemester(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const requiredPercentage = Number(
    formData.get("requiredPercentage") ?? 75,
  );

  if (name.length < 1) return { error: "give the semester a name" };
  if (!startDate) return { error: "pick a start date" };
  if (
    !Number.isInteger(requiredPercentage) ||
    requiredPercentage < 1 ||
    requiredPercentage > 100
  ) {
    return { error: "required percentage needs to be between 1 and 100" };
  }

  await db.insert(semesters).values({
    userId: session.user.id,
    name,
    startDate,
    requiredPercentage,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function endSemester(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const semesterId = String(formData.get("semesterId") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  if (!semesterId) return { error: "missing semester" };
  if (!endDate) return { error: "pick an end date" };

  const [target] = await db
    .select({ id: semesters.id, startDate: semesters.startDate })
    .from(semesters)
    .where(
      and(eq(semesters.id, semesterId), eq(semesters.userId, session.user.id)),
    )
    .limit(1);

  if (!target) return { error: "semester not found" };
  if (endDate < target.startDate) {
    return { error: "end date can't be before the start date" };
  }

  await db
    .update(semesters)
    .set({ endDate })
    .where(eq(semesters.id, semesterId));

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/sessions/${semesterId}`);
  return { success: true };
}
