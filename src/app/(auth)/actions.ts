"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn } from "@/auth";

export type SignupResult = { error: string } | { success: true };

export async function signup(
  _prevState: SignupResult | null,
  formData: FormData,
): Promise<SignupResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (username.length < 3) {
    return { error: "username needs to be at least 3 characters" };
  }
  if (password.length < 6) {
    return { error: "password needs to be at least 6 characters" };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing) {
    return { error: "that username is already taken" };
  }

  const passwordHash = await hash(password, 10);

  await db.insert(users).values({ username, passwordHash });

  await signIn("credentials", {
    username,
    password,
    redirectTo: "/dashboard",
  });

  return { success: true };
}
