import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Api } from "../lib/api";
import { useApi, useLocalStorageJson } from "../lib/useApi";
import { useTitle } from "../lib/hooks";
import type { ImdbResult, Meta } from "../lib/types";
import { formatYear } from "../lib/format";import { Page } from "../components/Page";
import { Card, cardVariants } from "../components/Card";
import { Row } from "../components/Row";
import { Skeleton } from "../components/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { Icon } from "../components/Icon";
import { Pill } from "../components/Pill";

const SUGGESTIONS = ["Dune", "Breaking Bad", "Sicario", "Studio Ghibli", "The Bear", "Blade Runner"];

export function Search() {
  const params = useParams<{ q?: string }>();
  const navigate = useNavigate();
  const query = (params.q ?? "").trim();
  const [input, setInput] = useState(query);
  const [recent, setRecent] = useLocalStorageJson<string[]>("streamx.recent.v1", []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useTitle(query ? `Search: ${query}` : "Search");

  const commit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setRecent([trimmed, ...recent.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8));
    navigate(`/search/${encodeURIComponent(trimmed)}`);
  };

  const movies = useApi(() => (query ? Api.search(query, "movie") : Promise.resolve(null)), [query]);
  const series = useApi(() => (query ? Api.search(query, "series") : Promise.resolve(null)), [query]);
  const imdb = useApi(() => (query ? Api.imdbSearch(query) : Promise.resolve(null)), [query]);
  const anime = useApi(() => (query ? Api.animeSearch(query) : Promise.resolve(null)), [query]);

  const loading = query !== "" && (movies.loading || series.loading);

  const library: Meta[] = useMemo(() => {
    const merged = [...(movies.data?.metas ?? []), ...(series.data?.metas ?? [])];
    const seen = new Set<string>();
    return merged.filter((meta) => {
      const id = meta.imdb_id || meta.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [movies.data, series.data]);

  const libraryIds = useMemo(() => new Set(library.map((meta) => meta.imdb_id || meta.id)), [library]);

  const suggestions: ImdbResult[] = useMemo(() => {
    const results = imdb.data?.results ?? [];
    const seen = new Set<string>();
    return results.filter((result) => {
      if (libraryIds.has(result.id) || seen.has(result.id)) return false;
      seen.add(result.id);
      return true;
    });
  }, [imdb.data, libraryIds]);

  const animeResults = anime.data?.results ?? [];

  return (
    <Page>
      <section className="container-x pt-32">
        <p className="label-mono">Search</p>
        <h1 className="mt-3 max-w-2xl font-display text-[clamp(1.9rem,5vw,3.4rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em] text-ink">
          Find anything in the catalogue
        </h1>

        <form
          className="mt-8"
          onSubmit={(event) => {
            event.preventDefault();
            commit(input);
          }}
          role="search"
        >
          <label className="flex items-center gap-3 rounded-full border border-line-2 bg-panel-2/60 px-5 py-4 transition-colors duration-300 focus-within:border-ink">
            <Icon name="search" size={20} className="text-mute" />
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Title, person, franchise…"
              aria-label="Search the catalogue"
              className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-faint"
            />
            {input ? (
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="text-mute transition-colors hover:text-ink"
              >
                <Icon name="close" size={18} />
              </button>
            ) : null}
            <button
              type="submit"
              className="shrink-0 rounded-full bg-ink px-4 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-void"
            >
              Go
            </button>
          </label>
        </form>

        {!query ? (
          <div className="mt-8 space-y-6">
            {recent.length ? (
              <div>
                <p className="label-mono mb-3">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => commit(item)}
                      className="rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRecent([])}
                    className="px-2 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint transition-colors hover:text-ink"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <p className="label-mono mb-3">Try</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => commit(item)}
                    className="rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {query ? (
        <>
          <section className="container-x mt-12">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
              <div>
                <h2 className="font-display text-[clamp(1.1rem,2.2vw,1.5rem)] tracking-tight text-ink">
                  In the library
                </h2>
                <p className="mt-2 text-[13px] text-mute">
                  {loading ? "Searching…" : `${library.length} ${library.length === 1 ? "match" : "matches"} for “${query}”`}
                </p>
              </div>
              <Pill>
                <Icon name="graph" size={12} /> Ranked by relevance
              </Pill>
            </div>
          </section>

          <section className="container-x pt-8">
            {loading && library.length === 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index}>
                    <Skeleton className="aspect-[2/3] w-full rounded-media" />
                    <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
                    <Skeleton className="mt-2 h-2.5 w-1/2 rounded-full" />
                  </div>
                ))}
              </div>
            ) : library.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035 } } }}
                className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
              >
                {library.map((meta) => (
                  <Card key={meta.imdb_id || meta.id} meta={meta} type={meta.type ?? "movie"} width="grid" />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-card border border-line py-16 text-center">
                <Icon name="compass" size={24} className="mx-auto text-mute" />
                <p className="mt-4 text-[14px] text-ink-2">No catalogue entry matches “{query}”.</p>
                <p className="mx-auto mt-2 max-w-md text-[13px] text-body">
                  IMDb suggestions below may still point to the right title.
                </p>
              </div>
            )}
          </section>

          {suggestions.length > 0 ? (
            <section className="container-x mt-16">
              <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
                <div>
                  <h2 className="font-display text-[clamp(1.1rem,2.2vw,1.5rem)] tracking-tight text-ink">
                    IMDb suggestions
                  </h2>
                  <p className="mt-2 text-[13px] text-mute">
                    Titles IMDb recognises that are not indexed in the catalogue yet.
                  </p>
                </div>
                <Pill>
                  <Icon name="verified" size={12} /> IMDb
                </Pill>
              </div>

              <ul className="mt-6 divide-y divide-line">
                {suggestions.slice(0, 12).map((result) => (
                  <li key={result.id}>
                    <Link
                      to={`/title/${result.type}/${result.id}`}
                      className="group flex items-center gap-4 py-4 transition-colors duration-300"
                    >
                      <span className="h-[66px] w-11 shrink-0 overflow-hidden rounded-[8px] border border-line bg-panel-2">
                        <SmartImage src={result.poster} alt={result.title ?? ""} className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-semibold text-ink-2 transition-colors group-hover:text-ink">
                          {result.title ?? result.id}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
                          {result.kind ? <span>{result.kind}</span> : null}
                          {formatYear(result.year) ? <span>{formatYear(result.year)}</span> : null}
                          {result.stars?.length ? <span className="truncate">{result.stars.slice(0, 2).join(", ")}</span> : null}
                        </span>
                      </span>
                      <Icon name="forward" size={16} className="shrink-0 text-faint transition-colors group-hover:text-ink" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {animeResults.length > 0 ? (
            <section className="container-x mt-16">
              <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
                <h2 className="font-display text-[clamp(1.1rem,2.2vw,1.5rem)] tracking-tight text-ink">Anime</h2>
                <Pill>
                  <Icon name="ticket" size={12} /> AniList
                </Pill>
              </div>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {animeResults.slice(0, 9).map((result, index) => (
                  <li key={`${result.id}-${index}`} className="flex gap-4 rounded-card border border-line p-4">
                    <span className="h-[90px] w-16 shrink-0 overflow-hidden rounded-[8px] bg-panel-2">
                      <SmartImage src={result.coverImage} alt={result.title ?? ""} className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-ink-2">
                        {result.title ?? "Untitled"}
                      </span>
                      <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
                        {[result.format, result.seasonYear, result.episodes ? `${result.episodes} ep` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      {result.siteUrl ? (
                        <a
                          href={result.siteUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                        >
                          AniList <Icon name="external" size={11} />
                        </a>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <div className="mt-4">
          <TrendingBlock />
        </div>
      )}
    </Page>
  );
}

function TrendingBlock() {
  const movies = useApi(() => Api.trending("movie", 18), []);
  const series = useApi(() => Api.trending("series", 18), []);

  return (
    <>
      <Row
        title="Trending movies"
        type="movie"
        seeAllHref="/movies"
        metas={movies.data?.metas}
        loading={movies.loading}
        error={movies.error}
      />
      <Row
        title="Trending series"
        type="series"
        seeAllHref="/series"
        metas={series.data?.metas}
        loading={series.loading}
        error={series.error}
      />
    </>
  );
}
