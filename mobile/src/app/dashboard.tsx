import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth-context";

// placeholder — the real dashboard (semester list + live %) lands in the
// next phase. for now it just confirms we're authenticated and can log out.
export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { username, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <ThemedText type="subtitle">hey, {username}</ThemedText>
        <ThemedText type="muted">
          you&apos;re logged in. the semester list shows up here next.
        </ThemedText>
        <Button title="log out" variant="secondary" onPress={onLogout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
});
