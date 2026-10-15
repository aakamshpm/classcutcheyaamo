// light/dark choice. "auto" follows the device and stores nothing; light and
// dark are remembered on this device only (localStorage), so a pick doesn't
// follow you to another phone.

export type Theme = "light" | "dark" | "auto";

export const THEME_KEY = "cc-theme";

// same as --background in globals.css, for the browser's address bar / status
// bar colour
const THEME_COLOR = { light: "#fbf7ee", dark: "#121714" } as const;
const BAR_ATTR = "data-cc-theme-color";

// next renders one theme-color meta per scheme and may rebuild them on
// navigation, so a pick doesn't edit those. it puts its own meta first in
// <head> (no media query, so it always matches and wins), and auto removes it.
function setBarColor(theme: Theme) {
  const existing = document.head.querySelector(`meta[${BAR_ATTR}]`);
  if (theme === "auto") {
    existing?.remove();
    return;
  }
  const meta = existing ?? document.createElement("meta");
  meta.setAttribute("name", "theme-color");
  meta.setAttribute(BAR_ATTR, "");
  meta.setAttribute("content", THEME_COLOR[theme]);
  if (!existing) document.head.prepend(meta);
}

// runs in <head> before first paint so a saved pick doesn't flash the other
// theme
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")return;document.documentElement.dataset.theme=t;var m=document.createElement("meta");m.setAttribute("name","theme-color");m.setAttribute("${BAR_ATTR}","");m.setAttribute("content",t==="dark"?"${THEME_COLOR.dark}":"${THEME_COLOR.light}");document.head.prepend(m)}catch(e){}})();`;

const listeners = new Set<() => void>();

export function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  // another tab changed it
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" || saved === "dark" ? saved : "auto";
  } catch {
    // storage blocked, behave as if nothing was picked
    return "auto";
  }
}

export function setTheme(theme: Theme) {
  try {
    if (theme === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {
    // still apply it for this visit
  }

  const root = document.documentElement;
  if (theme === "auto") delete root.dataset.theme;
  else root.dataset.theme = theme;

  setBarColor(theme);

  listeners.forEach((fn) => fn());
}
