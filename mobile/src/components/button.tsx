import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function Button({
  title,
  loading,
  variant = "primary",
  disabled,
  style,
  ...rest
}: Props) {
  const theme = useTheme();
  const isPrimary = variant === "primary";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        {
          backgroundColor: isPrimary ? theme.primary : "transparent",
          borderColor: theme.cardBorder,
          borderWidth: isPrimary ? 0 : 1,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.85 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.primaryForeground : theme.foreground}
        />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isPrimary ? theme.primaryForeground : theme.foreground },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
