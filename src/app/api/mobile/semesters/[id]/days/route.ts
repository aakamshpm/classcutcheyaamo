import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { getApiUser, jsonError, unauthorized } from "@/lib/api-auth";

const VALID_STATUSES = ["present", "absent", "half_day", "holiday"] as const;
type DayStatus = (typeof VALID_STATUSES)[number];

async function assertOwnsSemester(
  semesterId: string,
  userId: string,
): Promise<boolean> {
  const [semester] = await db
    .select({ id: semesters.id })
    .from(semesters)
    .where(and(eq(semesters.id, semesterId), eq(semesters.userId, userId)))
    .limit(1);
  return !!semester;
}

// PUT /api/mobile/semesters/[id]/days — set (upsert) a day's status.
// body: { date: "YYYY-MM-DD", status: "present"|"absent"|"half_day"|"holiday" }
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  if (!(await assertOwnsSemester(id, user.userId))) {
    return jsonError("semester not found", 404);
  }

  let body: { date?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid request body", 400);
  }

  const date = typeof body.date === "string" ? body.date : "";
  const status = body.status as DayStatus;

  if (!date) return jsonError("date is required", 400);
  if (!VALID_STATUSES.includes(status)) {
    return jsonError("invalid status", 400);
  }

  await db
    .insert(attendanceDays)
    .values({ semesterId: id, date, status })
    .onConflictDoUpdate({
      target: [attendanceDays.semesterId, attendanceDays.date],
      set: { status, updatedAt: new Date() },
    });

  return NextResponse.json({ ok: true });
}

// DELETE /api/mobile/semesters/[id]/days?date=YYYY-MM-DD — clears a day's
// explicit mark, reverting it to the weekend/holiday/unmarked default.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  if (!(await assertOwnsSemester(id, user.userId))) {
    return jsonError("semester not found", 404);
  }

  const date = new URL(request.url).searchParams.get("date");
  if (!date) return jsonError("date query param is required", 400);

  await db
    .delete(attendanceDays)
    .where(
      and(
        eq(attendanceDays.semesterId, id),
        eq(attendanceDays.date, date),
      ),
    );

  return NextResponse.json({ ok: true });
}
