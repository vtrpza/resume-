"use client";

import { motion } from "motion/react";

type CopyButtonProps = {
  onClick: () => void;
  copied: boolean;
  label: string;
  copiedLabel?: string;
  className?: string;
  size?: "sm" | "md";
};

export function CopyButton({
  onClick,
  copied,
  label,
  copiedLabel = "✓ Copied",
  className = "",
  size = "md",
}: CopyButtonProps) {
  const sizeClass = size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`focus-ring active:opacity-90 shrink-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] ${sizeClass} font-medium text-[var(--text-primary)] transition hover:bg-[var(--border-muted)] ${className}`}
      whileTap={{ scale: 0.98 }}
      animate={copied ? { scale: [1, 1.05, 1], transition: { duration: 0.25 } } : {}}
    >
      {copied ? copiedLabel : label}
    </motion.button>
  );
}
