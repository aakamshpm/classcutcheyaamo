import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/lib/auth-context";

// entry point: wait for the stored session to load, then bounce to either
// the dashboard (logged in) or the login screen.
export default function Index() {
  const { token, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return <Redirect href={token ? "/dashboard" : "/login"} />;
}
