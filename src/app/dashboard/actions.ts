"use server";

import { revalidatePath } from "next/cache";
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
