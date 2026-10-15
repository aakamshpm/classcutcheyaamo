"use client";

import { useEffect, useState } from "react";
import { DRAW_MS } from "./attendance-ring";

// fades its content in once the attendance ring has finished drawing. the
// wait starts when the page hydrates, the same moment the ring starts, so
// the two stay in step. hidden until then (and without script).
export function Reveal({
  as: Tag = "span",
  variant,
  className = "",
  children,
}: {
  as?: "span" | "p";
  variant: "pop" | "fade";
  className?: string;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setReady(true), reduce ? 0 : DRAW_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Tag
      className={`${className} ${ready ? (variant === "pop" ? "pop-in" : "fade-in") : "opacity-0"}`}
    >
      {children}
    </Tag>
  );
}
