import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import type { MediaType, Meta } from "../lib/types";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { SectionHeading } from "./SectionHeading";
import { RowSkeleton } from "./Skeleton";
import { cx } from "../lib/format";

export const trackVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

export interface RowProps {
  title: string;
  blurb?: string | null;
  metas?: Meta[] | null;
  loading?: boolean;
  error?: string | null;
  type: MediaType;
  seeAllHref?: string;
}

export function Row({ title, blurb, metas, loading, error, type, seeAllHref }: RowProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(updateEdges);
    return () => window.cancelAnimationFrame(id);
  }, [metas, updateEdges]);

  const nudge = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(300, el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="py-5">
      <div className="container-x">
        <SectionHeading
          title={title}
          blurb={blurb}
          action={
            <div className="flex items-center gap-2">
              {seeAllHref ? (
                <Link
                  to={seeAllHref}
                  className="hidden rounded-full border border-line-2 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink sm:inline-flex"
                >
                  See all
                </Link>
              ) : null}
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  type="button"
                  aria-label={`Scroll ${title} left`}
                  disabled={edges.start}
                  onClick={() => nudge(-1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-line-2 text-mute transition-colors duration-300 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon name="back" size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Scroll ${title} right`}
                  disabled={edges.end}
                  onClick={() => nudge(1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-line-2 text-mute transition-colors duration-300 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon name="forward" size={14} />
                </button>
              </div>
            </div>
          }
        />
      </div>

      {error ? (
        <div className="container-x flex items-center gap-3 text-[13px] text-mute">
          <Icon name="danger" size={16} className="text-mute" />
          <span>This row could not load right now.</span>
        </div>
      ) : loading ? (
        <RowSkeleton />
      ) : (
        <motion.div
          ref={trackRef}
          variants={trackVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          onScroll={updateEdges}
          className={cx(
            "no-scrollbar fade-x flex gap-4 overflow-x-auto px-[clamp(1rem,4.2vw,3.5rem)] pb-2",
          )}
        >
          {(metas ?? []).map((meta) => (
            <Card key={meta.imdb_id || meta.id} meta={meta} type={meta.type ?? type} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
