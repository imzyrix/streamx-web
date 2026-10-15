import type { ReactNode } from "react";
import { cx } from "../lib/format";

export function Pill({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "solid" | "ghost";
}) {
  const tones = {
    default: "border-line-2 text-ink-2",
    solid: "border-transparent bg-ink text-void",
    ghost: "border-transparent text-mute",
  } as const;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
