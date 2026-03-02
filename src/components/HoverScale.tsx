"use client";

import { motion } from "motion/react";

export function HoverScale({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.01,
        boxShadow: "0 0 0 1px var(--border-muted), 0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.08)",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}
