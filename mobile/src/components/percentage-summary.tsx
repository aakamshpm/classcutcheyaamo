import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { type AttendanceStats } from "@/lib/api";
import { todayISO } from "@/lib/date";
import { formatPercent } from "@/lib/format";

// mirrors the website's PercentageSummary: big live %, safe-to-bunk /
// need-to-attend line, unmarked-days warning, and a future-start message.
export function PercentageSummary({
  startDate,
  endDate,
  requiredPercentage,
  stats,
}: {
  startDate: string;
  endDate: string | null;
  requiredPercentage: number;
  stats: AttendanceStats | null;
}) {
  const theme = useTheme();
  const today = todayISO();

  if (startDate > today) {
    return (
      <View
        style={[
          styles.plain,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
        ]}
      >
        <ThemedText type="small" color="muted">
          this semester starts on {startDate}, which hasn&apos;t arrived yet —
          nothing to track until then.
        </ThemedText>
      </View>
    );
  }

  if (!stats || stats.percentage === null) {
    return (
      <View
        style={[
          styles.plain,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
        ]}
      >
        <ThemedText type="small" color="muted">
          no working days marked yet. tap a day on the calendar to get started.
        </ThemedText>
      </View>
    );
  }

  const isSafe = stats.percentage >= requiredPercentage / 100;
  const color = isSafe ? theme.statusPresent : theme.statusAbsent;
  const bg = isSafe ? theme.statusPresentBg : theme.statusAbsentBg;

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: color }]}>
      <ThemedText type="small" color="muted" style={styles.label}>
        ATTENDANCE
      </ThemedText>
      <ThemedText style={[styles.big, { color }]}>
        {formatPercent(stats.percentage)}
      </ThemedText>
      <ThemedText type="small" color="muted">
        {stats.presentDays} present / {stats.workingDays} working days
        {stats.halfDays > 0
          ? ` (incl. ${stats.halfDays} half day${
              stats.halfDays === 1 ? "" : "s"
            })`
          : ""}
      </ThemedText>

      <ThemedText style={[styles.status, { color }]}>
        {isSafe
          ? stats.safeToBunk > 0
            ? `you can safely miss ${stats.safeToBunk} more day${
                stats.safeToBunk === 1 ? "" : "s"
              } and stay at ${requiredPercentage}%+`
            : `you're exactly at ${requiredPercentage}%, one more absence and you're below`
          : `attend the next ${stats.needToAttend} day${
              stats.needToAttend === 1 ? "" : "s"
            } in a row to get back to ${requiredPercentage}%`}
      </ThemedText>

      {stats.unmarkedDays > 0 && (
        <ThemedText type="small" color="muted" style={styles.warn}>
          ⚠ {stats.unmarkedDays} day{stats.unmarkedDays === 1 ? "" : "s"} up to
          today {stats.unmarkedDays === 1 ? "isn't" : "aren't"} marked yet —
          the percentage above doesn&apos;t include{" "}
          {stats.unmarkedDays === 1 ? "it" : "them"}.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plain: {
    borderWidth: 1,
    borderRadius: Radius,
    padding: Spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius,
    padding: Spacing.lg,
    gap: 4,
  },
  label: { letterSpacing: 1, fontWeight: "600" },
  big: { fontSize: 44, fontWeight: "700", lineHeight: 50 },
  status: { marginTop: Spacing.sm, fontSize: 14 },
  warn: { marginTop: Spacing.sm },
});
