import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceDays, semesters } from "@/db/schema";
import { computeAttendanceStats } from "@/lib/attendance";
import { todayISO } from "@/lib/date";
import { getApiUser, jsonError, unauthorized } from "@/lib/api-auth";

// GET /api/mobile/semesters — all of the user's semesters with their live
// percentage folded in, same computation the web dashboard uses so the two
// never drift apart.
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  const all = await db
    .select()
    .from(semesters)
    .where(eq(semesters.userId, user.userId))
    .orderBy(desc(semesters.startDate));

  const ids = all.map((s) => s.id);
  const allMarks = ids.length
    ? await db
        .select({
          semesterId: attendanceDays.semesterId,
          date: attendanceDays.date,
          status: attendanceDays.status,
        })
        .from(attendanceDays)
        .where(inArray(attendanceDays.semesterId, ids))
    : [];

  const today = todayISO();
  const result = all.map((s) => {
    const notStarted = s.startDate > today;
    const marks = allMarks.filter((m) => m.semesterId === s.id);
    const stats = notStarted
      ? null
      : computeAttendanceStats(
          s.startDate,
          s.endDate ?? today,
          marks,
          s.requiredPercentage,
        );
    return {
      id: s.id,
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      requiredPercentage: s.requiredPercentage,
      active: s.endDate === null,
      stats,
    };
  });

  return NextResponse.json({ semesters: result });
}

// POST /api/mobile/semesters — create a new semester. no active-semester
// guard: the app supports running several at once, matching the web app.
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return unauthorized();

  let body: {
    name?: unknown;
    startDate?: unknown;
    requiredPercentage?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid request body", 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const startDate =
    typeof body.startDate === "string" ? body.startDate : "";
  const requiredPercentage = Number(body.requiredPercentage ?? 75);

  if (name.length < 1) return jsonError("give the semester a name", 400);
  if (!startDate) return jsonError("pick a start date", 400);
  if (
    !Number.isInteger(requiredPercentage) ||
    requiredPercentage < 1 ||
    requiredPercentage > 100
  ) {
    return jsonError("required percentage needs to be between 1 and 100", 400);
  }

  const [created] = await db
    .insert(semesters)
    .values({
      userId: user.userId,
      name,
      startDate,
      requiredPercentage,
    })
    .returning();

  return NextResponse.json({ semester: created }, { status: 201 });
}
