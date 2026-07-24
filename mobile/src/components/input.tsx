import { StyleSheet, TextInput, type TextInputProps } from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Input(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      style={[
        styles.input,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          color: theme.foreground,
        },
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius * 0.7,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
});
