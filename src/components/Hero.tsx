import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { animate, stagger } from "animejs";
import { Link } from "react-router-dom";
import type { MediaType, Meta } from "../lib/types";
import { HERO_ROTATE_MS } from "../lib/config";
import { cx, formatRuntime, formatYear, stripTags } from "../lib/format";
import { Icon } from "./Icon";
import { Pill } from "./Pill";
import { Skeleton } from "./Skeleton";
import { TrailerModal } from "./TrailerModal";

export function Hero({ metas, type, loading }: { metas: Meta[]; type: MediaType; loading?: boolean }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const count = metas.length;
  const safeIndex = count ? Math.min(index, count - 1) : 0;
  const current: Meta | null = count ? metas[safeIndex] : null;

  useEffect(() => {
    if (reduce || count <= 1) return;
    const id = window.setTimeout(() => setIndex((value) => (value + 1) % count), HERO_ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [safeIndex, count, reduce]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root || !current) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-anim]"));
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-word]"));
    const clear = () => {
      for (const el of [...items, ...words]) {
        el.style.opacity = "";
        el.style.transform = "";
      }
    };

    clear();
    if (reduce) return;

    const entrance = animate(items, {
      opacity: [0, 1],
      translateY: [22, 0],
      duration: 820,
      delay: stagger(72),
      ease: "outExpo",
    });

    const title = words.length
      ? animate(words, {
          opacity: [0, 1],
          translateY: [34, 0],
          rotate: [3, 0],
          duration: 980,
          delay: stagger(36),
          ease: "outExpo",
        })
      : null;

    return () => {
      entrance.pause();
      title?.pause();
      clear();
    };
  }, [safeIndex, current, reduce]);

  if (loading || !current) {
    return (
      <section className="relative flex min-h-[86svh] items-end overflow-hidden pb-14 pt-32">
        <div className="container-x w-full">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="mt-6 h-14 w-3/4 rounded-media sm:h-20" />
          <Skeleton className="mt-6 h-3.5 w-64 rounded-full" />
          <Skeleton className="mt-5 h-3.5 w-full max-w-xl rounded-full" />
          <Skeleton className="mt-3 h-3.5 w-2/3 max-w-md rounded-full" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  const id = current.imdb_id || current.id;
  const year = formatYear(current.releaseInfo || current.year || current.released);
  const runtime = formatRuntime(current.runtime);
  const rating = current.imdbRating ? Number(current.imdbRating) : null;
  const genres = (current.genres ?? current.genre ?? []).slice(0, 3);
  const description = stripTags(current.description);
  const trailers = current.trailerStreams ?? [];
  const words = current.name.split(" ");

  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden pb-14 pt-32">
      <div className="absolute inset-0 -z-10">
        <AnimatePresence initial={false}>
          {current.background ? (
            <motion.img
              key={current.id}
              src={current.background}
              alt=""
              aria-hidden="true"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0.3 : 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover object-[50%_20%]"
            />
          ) : null}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/75 to-void/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/55 to-transparent" />
      </div>

      <div className="container-x w-full">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_248px] lg:items-end">
          <div ref={contentRef} className="max-w-3xl">
            <div data-hero-anim className="flex items-center gap-3">
              <Pill tone="solid">
                <Icon name="flame" size={12} /> Featured
              </Pill>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mute">
                {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2.3rem,7vw,5.4rem)] font-bold uppercase leading-[0.92] tracking-[-0.03em] text-ink">
              {words.map((word, wordIndex) => (
                <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
                  {Array.from(word).map((char, charIndex) => (
                    <span key={`${char}-${charIndex}`} data-word className="inline-block">
                      {char}
                    </span>
                  ))}
                  {wordIndex < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
                </span>
              ))}
            </h1>

            <div
              data-hero-anim
              className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2"
            >
              {rating && Number.isFinite(rating) ? (
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <Icon name="star" size={13} /> {rating.toFixed(1)}
                </span>
              ) : null}
              {year ? <span>{year}</span> : null}
              {runtime ? <span>{runtime}</span> : null}
              <span className="text-mute">{type === "series" ? "Series" : "Feature film"}</span>
              {genres.length ? <span className="text-mute">{genres.join(" · ")}</span> : null}
            </div>

            {description ? (
              <p data-hero-anim className="mt-5 line-clamp-3 max-w-2xl text-[15px] leading-relaxed text-mute">
                {description}
              </p>
            ) : null}

            <div data-hero-anim className="mt-8 flex flex-wrap items-center gap-3">
              {trailers.length ? (
                <button
                  type="button"
                  onClick={() => setTrailerOpen(true)}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <Icon name="play" size={15} />
                  Play trailer
                </button>
              ) : null}
              <Link
                to={`/title/${type}/${id}`}
                className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-panel-2/50 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-md transition-colors duration-300 hover:border-ink"
              >
                <Icon name="info" size={15} />
                More info
              </Link>
              <span className="hidden items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint sm:inline-flex">
                <Icon name="verified" size={13} /> Scores from 3 critics
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="label-mono mb-3">Up next</p>
            <ul className="space-y-1">
              {metas.slice(0, 5).map((meta, itemIndex) => (
                <li key={meta.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    aria-current={itemIndex === safeIndex}
                    className={cx(
                      "group flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors duration-300",
                      itemIndex === safeIndex ? "text-ink" : "text-mute hover:text-ink-2",
                    )}
                  >
                    <span className="font-mono text-[10px] tabular-nums">{String(itemIndex + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold">{meta.name}</span>
                      <span className="mt-1.5 block h-[2px] overflow-hidden rounded-full bg-line-2">
                        {itemIndex === safeIndex && !reduce ? (
                          <motion.span
                            key={safeIndex}
                            className="block h-full origin-left bg-ink"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: HERO_ROTATE_MS / 1000, ease: "linear" }}
                          />
                        ) : (
                          <span className={cx("block h-full", itemIndex === safeIndex ? "bg-ink" : "bg-transparent")} />
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <TrailerModal
        open={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        title={current.name}
        trailers={trailers}
      />
    </section>
  );
}
