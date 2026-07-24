import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ApiError, useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace("/dashboard");
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "something went wrong, try again",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedText type="title">classcutcheyaamo?</ThemedText>
            <ThemedText type="muted" style={styles.subtitle}>
              log in to track your attendance
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
            <Input
              placeholder="password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {error && (
              <ThemedText type="small" color="statusAbsent">
                {error}
              </ThemedText>
            )}

            <Button
              title="log in"
              onPress={onSubmit}
              loading={submitting}
              disabled={!username || !password}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/signup")}
            style={styles.switch}
          >
            <ThemedText type="muted">
              new here?{" "}
              <ThemedText type="link">create an account</ThemedText>
            </ThemedText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  header: { alignItems: "center", gap: Spacing.sm },
  subtitle: { textAlign: "center" },
  form: { gap: Spacing.md },
  switch: { alignItems: "center", paddingVertical: Spacing.sm },
});
