import { NextResponse } from "next/server";
import { verifyApiToken, type TokenPayload } from "./api-token";

// pulls the bearer token off the request and verifies it. returns the
// user payload, or null if the header is missing/malformed/invalid.
export async function getApiUser(
  request: Request,
): Promise<TokenPayload | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;
  return verifyApiToken(token);
}

// small helpers so every route returns consistent json shapes
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return jsonError("not authenticated", 401);
}
