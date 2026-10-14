import { renderPwaIcon } from "@/lib/pwa-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return renderPwaIcon(64);
}
