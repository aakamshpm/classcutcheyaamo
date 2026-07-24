import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { computeAttendanceStats } from "@/lib/attendance";
import { todayISO } from "@/lib/date";
import { getApiUser, jsonError, unauthorized } from "@/lib/api-auth";

async function loadOwnedSemester(semesterId: string, userId: string) {
  const [semester] = await db
    .select()
    .from(semesters)
    .where(and(eq(semesters.id, semesterId), eq(semesters.userId, userId)))
    .limit(1);
  return semester ?? null;
}

// GET /api/mobile/semesters/[id] — a single semester with its marks and
// computed stats, everything the app's calendar screen needs in one call.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const semester = await loadOwnedSemester(id, user.userId);
  if (!semester) return jsonError("semester not found", 404);

  const marks = await db
    .select({ date: attendanceDays.date, status: attendanceDays.status })
    .from(attendanceDays)
    .where(eq(attendanceDays.semesterId, semester.id));

  const today = todayISO();
  const stats =
    semester.startDate > today
      ? null
      : computeAttendanceStats(
          semester.startDate,
          semester.endDate ?? today,
          marks,
          semester.requiredPercentage,
        );

  return NextResponse.json({
    semester: {
      id: semester.id,
      name: semester.name,
      startDate: semester.startDate,
      endDate: semester.endDate,
      requiredPercentage: semester.requiredPercentage,
      active: semester.endDate === null,
    },
    marks,
    stats,
  });
}

// PATCH /api/mobile/semesters/[id] — edit start date and/or required %.
// only the fields present in the body are touched.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const semester = await loadOwnedSemester(id, user.userId);
  if (!semester) return jsonError("semester not found", 404);

  let body: { startDate?: unknown; requiredPercentage?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid request body", 400);
  }

  const updates: {
    startDate?: string;
    requiredPercentage?: number;
  } = {};

  if (body.startDate !== undefined) {
    const startDate = typeof body.startDate === "string" ? body.startDate : "";
    if (!startDate) return jsonError("invalid start date", 400);
    if (semester.endDate && startDate > semester.endDate) {
      return jsonError("start date can't be after the end date", 400);
    }
    updates.startDate = startDate;
  }

  if (body.requiredPercentage !== undefined) {
    const requiredPercentage = Number(body.requiredPercentage);
    if (
      !Number.isInteger(requiredPercentage) ||
      requiredPercentage < 1 ||
      requiredPercentage > 100
    ) {
      return jsonError(
        "required percentage needs to be between 1 and 100",
        400,
      );
    }
    updates.requiredPercentage = requiredPercentage;
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("nothing to update", 400);
  }

  const [updated] = await db
    .update(semesters)
    .set(updates)
    .where(eq(semesters.id, semester.id))
    .returning();

  return NextResponse.json({ semester: updated });
}
