// design tokens mirrored from the web app's globals.css so the app feels
// like the same product. warm off-white/dark base, deep teal accent,
// pastel status colors.
import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#fdfcfb",
    foreground: "#2b2724",
    card: "#ffffff",
    cardBorder: "#ece7e1",
    muted: "#8a8177",
    primary: "#0f6e6e",
    primaryForeground: "#ffffff",
    statusPresent: "#2f9e6e",
    statusPresentBg: "#e6f5ee",
    statusAbsent: "#d9534f",
    statusAbsentBg: "#fbebea",
    statusHalf: "#d99a3d",
    statusHalfBg: "#faf0e0",
    statusHoliday: "#a9a2ea",
    statusHolidayBg: "#edebfb",
  },
  dark: {
    background: "#171310",
    foreground: "#f2eee8",
    card: "#211c18",
    cardBorder: "#35302a",
    muted: "#a89d8f",
    primary: "#3dbdb0",
    primaryForeground: "#10201d",
    statusPresent: "#4ade90",
    statusPresentBg: "#16302a",
    statusAbsent: "#f28b87",
    statusAbsentBg: "#362221",
    statusHalf: "#e0ab5f",
    statusHalfBg: "#362a1a",
    statusHoliday: "#c3baf5",
    statusHolidayBg: "#2a2740",
  },
} as const;

export type ThemeColorName = keyof typeof Colors.light;
export type ThemeColors = Record<ThemeColorName, string>;

export const Radius = 14;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const FontMono =
  Platform.select({ ios: "ui-monospace", default: "monospace" }) ?? "monospace";
