import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// a single daily local reminder ("mark your attendance"). local-only, no
// push server involved — works in Expo Go. the user's preference (on/off +
// time) is persisted in secure store so it survives app restarts, and we
// re-sync the actual OS schedule from that preference.

const ENABLED_KEY = "reminder_enabled";
const HOUR_KEY = "reminder_hour";
const MINUTE_KEY = "reminder_minute";
const ANDROID_CHANNEL = "daily-reminder";

export type ReminderPref = {
  enabled: boolean;
  hour: number; // 0–23
  minute: number; // 0–59
};

export const DEFAULT_REMINDER: ReminderPref = {
  enabled: false,
  hour: 20, // 8:00 pm — a sensible end-of-day nudge
  minute: 0,
};

// foreground behaviour: show the banner even if the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function loadReminderPref(): Promise<ReminderPref> {
  const enabled = (await SecureStore.getItemAsync(ENABLED_KEY)) === "1";
  const hour = Number(await SecureStore.getItemAsync(HOUR_KEY));
  const minute = Number(await SecureStore.getItemAsync(MINUTE_KEY));
  return {
    enabled,
    hour: Number.isInteger(hour) ? hour : DEFAULT_REMINDER.hour,
    minute: Number.isInteger(minute) ? minute : DEFAULT_REMINDER.minute,
  };
}

async function savePref(pref: ReminderPref) {
  await SecureStore.setItemAsync(ENABLED_KEY, pref.enabled ? "1" : "0");
  await SecureStore.setItemAsync(HOUR_KEY, String(pref.hour));
  await SecureStore.setItemAsync(MINUTE_KEY, String(pref.minute));
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: "Daily reminder",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// asks the OS for permission; returns true if granted. on android 13+ the
// channel must exist before the prompt shows.
export async function requestPermission(): Promise<boolean> {
  await ensureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (
    existing.granted ||
    existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const req = await Notifications.requestPermissionsAsync();
  return (
    req.granted ||
    req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

// wipes any existing reminder and, if enabled, schedules a fresh daily one.
// called whenever the preference changes so the OS schedule always matches.
export async function applyReminder(pref: ReminderPref): Promise<void> {
  await savePref(pref);
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!pref.enabled) return;

  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "classcutcheyaamo?",
      body: "did you mark today's attendance yet?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: pref.hour,
      minute: pref.minute,
      ...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL } : {}),
    },
  });
}

// pretty 12-hour label like "8:00 pm" for the settings row
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "pm" : "am";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}
