"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

const ROTATING_TIPS = [
  "We never store your resume or job description.",
  "Checking for ATS risks, keyword gaps, and weak bullets.",
  "Building your apply recommendation based on this specific role.",
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
      <motion.h2
        className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Analyzing your match…
      </motion.h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Usually 15–25 seconds. Hang tight.
      </p>

      {/* Central visual: overlapping doc shapes with motion */}
      <div
        className="relative mt-8 flex h-24 items-center justify-center sm:mt-10 sm:h-28"
        aria-hidden
      >
        <div className="relative h-16 w-20 sm:h-20 sm:w-24">
          <motion.div
            className="absolute inset-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
            style={{ rotate: -6 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-lg border border-[var(--border-muted)] bg-[var(--bg-surface-hover)]"
            style={{ rotate: 4 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-lg border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-transparent"
            style={{ rotate: 4 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          />
        </div>
      </div>

      {/* Progress bar with spring */}
      <div className="mt-6 w-full overflow-hidden rounded-full bg-[var(--bg-surface-hover)]">
        <motion.div
          className="h-1.5 rounded-full bg-[var(--accent)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 25 }}
        />
      </div>

      {/* Step list */}
      <ul className="mt-6 space-y-3" aria-label="Analysis steps">
        {steps.map((label, i) => {
          const isCompleted = i < loadingStep;
          const isCurrent = i === loadingStep;
          return (
            <motion.li
              key={i}
              className="flex items-center gap-3 text-sm"
              aria-current={isCurrent ? "step" : undefined}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] transition-colors"
                aria-hidden
              >
                {isCompleted ? (
                  <span className="text-emerald-400" aria-hidden>✓</span>
                ) : isCurrent ? (
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[var(--accent)]"
                    aria-hidden
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <span
                    className="h-2 w-2 rounded-full bg-[var(--border-subtle)]"
                    aria-hidden
                  />
                )}
              </span>
              <span
                className={
                  isCompleted
                    ? "text-[var(--text-faint)]"
                    : isCurrent
                      ? "font-medium text-[var(--text-primary)]"
                      : "text-[var(--text-faint)]"
                }
              >
                {label}
              </span>
            </motion.li>
          );
        })}
      </ul>

      {/* Rotating tip */}
      <motion.p
        className="mt-6 text-xs text-[var(--text-faint)]"
        aria-live="polite"
        key={tipIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {ROTATING_TIPS[tipIndex]}
      </motion.p>
    </div>
  );
}
