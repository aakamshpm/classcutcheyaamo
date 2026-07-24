// where the mobile app talks to. points at the deployed website's mobile
// api by default; override with EXPO_PUBLIC_API_BASE during local dev to
// hit a dev server (e.g. your machine's LAN ip so a phone can reach it).
const DEFAULT_API_BASE = "https://classcutcheyaamo.vercel.app";

export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE?.replace(/\/$/, "") ?? DEFAULT_API_BASE;

export const MOBILE_API = `${API_BASE}/api/mobile`;
