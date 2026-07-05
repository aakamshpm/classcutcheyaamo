import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
  pgEnum,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";

// a day is either a normal class day marked present/absent/half_day, or a
// holiday (pre-filled from the kerala calendar, or added by the user
// themselves). half_day covers colleges that mark morning/afternoon
// separately and only one session was attended.
export const dayStatusEnum = pgEnum("day_status", [
  "present",
  "absent",
  "half_day",
  "holiday",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// one row per semester. no end date means it's the currently active one
export const semesters = pgTable("semesters", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  // some colleges need 75%, some 80%, some 70% — stored as a whole number
  // percentage (e.g. 75 means 75%) so the user sets it once per semester
  requiredPercentage: integer("required_percentage").notNull().default(75),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// one row per marked day within a semester. unmarked days just don't exist
// here yet and count as "not yet decided" until the user marks them
export const attendanceDays = pgTable(
  "attendance_days",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    semesterId: uuid("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: dayStatusEnum("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("attendance_days_semester_date_idx").on(
      table.semesterId,
      table.date,
    ),
  ],
);
