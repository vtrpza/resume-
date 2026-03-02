"use client";

import { useState, useEffect } from "react";

const ROTATING_TIPS = [
  "We never store your resume or job description.",
  "Checking for ATS risk and missing skills.",
  "Tailoring bullets to job keywords improves match scores.",
] as const;

const TIP_INTERVAL_MS = 5500;

export function ScanLoadingView({
  loadingStep,
  steps,
}: {
  loadingStep: number;
  steps: readonly string[];
}) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % ROTATING_TIPS.length);
    }, TIP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = steps.length > 0
    ? ((loadingStep + 1) / steps.length) * 100
    : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Analyzing your match. Step ${loadingStep + 1} of ${steps.length}. ${steps[loadingStep] ?? ""}`}
      className="flex min-h-[420px] flex-col"
    >
      <h2 className="text-xl font-semibold text-white sm:text-2xl">
        Analyzing your match…
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Usually 10–20 seconds. Hang tight.
      </p>

      {/* Central visual: two overlapping doc shapes with subtle shimmer */}
      <div
        className="relative mt-8 flex h-24 items-center justify-center sm:mt-10 sm:h-28"
        aria-hidden
      >
        <div className="relative h-16 w-20 sm:h-20 sm:w-24">
          <div
            className="absolute inset-0 rounded-lg border border-zinc-600/80 bg-zinc-800/60"
            style={{ transform: "rotate(-6deg)" }}
          />
          <div
            className="absolute inset-0 rounded-lg border border-zinc-500/80 bg-zinc-700/50"
            style={{ transform: "rotate(4deg)" }}
          />
          <div
            className="scan-shimmer absolute inset-0 rounded-lg border border-zinc-500/40 bg-gradient-to-br from-zinc-600/30 to-transparent opacity-60"
            style={{ transform: "rotate(4deg)" }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-full overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className="h-1.5 rounded-full bg-white/90 transition-[width] duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step list */}
      <ul className="mt-6 space-y-3" aria-label="Analysis steps">
        {steps.map((label, i) => {
          const isCompleted = i < loadingStep;
          const isCurrent = i === loadingStep;
          return (
            <li
              key={i}
              className="flex items-center gap-3 text-sm"
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors"
                aria-hidden
              >
                {isCompleted ? (
                  <span className="text-emerald-400" aria-hidden>
                    ✓
                  </span>
                ) : isCurrent ? (
                  <span
                    className="h-2 w-2 rounded-full bg-white animate-pulse-soft"
                    aria-hidden
                  />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full bg-zinc-600"
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={
                  isCompleted
                    ? "text-zinc-500"
                    : isCurrent
                      ? "font-medium text-white"
                      : "text-zinc-600"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Rotating tip */}
      <p className="mt-6 text-xs text-zinc-500" aria-live="polite">
        {ROTATING_TIPS[tipIndex]}
      </p>
    </div>
  );
}
