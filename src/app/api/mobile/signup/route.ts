import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signApiToken } from "@/lib/api-token";
import { jsonError } from "@/lib/api-auth";
import { NextResponse } from "next/server";

// mobile signup: creates the account and immediately returns a token so
// the app can drop the user straight into the dashboard. same validation
// rules as the web signup action.
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid request body", 400);
  }

  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (username.length < 3) {
    return jsonError("username needs to be at least 3 characters", 400);
  }
  if (password.length < 6) {
    return jsonError("password needs to be at least 6 characters", 400);
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing) return jsonError("that username is already taken", 409);

  const passwordHash = await hash(password, 10);
  const [created] = await db
    .insert(users)
    .values({ username, passwordHash })
    .returning({ id: users.id, username: users.username });

  const token = await signApiToken({
    userId: created.id,
    username: created.username,
  });

  return NextResponse.json(
    { token, user: { id: created.id, username: created.username } },
    { status: 201 },
  );
}
