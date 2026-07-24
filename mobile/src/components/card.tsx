import { View, type ViewProps } from "react-native";

import { Radius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

// a bordered surface matching the web app's .card
export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
          borderWidth: 1,
          borderRadius: Radius,
          padding: 20,
        },
        style,
      ]}
      {...rest}
    />
  );
}
