import { TONE_COLOR, type Tone } from "@/lib/semester-status";

const SIZE = 200;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// circular gauge starting at 12 o'clock, with a tick where the semester's
// required percentage sits so the gap to it is visible at a glance.
// `percent` is 0-100 (null when nothing has been marked yet).
export function AttendanceRing({
  percent,
  required,
  tone,
  caption = "overall attendance",
}: {
  percent: number | null;
  required: number;
  tone: Tone | null;
  caption?: string;
}) {
  const color = tone ? TONE_COLOR[tone] : "var(--status-holiday)";
  const filled = percent === null ? 0 : Math.min(100, Math.max(0, percent));

  // tick runs across the ring at the threshold angle. the svg itself is
  // rotated to start at 12 o'clock, so this angle is measured from 3 o'clock
  // like the unrotated drawing
  const angle = (required / 100) * 2 * Math.PI;
  const inner = RADIUS - STROKE / 2 - 3;
  const outer = RADIUS + STROKE / 2 + 3;
  const c = SIZE / 2;

  return (
    <div className="relative mx-auto w-full max-w-[13rem]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={
          percent === null
            ? "no attendance marked yet"
            : `${percent}% attendance, ${required}% required`
        }
        className="block w-full -rotate-90"
      >
        <circle
          cx={c}
          cy={c}
          r={RADIUS}
          fill="none"
          stroke="var(--status-holiday-bg)"
          strokeWidth={STROKE}
        />
        <circle
          cx={c}
          cy={c}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${(filled / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
        />
        <line
          x1={c + inner * Math.cos(angle)}
          y1={c + inner * Math.sin(angle)}
          x2={c + outer * Math.cos(angle)}
          y2={c + outer * Math.sin(angle)}
          stroke="var(--gold)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="tnum text-4xl font-semibold tracking-tight" style={{ color }}>
          {percent === null ? "--" : percent}
          {percent !== null && <span className="text-xl">%</span>}
        </p>
        <p className="text-xs text-muted">{caption}</p>
      </div>
    </div>
  );
}
