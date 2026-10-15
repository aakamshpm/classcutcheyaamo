"use client";

import { useEffect, useRef, useState } from "react";
import { TONE_COLOR, type Tone } from "@/lib/semester-status";

const SIZE = 200;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ms the ring takes to draw and the number takes to count up. the verdict
// chip next to it waits this long before fading in (see .pop-in)
export const DRAW_MS = 400;

// eases from the last shown value to `target`. starts at 0 on first render
// so the ring draws and the number counts up when the screen opens, and
// later changes glide from wherever they were. with `enabled` off it just
// returns the target.
function useTween(target: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const shown = useRef(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) return;
    const from = shown.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let frame = 0;

    function tick(now: number) {
      // the frame timestamp can land a hair before `started`, which would
      // ease to a negative value
      const t = reduce ? 1 : Math.min(1, Math.max(0, (now - started) / DRAW_MS));
      const eased = 1 - (1 - t) ** 3;
      shown.current = from + (target - from) * eased;
      setValue(shown.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled]);

  return enabled ? value : target;
}

// circular gauge starting at 12 o'clock, with a tick where the semester's
// required percentage sits so the gap to it is visible at a glance.
// `percent` is 0-100 (null when nothing has been marked yet).
export function AttendanceRing({
  percent,
  required,
  tone,
  caption = "overall attendance",
  animate = true,
}: {
  percent: number | null;
  required: number;
  tone: Tone | null;
  caption?: string;
  // turn off where the value follows a control (a slider) and should
  // not lag behind it
  animate?: boolean;
}) {
  const color = tone ? TONE_COLOR[tone] : "var(--status-holiday)";
  const target = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  const filled = useTween(target, animate);
  const shownPercent = Math.round(filled * 10) / 10;

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
          {percent === null ? "--" : shownPercent}
          {percent !== null && <span className="text-xl">%</span>}
        </p>
        <p className="text-xs text-muted">{caption}</p>
      </div>
    </div>
  );
}
