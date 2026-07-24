import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { SemesterCard } from "@/components/semester-card";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { api, ApiError, type SemesterSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token, username, logout } = useAuth();

  const [semesters, setSemesters] = useState<SemesterSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (isRefresh) setRefreshing(true);
      setError(null);
      try {
        const res = await api.listSemesters(token);
        setSemesters(res.semesters);
      } catch (e) {
        // an expired/invalid token means we should bounce to login
        if (e instanceof ApiError && e.status === 401) {
          await logout();
          router.replace("/login");
          return;
        }
        setError(
          e instanceof ApiError ? e.message : "couldn't load your semesters",
        );
      } finally {
        setRefreshing(false);
      }
    },
    [token, logout, router],
  );

  // refetch every time the screen regains focus (e.g. after creating a
  // semester or marking attendance and coming back)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  const active = semesters?.filter((s) => s.active) ?? [];
  const past = semesters?.filter((s) => !s.active) ?? [];

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <ThemedText type="subtitle">hey, {username}</ThemedText>
          <Pressable onPress={onLogout} hitSlop={8}>
            <ThemedText type="muted" style={styles.logout}>
              log out
            </ThemedText>
          </Pressable>
        </View>

        {semesters === null && !error ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText color="statusAbsent">{error}</ThemedText>
            <Button
              title="try again"
              variant="secondary"
              onPress={() => load()}
              style={styles.retry}
            />
          </View>
        ) : (
          <>
            {active.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" color="muted" style={styles.label}>
                  ACTIVE
                </ThemedText>
                {active.map((s) => (
                  <SemesterCard key={s.id} semester={s} />
                ))}
              </View>
            )}

            {past.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="small" color="muted" style={styles.label}>
                  PAST
                </ThemedText>
                {past.map((s) => (
                  <SemesterCard key={s.id} semester={s} />
                ))}
              </View>
            )}

            {semesters && semesters.length === 0 && (
              <View style={styles.centered}>
                <ThemedText type="muted" style={styles.emptyText}>
                  no semesters yet. start one whenever your sem begins.
                </ThemedText>
              </View>
            )}

            <Button
              title="+ new semester"
              variant="secondary"
              onPress={() => router.push("/new-semester")}
              style={styles.newButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logout: { textDecorationLine: "underline" },
  centered: { alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.xxl },
  retry: { alignSelf: "stretch" },
  section: { gap: Spacing.md },
  label: { letterSpacing: 1, fontWeight: "600" },
  emptyText: { textAlign: "center" },
  newButton: { marginTop: Spacing.sm },
});
