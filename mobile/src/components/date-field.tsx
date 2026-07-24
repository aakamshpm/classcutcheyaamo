import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { parseISODate, toISODate } from "@/lib/date";

// a tappable field that opens the OS's native date picker. value/onChange
// work in 'YYYY-MM-DD' strings to match the rest of the app. no keyboard
// involved, so it also sidesteps the keyboard-dismiss tap issue entirely.
export function DateField({
  value,
  onChange,
  minimumDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  minimumDate?: string;
}) {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  function handleChange(event: DateTimePickerEvent, date?: Date) {
    // on android the picker is a one-shot dialog: it closes itself and
    // fires "set" (picked) or "dismissed" (cancelled)
    if (Platform.OS === "android") setShow(false);
    if (event.type === "set" && date) {
      onChange(toISODate(date));
      if (Platform.OS === "ios") setShow(false);
    } else if (event.type === "dismissed" && Platform.OS === "ios") {
      setShow(false);
    }
  }

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        style={[
          styles.field,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
        ]}
      >
        <ThemedText>{value}</ThemedText>
        <ThemedText color="muted">📅</ThemedText>
      </Pressable>

      {show && (
        <DateTimePicker
          value={parseISODate(value)}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={minimumDate ? parseISODate(minimumDate) : undefined}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderRadius: Radius * 0.7,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
});
