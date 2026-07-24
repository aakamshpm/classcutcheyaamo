import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { AuthProvider } from "@/lib/auth-context";

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.foreground,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen
            name="dashboard"
            options={{ title: "your semesters", headerBackVisible: false }}
          />
          <Stack.Screen
            name="new-semester"
            options={{ title: "new semester", presentation: "modal" }}
          />
          <Stack.Screen name="semester/[id]" options={{ title: "" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
