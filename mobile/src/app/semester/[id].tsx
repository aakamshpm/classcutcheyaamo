import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// placeholder — the real semester screen (calendar + marking + live stats)
// lands in the next phase. for now it just confirms routing works.
export default function SemesterScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <ThemedText type="muted">
          the calendar and attendance marking for this semester show up here
          next.
        </ThemedText>
        <ThemedText type="small" color="muted">
          semester id: {id}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
});
