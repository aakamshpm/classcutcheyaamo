import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Switch, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Card } from "@/components/card";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import {
  applyReminder,
  DEFAULT_REMINDER,
  formatTime,
  loadReminderPref,
  requestPermission,
  type ReminderPref,
} from "@/lib/reminders";

// a card on the dashboard: toggle a daily "mark your attendance" reminder
// and pick the time. all local, persisted, and re-synced with the OS on
// every change.
export function ReminderCard() {
  const theme = useTheme();
  const [pref, setPref] = useState<ReminderPref>(DEFAULT_REMINDER);
  const [loaded, setLoaded] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadReminderPref().then((p) => {
      setPref(p);
      setLoaded(true);
    });
  }, []);

  async function onToggle(next: boolean) {
    if (next) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "notifications are off",
          "enable notifications for this app in your phone's settings to get reminders.",
        );
        return;
      }
    }
    const updated = { ...pref, enabled: next };
    setPref(updated);
    await applyReminder(updated);
  }

  function onTimeChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "set" && date) {
      const updated = {
        ...pref,
        hour: date.getHours(),
        minute: date.getMinutes(),
      };
      setPref(updated);
      applyReminder(updated);
      if (Platform.OS === "ios") setShowPicker(false);
    } else if (event.type === "dismissed") {
      setShowPicker(false);
    }
  }

  if (!loaded) return null;

  const pickerDate = new Date();
  pickerDate.setHours(pref.hour, pref.minute, 0, 0);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <ThemedText style={styles.title}>daily reminder</ThemedText>
          <ThemedText type="small" color="muted">
            a nudge to mark your attendance
          </ThemedText>
        </View>
        <Switch
          value={pref.enabled}
          onValueChange={onToggle}
          trackColor={{ true: theme.primary }}
        />
      </View>

      {pref.enabled && (
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[styles.timeRow, { borderTopColor: theme.cardBorder }]}
        >
          <ThemedText type="small" color="muted">
            remind me at
          </ThemedText>
          <ThemedText type="link">
            {formatTime(pref.hour, pref.minute)}
          </ThemedText>
        </Pressable>
      )}

      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  textCol: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "600" },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
  },
});
