import { cx } from "../lib/format";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];

  return (
    <div className={cx("fade-x relative overflow-hidden border-y border-line py-4", className)}>
      <div className="flex w-max animate-marquee items-center gap-8 pr-8">
        {doubled.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            <span className="font-display text-[13px] font-bold uppercase tracking-[0.28em] text-ink-2">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-faint" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
