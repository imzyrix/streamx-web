import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Api } from "../lib/api";
import { GENRES } from "../lib/config";
import { useTitle } from "../lib/hooks";
import type { MediaType, Meta } from "../lib/types";
import { cx } from "../lib/format";
import { Page } from "../components/Page";
import { Card } from "../components/Card";
import { CardSkeleton } from "../components/Skeleton";
import { Icon } from "../components/Icon";

const PAGE_SIZE = 50;

function usePagedCatalog(type: MediaType, genre: string | null) {
  const [items, setItems] = useState<Meta[]>([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setSkip(0);
    setItems([]);
  }, [type, genre]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Api.catalog(type, { genre: genre ?? undefined, skip })
      .then((response) => {
        if (!alive) return;
        setItems((previous) => (skip === 0 ? response.metas : [...previous, ...response.metas]));
        setHasMore(Boolean(response.hasMore) && response.metas.length > 0);
      })
      .catch((cause: unknown) => {
        if (!alive) return;
        setError(cause instanceof Error ? cause.message : "Request failed");
        setHasMore(false);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, genre, skip]);

  const loadMore = useCallback(() => setSkip((value) => value + PAGE_SIZE), []);

  return { items, loading, error, hasMore, loadMore };
}

export function Browse({ type }: { type: MediaType }) {
  const [params, setParams] = useSearchParams();
  const genre = params.get("genre");
  const { items, loading, error, hasMore, loadMore } = usePagedCatalog(type, genre);

  const label = type === "movie" ? "Movies" : "Series";
  useTitle(label, genre ?? "All genres");

  const genres = useMemo(() => ["All", ...GENRES[type]], [type]);

  const selectGenre = (next: string) => {
    if (next === "All") {
      setParams({}, { replace: true });
    } else {
      setParams({ genre: next }, { replace: true });
    }
  };

  const initialLoading = loading && items.length === 0;

  return (
    <Page>
      <section className="container-x pb-6 pt-32">
        <div className="flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label-mono">Catalogue</p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,4rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-ink">
              {label}
            </h1>
            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-body">
              Ranked by popularity across the upstream catalogues.{" "}
              {genre ? `Filtered to ${genre}.` : "Every genre is available below."}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute">
            <Icon name="filter" size={14} />
            {items.length} loaded
          </div>
        </div>
      </section>

      <section className="container-x sticky top-16 z-30 -mx-px bg-void/80 py-4 backdrop-blur-xl">
        <div className="no-scrollbar fade-x flex gap-2 overflow-x-auto">
          {genres.map((option) => {
            const active = option === "All" ? !genre : option === genre;
            return (
              <button
                key={option}
                type="button"
                onClick={() => selectGenre(option)}
                aria-pressed={active}
                className={cx(
                  "shrink-0 rounded-full border px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300",
                  active
                    ? "border-ink bg-ink text-void"
                    : "border-line-2 text-mute hover:border-ink hover:text-ink",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <section className="container-x pb-10 pt-8">
        {error && items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-card border border-line py-20 text-center">
            <Icon name="danger" size={24} className="text-mute" />
            <p className="text-[14px] text-ink-2">The catalogue could not be loaded.</p>
            <p className="max-w-sm font-mono text-[11px] text-mute">{error}</p>
          </div>
        ) : initialLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 18 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
              className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            >
              {items.map((meta) => (
                <Card key={meta.imdb_id || meta.id} meta={meta} type={meta.type ?? type} width="grid" />
              ))}
            </motion.div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-card border border-line py-20 text-center">
                <Icon name="compass" size={24} className="text-mute" />
                <p className="text-[14px] text-ink-2">Nothing here yet for that filter.</p>
              </div>
            ) : null}

            {hasMore ? (
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2.5 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-ink disabled:opacity-50"
                >
                  {loading ? <Icon name="clock" size={15} /> : <Icon name="add" size={15} />}
                  {loading ? "Loading" : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </Page>
  );
}
