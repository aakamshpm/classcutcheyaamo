"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export type ActionResult = { error: string } | { success: true };

export async function changePassword(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 6) {
    return { error: "password needs to be at least 6 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "the two passwords don't match" };
  }
  if (newPassword === currentPassword) {
    return { error: "that's the password you already have" };
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return { error: "account not found" };
  if (!(await compare(currentPassword, user.passwordHash))) {
    return { error: "current password is wrong" };
  }

  await db
    .update(users)
    .set({ passwordHash: await hash(newPassword, 10) })
    .where(eq(users.id, session.user.id));

  return { success: true };
}

// semesters and their marked days go with the user through the foreign keys'
// cascade. typing the username is the confirmation, since this can't be undone.
export async function deleteAccount(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "not logged in" };

  const typed = String(formData.get("confirm") ?? "").trim();

  const [user] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) return { error: "account not found" };
  if (typed !== user.username) {
    return { error: "that doesn't match your username" };
  }

  await db.delete(users).where(eq(users.id, session.user.id));

  // clears the session cookie and redirects, so nothing after it runs
  await signOut({ redirectTo: "/login" });
  return { success: true };
}
