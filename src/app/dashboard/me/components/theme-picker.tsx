"use client";

import { useSyncExternalStore } from "react";
import { HalfIcon, MoonIcon, SunIcon } from "@/app/components/icons";
import {
  getTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "light", icon: <SunIcon className="h-5 w-5" /> },
  { value: "dark", label: "dark", icon: <MoonIcon className="h-5 w-5" /> },
  { value: "auto", label: "auto", icon: <HalfIcon className="h-5 w-5" /> },
];

export function ThemePicker() {
  // the pick lives in localStorage, so the server can't know it. the server
  // render shows auto and the real value takes over once it's on the device.
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "auto");

  return (
    <div role="group" aria-label="theme" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
          className="choice"
          style={
            {
              "--tone": "var(--primary)",
              "--tone-bg": "var(--status-present-bg)",
            } as React.CSSProperties
          }
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
