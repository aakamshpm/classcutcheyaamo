import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signApiToken } from "@/lib/api-token";
import { jsonError } from "@/lib/api-auth";
import { NextResponse } from "next/server";

// mobile login: takes username + password, returns a bearer token the
// app stores and sends on every subsequent request. mirrors the same
// credential check the web cookie login uses in src/auth.ts.
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

  if (!username || !password) {
    return jsonError("username and password are required", 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  // same generic message whether the user doesn't exist or the password
  // is wrong, so we don't leak which usernames are registered
  if (!user) return jsonError("wrong username or password", 401);

  const passwordMatches = await compare(password, user.passwordHash);
  if (!passwordMatches) return jsonError("wrong username or password", 401);

  const token = await signApiToken({
    userId: user.id,
    username: user.username,
  });

  return NextResponse.json({
    token,
    user: { id: user.id, username: user.username },
  });
}
