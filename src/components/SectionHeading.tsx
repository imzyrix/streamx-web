import type { ReactNode } from "react";
import { cx } from "../lib/format";

export function SectionHeading({
  title,
  blurb,
  action,
  className,
}: {
  title: string;
  blurb?: string | null;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-5 flex items-end justify-between gap-6", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[clamp(1.1rem,2.2vw,1.5rem)] leading-none tracking-tight text-ink">
          {title}
        </h2>
        {blurb ? <p className="mt-2 text-[13px] text-mute">{blurb}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
