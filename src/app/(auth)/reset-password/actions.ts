"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signIn } from "@/auth";

export type ResetResult = { error: string } | { success: true };

// NOTE ON SECURITY, deliberately chosen: this reset needs nothing but a
// username. anyone who knows a username can change that account's password
// and log in as them. there is no email or phone on file, so there is nothing
// to verify against. the rate limit below only slows down someone guessing at
// usernames in bulk; it does not protect an account whose username is already
// known. if this app ever holds anything worth protecting, this flow needs a
// second factor (a recovery code issued at signup is the usual fix).

// how many resets one client may attempt in the window, to blunt scripted
// username guessing. in-memory, so it resets on redeploy and is per-instance
// rather than global — on vercel each lambda keeps its own copy. good enough
// to stop a naive loop, not a real distributed defence.
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const attempts = new Map<string, { count: number; firstAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  // vercel sets x-forwarded-for; fall back to a constant so a missing header
  // shares one bucket rather than bypassing the limit entirely
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function resetPassword(
  _prevState: ResetResult | null,
  formData: FormData,
): Promise<ResetResult> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username) return { error: "enter your username" };
  if (password.length < 6) {
    return { error: "password needs to be at least 6 characters" };
  }
  if (password !== confirmPassword) {
    return { error: "the two passwords don't match" };
  }

  if (rateLimited(await clientKey())) {
    return { error: "too many attempts, try again in a few minutes" };
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  // saying "no such username" is a small leak, but this flow already lets
  // anyone with a username take the account over, so hiding whether the
  // username exists would buy nothing and would only confuse the real user
  // who mistyped it.
  if (!user) return { error: "no account with that username" };

  const passwordHash = await hash(password, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, user.id));

  // log them straight in with the new password, so they don't have to type it
  // again on the login page. signIn redirects, so nothing after it runs.
  await signIn("credentials", {
    username,
    password,
    redirectTo: "/dashboard",
  });

  return { success: true };
}
