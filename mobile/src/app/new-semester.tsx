import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { DateField } from "@/components/date-field";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { todayISO } from "@/lib/date";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function NewSemesterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [requiredPercentage, setRequiredPercentage] = useState("75");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!token) return;
    setError(null);

    const pct = Number(requiredPercentage);
    if (name.trim().length < 1) return setError("give the semester a name");
    if (!Number.isInteger(pct) || pct < 1 || pct > 100)
      return setError("required % must be a whole number between 1 and 100");

    setSubmitting(true);
    try {
      await api.createSemester(token, {
        name: name.trim(),
        startDate,
        requiredPercentage: pct,
      });
      router.back();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "couldn't create the semester",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <ThemedText type="small" color="muted">
              semester name
            </ThemedText>
            <Input
              placeholder="e.g. semester 5"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" color="muted">
              start date
            </ThemedText>
            <DateField value={startDate} onChange={setStartDate} />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" color="muted">
              minimum attendance % your college needs
            </ThemedText>
            <Input
              placeholder="75"
              value={requiredPercentage}
              onChangeText={setRequiredPercentage}
              keyboardType="number-pad"
            />
            <ThemedText type="small" color="muted">
              most colleges need 75%, some ask 70% or 80%
            </ThemedText>
          </View>

          {error && (
            <ThemedText type="small" color="statusAbsent">
              {error}
            </ThemedText>
          )}

          <Button
            title="start semester"
            onPress={onSubmit}
            loading={submitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.lg, gap: Spacing.lg },
  field: { gap: Spacing.xs },
});
