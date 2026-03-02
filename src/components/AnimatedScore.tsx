"use client";

import { useEffect, useState } from "react";
import { animate } from "motion/react";

const DURATION_MS = 1200;

export function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: DURATION_MS / 1000,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value]);

  return <span className="font-mono tabular-nums">{display}%</span>;
}
