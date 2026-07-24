import { StyleSheet, Text, type TextProps } from "react-native";

import { type ThemeColorName } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "subtitle" | "small" | "muted" | "link";
  color?: ThemeColorName;
};

export function ThemedText({
  style,
  type = "default",
  color,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const resolvedColor =
    color !== undefined
      ? theme[color]
      : type === "muted"
        ? theme.muted
        : type === "link"
          ? theme.primary
          : theme.foreground;

  return (
    <Text
      style={[
        { color: resolvedColor },
        type === "default" && styles.default,
        type === "title" && styles.title,
        type === "subtitle" && styles.subtitle,
        type === "small" && styles.small,
        type === "muted" && styles.small,
        type === "link" && styles.link,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  subtitle: { fontSize: 20, fontWeight: "600", lineHeight: 26 },
  small: { fontSize: 13, lineHeight: 18 },
  link: { fontSize: 14, fontWeight: "500" },
});
