"use client";

import { Children } from "react";
import { motion } from "motion/react";

const stagger = 0.08;
const initial = { opacity: 0, y: 16 };
const animate = { opacity: 1, y: 0 };
const transition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function StaggerChildren({ children }: { children: React.ReactNode }) {
  const items = Children.toArray(children);
  return (
    <>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={initial}
          animate={animate}
          transition={{ ...transition, delay: i * stagger }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
