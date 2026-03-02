"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const initial = { opacity: 0, y: 24 };
const transition = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function ScrollReveal({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px -40px 0px" });
  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0 } : initial}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
