import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useInView } from "motion/react";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";
import { cx } from "../lib/format";

export interface ScoreRingProps {
  value: number | null;
  max?: number;
  label: string;
  caption?: string | null;
  href?: string | null;
  tone?: "primary" | "dim";
  icon?: IconName;
}

export function ScoreRing({
  value,
  max = 100,
  label,
  caption,
  href,
  tone = "primary",
  icon = "star",
}: ScoreRingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const size = 96;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const offset = circumference * (1 - ratio);
  const decimals = value != null && Number.isInteger(value) ? 0 : 1;

  useEffect(() => {
    if (!inView || value == null) return;
    const counter = { v: 0 };
    const animation = animate(counter, {
      v: value,
      duration: 1200,
      ease: "outExpo",
      onUpdate: () => {
        if (numberRef.current) numberRef.current.textContent = counter.v.toFixed(decimals);
      },
    });
    return () => {
      animation.cancel();
    };
  }, [inView, value, decimals]);

  const body = (
    <div className={cx("flex w-[112px] flex-col items-center gap-3 text-center")}>
      <div ref={ref} className="relative grid place-items-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-line-2"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={inView ? offset : circumference}
            className={tone === "primary" ? "text-ink" : "text-mute"}
            style={{ transition: "stroke-dashoffset 1.25s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span ref={numberRef} className="font-display text-[24px] font-bold tabular-nums tracking-tight">
            {value == null ? "—" : "0"}
          </span>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-ink-2">
          <Icon name={icon} size={13} className="text-mute" />
          {label}
        </div>
        {caption ? <div className="mt-1 text-[11px] text-mute">{caption}</div> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="rounded-card transition-colors hover:brightness-125">
        {body}
      </a>
    );
  }

  return body;
}
