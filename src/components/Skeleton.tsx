import { cx } from "../lib/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="w-[150px] shrink-0 sm:w-[172px]">
      <Skeleton className="aspect-[2/3] w-full rounded-media" />
      <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
      <Skeleton className="mt-2 h-2.5 w-1/2 rounded-full" />
    </div>
  );
}

export function RowSkeleton({ count = 7 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden px-[clamp(1rem,4.2vw,3.5rem)]">
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
