import { ImageResponse } from "next/og";

// one drawing for every icon the app needs (favicon, apple touch icon,
// manifest icons), so they can never drift apart. it's an attendance ring
// filled to 75% with a check inside — the whole app in one glyph. colours
// are kept up here so the redesign only has to touch these.
const BG = "#0f6e6e";
const RING = "#fdfcfb";
const CHECK = "#f2c14e";

type IconOptions = {
  // maskable icons get cropped to a circle/squircle by the os, so the
  // background goes edge to edge and the glyph stays inside the safe zone
  maskable?: boolean;
  // apple touch icons must be opaque, the os rounds the corners itself
  opaque?: boolean;
};

export function renderPwaIcon(
  size: number,
  { maskable = false, opaque = false }: IconOptions = {},
) {
  const glyph = Math.round(size * (maskable ? 0.58 : 0.66));
  const fullBleed = maskable || opaque;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          borderRadius: fullBleed ? 0 : Math.round(size * 0.22),
        }}
      >
        <svg width={glyph} height={glyph} viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={RING}
            strokeOpacity="0.28"
            strokeWidth="9"
          />
          <path
            d="M 50 10 A 40 40 0 1 1 10 50"
            fill="none"
            stroke={RING}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M 35 51 L 46 62 L 66 39"
            fill="none"
            stroke={CHECK}
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
