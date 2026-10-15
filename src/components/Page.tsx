import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -10, transition: { duration: 0.24, ease: [0.4, 0, 1, 1] } }}
      transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
