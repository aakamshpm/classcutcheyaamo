import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { Card } from "@/components/card";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { type SemesterSummary } from "@/lib/api";
import { formatPercent, percentColor, statusLine } from "@/lib/format";

export function SemesterCard({ semester }: { semester: SemesterSummary }) {
  const theme = useTheme();
  const router = useRouter();
  const { stats, requiredPercentage } = semester;

  const pct = stats?.percentage ?? null;
  const color =
    pct !== null ? percentColor(pct, requiredPercentage, theme) : theme.muted;

  return (
    <Pressable
      onPress={() => router.push(`/semester/${semester.id}`)}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <Card>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <ThemedText type="subtitle">{semester.name}</ThemedText>
            <ThemedText type="muted" style={styles.dates}>
              {semester.startDate}
              {semester.endDate ? ` → ${semester.endDate}` : " → ongoing"}
            </ThemedText>
          </View>
          {pct !== null && (
            <ThemedText style={[styles.pct, { color }]}>
              {formatPercent(pct)}
            </ThemedText>
          )}
        </View>

        <View style={styles.bottomRow}>
          <ThemedText type="small" color="muted">
            needs {requiredPercentage}%
          </ThemedText>
          {stats && stats.percentage !== null && (
            <ThemedText type="small" style={{ color }}>
              {statusLine(stats, requiredPercentage)}
            </ThemedText>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  titleWrap: { flex: 1, gap: 2 },
  dates: { fontSize: 13 },
  pct: { fontSize: 26, fontWeight: "700" },
  bottomRow: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
});
