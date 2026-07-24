import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { type ThemeColors } from "@/constants/theme";
import {
  addMonths,
  getMonthMatrix,
  monthLabel,
  parseISODate,
  todayISO,
} from "@/lib/date";
import { KERALA_HOLIDAY_MAP } from "@/lib/kerala-holidays";
import { type DayStatus, type MarkedDay } from "@/lib/api";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// what a day looks like before any explicit mark is applied
function defaultStatus(dateISO: string): DayStatus | null {
  const dow = parseISODate(dateISO).getUTCDay();
  if (dow === 0 || dow === 6) return "holiday"; // weekend
  if (KERALA_HOLIDAY_MAP.has(dateISO)) return "holiday";
  return null; // regular day, unmarked
}

// tap cycles through these, matching the web app's order
const CYCLE: (DayStatus | null)[] = [
  "present",
  "half_day",
  "absent",
  "holiday",
  null,
];

function cellColors(status: DayStatus | null, theme: ThemeColors) {
  switch (status) {
    case "present":
      return { bg: theme.statusPresent, fg: "#ffffff", border: false };
    case "half_day":
      return { bg: theme.statusHalf, fg: "#ffffff", border: false };
    case "absent":
      return { bg: theme.statusAbsent, fg: "#ffffff", border: false };
    case "holiday":
      return {
        bg: theme.statusHolidayBg,
        fg: theme.statusHoliday,
        border: false,
      };
    default:
      return { bg: theme.card, fg: theme.muted, border: true };
  }
}

export function AttendanceCalendar({
  startDate,
  endDate,
  marks,
  onSetDay,
  onClearDay,
}: {
  startDate: string;
  endDate: string | null;
  marks: MarkedDay[];
  onSetDay: (date: string, status: DayStatus) => void;
  onClearDay: (date: string) => void;
}) {
  const theme = useTheme();
  const today = todayISO();
  const notStartedYet = startDate > today;

  // pick the landing month: today's month if within range, else the start
  // month (not begun) or end month (already over)
  const maxSelectable = endDate && endDate < today ? endDate : today;
  const defaultDateISO =
    startDate <= today && today <= maxSelectable
      ? today
      : notStartedYet
        ? startDate
        : (endDate ?? startDate);
  const defaultDate = parseISODate(defaultDateISO);

  const [year, setYear] = useState(defaultDate.getUTCFullYear());
  const [month, setMonth] = useState(defaultDate.getUTCMonth());

  // marks are owned by the parent so the percentage summary updates live;
  // this is just a fast lookup map derived from the prop
  const markMap = useMemo(
    () => new Map(marks.map((m) => [m.date, m.status])),
    [marks],
  );

  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  function isWeekendDay(dateISO: string): boolean {
    const dow = parseISODate(dateISO).getUTCDay();
    return dow === 0 || dow === 6;
  }

  function goToMonth(delta: number) {
    const next = addMonths(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function handleDayPress(dateISO: string) {
    if (dateISO < startDate || dateISO > maxSelectable) return;
    if (isWeekendDay(dateISO)) return; // weekends aren't markable

    const current = markMap.get(dateISO) ?? defaultStatus(dateISO);
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

    if (next === null) onClearDay(dateISO);
    else onSetDay(dateISO, next);
  }

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
      ]}
    >
      {notStartedYet && (
        <View
          style={[styles.banner, { backgroundColor: theme.statusHolidayBg }]}
        >
          <ThemedText type="small" color="muted">
            this semester starts {startDate} — nothing to mark until then.
          </ThemedText>
        </View>
      )}

      <View style={styles.navRow}>
        <Pressable onPress={() => goToMonth(-1)} hitSlop={8}>
          <ThemedText type="link" color="muted">
            ‹ prev
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.monthLabel}>
          {monthLabel(year, month)}
        </ThemedText>
        <Pressable onPress={() => goToMonth(1)} hitSlop={8}>
          <ThemedText type="link" color="muted">
            next ›
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {WEEKDAY_LABELS.map((d) => (
          <View key={d} style={styles.cell}>
            <ThemedText type="small" color="muted" style={styles.weekLabel}>
              {d}
            </ThemedText>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((dateISO, di) => {
            if (!dateISO) return <View key={di} style={styles.cell} />;

            const outOfRange =
              dateISO < startDate ||
              dateISO > maxSelectable ||
              isWeekendDay(dateISO);
            const status = markMap.get(dateISO) ?? defaultStatus(dateISO);
            const colors = cellColors(status, theme);
            const dayNum = parseISODate(dateISO).getUTCDate();
            const isToday = dateISO === today;

            return (
              <View key={dateISO} style={styles.cell}>
                <Pressable
                  disabled={outOfRange}
                  onPress={() => handleDayPress(dateISO)}
                  style={[
                    styles.day,
                    {
                      backgroundColor: outOfRange ? "transparent" : colors.bg,
                      borderWidth: isToday ? 2 : colors.border ? 1 : 0,
                      borderColor: isToday
                        ? theme.primary
                        : theme.cardBorder,
                      opacity: outOfRange ? 0.35 : 1,
                    },
                  ]}
                >
                  <ThemedText
                    style={{
                      color: outOfRange ? theme.muted : colors.fg,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {dayNum}
                  </ThemedText>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <Legend color={theme.statusPresent} label="present" />
        <Legend color={theme.statusHalf} label="half" />
        <Legend color={theme.statusAbsent} label="absent" />
        <Legend color={theme.statusHoliday} label="holiday" />
      </View>
      <ThemedText type="small" color="muted" style={styles.hint}>
        tap a day to cycle: present → half → absent → holiday → clear
      </ThemedText>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <ThemedText type="small" color="muted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: Radius,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  banner: {
    borderRadius: Radius * 0.6,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
  },
  monthLabel: { fontSize: 15, fontWeight: "600" },
  weekHeader: { flexDirection: "row" },
  weekRow: { flexDirection: "row" },
  cell: { flex: 1, aspectRatio: 1, padding: 2 },
  weekLabel: { textAlign: "center", width: "100%" },
  day: {
    flex: 1,
    borderRadius: Radius * 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  hint: { marginTop: 4 },
});
