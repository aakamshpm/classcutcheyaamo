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

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signup(username.trim(), password);
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
              make an account to get started
            </ThemedText>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="username (min 3 characters)"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
            <Input
              placeholder="password (min 6 characters)"
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
              title="sign up"
              onPress={onSubmit}
              loading={submitting}
              disabled={!username || !password}
            />
          </View>

          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.switch}
          >
            <ThemedText type="muted">
              already have an account?{" "}
              <ThemedText type="link">log in</ThemedText>
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
