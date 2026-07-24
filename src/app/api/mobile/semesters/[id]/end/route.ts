import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { semesters } from "@/db/schema";
import { getApiUser, jsonError, unauthorized } from "@/lib/api-auth";

// POST /api/mobile/semesters/[id]/end — marks a semester ended by setting
// its end date. mirrors the web endSemester action's validation.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;

  const [semester] = await db
    .select({ id: semesters.id, startDate: semesters.startDate })
    .from(semesters)
    .where(and(eq(semesters.id, id), eq(semesters.userId, user.userId)))
    .limit(1);

  if (!semester) return jsonError("semester not found", 404);

  let body: { endDate?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid request body", 400);
  }

  const endDate = typeof body.endDate === "string" ? body.endDate : "";
  if (!endDate) return jsonError("pick an end date", 400);
  if (endDate < semester.startDate) {
    return jsonError("end date can't be before the start date", 400);
  }

  const [updated] = await db
    .update(semesters)
    .set({ endDate })
    .where(eq(semesters.id, semester.id))
    .returning();

  return NextResponse.json({ semester: updated });
}
