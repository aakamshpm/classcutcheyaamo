import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AttendanceCalendar } from "@/components/attendance-calendar";
import { Button } from "@/components/button";
import { PercentageSummary } from "@/components/percentage-summary";
import { SemesterSettings } from "@/components/semester-settings";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  api,
  ApiError,
  type DayStatus,
  type MarkedDay,
  type SemesterDetail,
} from "@/lib/api";
import { computeAttendanceStats } from "@/lib/attendance";
import { todayISO } from "@/lib/date";
import { useAuth } from "@/lib/auth-context";

export default function SemesterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, logout } = useAuth();

  const [detail, setDetail] = useState<SemesterDetail | null>(null);
  const [marks, setMarks] = useState<MarkedDay[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setError(null);
    try {
      const res = await api.getSemester(token, id);
      setDetail(res);
      setMarks(res.marks);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      setError(
        e instanceof ApiError ? e.message : "couldn't load this semester",
      );
    }
  }, [token, id, logout, router]);

  useLayoutEffect(() => {
    if (detail) navigation.setOptions({ title: detail.semester.name });
  }, [detail, navigation]);

  // initial load
  useEffect(() => {
    load();
  }, [load]);

  // recompute stats locally from the current marks so the summary updates
  // the instant a day is tapped
  const sem = detail?.semester;
  const liveStats =
    sem && sem.startDate <= todayISO()
      ? computeAttendanceStats(
          sem.startDate,
          sem.endDate ?? todayISO(),
          marks,
          sem.requiredPercentage,
        )
      : null;

  function applyMark(date: string, status: DayStatus) {
    setMarks((prev) => {
      const rest = prev.filter((m) => m.date !== date);
      return [...rest, { date, status }];
    });
  }
  function removeMark(date: string) {
    setMarks((prev) => prev.filter((m) => m.date !== date));
  }

  async function onSetDay(date: string, status: DayStatus) {
    if (!token || !id) return;
    const prev = marks;
    applyMark(date, status); // optimistic
    try {
      await api.setDay(token, id, date, status);
    } catch {
      setMarks(prev); // roll back on failure
      Alert.alert("couldn't save", "that change didn't go through, try again");
    }
  }

  async function onClearDay(date: string) {
    if (!token || !id) return;
    const prev = marks;
    removeMark(date); // optimistic
    try {
      await api.clearDay(token, id, date);
    } catch {
      setMarks(prev);
      Alert.alert("couldn't save", "that change didn't go through, try again");
    }
  }

  async function onEditStartDate(startDate: string) {
    if (!token || !id) return;
    await api.updateSemester(token, id, { startDate });
    await load();
  }

  async function onEditRequired(requiredPercentage: number) {
    if (!token || !id) return;
    await api.updateSemester(token, id, { requiredPercentage });
    await load();
  }

  async function onEndSemester(endDate: string) {
    if (!token || !id) return;
    await api.endSemester(token, id, endDate);
    await load();
  }

  if (error) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <View style={styles.centered}>
          <ThemedText color="statusAbsent">{error}</ThemedText>
          <Button title="try again" variant="secondary" onPress={load} />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail || !sem) {
    return (
      <SafeAreaView
        edges={["bottom"]}
        style={[styles.safe, { backgroundColor: theme.background }]}
      >
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="muted">
          {sem.startDate}
          {sem.endDate ? ` → ${sem.endDate}` : " → ongoing"} · needs{" "}
          {sem.requiredPercentage}%
        </ThemedText>

        <PercentageSummary
          startDate={sem.startDate}
          endDate={sem.endDate}
          requiredPercentage={sem.requiredPercentage}
          stats={liveStats}
        />

        <AttendanceCalendar
          startDate={sem.startDate}
          endDate={sem.endDate}
          marks={marks}
          onSetDay={onSetDay}
          onClearDay={onClearDay}
        />

        <SemesterSettings
          startDate={sem.startDate}
          requiredPercentage={sem.requiredPercentage}
          active={sem.active}
          onEditStart={onEditStartDate}
          onEditRequired={onEditRequired}
          onEnd={onEndSemester}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
  },
});
