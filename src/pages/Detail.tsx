import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Api } from "../lib/api";
import { useApi, useLocalStorage } from "../lib/useApi";
import { COUNTRY_STORAGE_KEY, COUNTRIES, DEFAULT_COUNTRY } from "../lib/config";
import { useTitle } from "../lib/hooks";
import { scrollToElement } from "../lib/lenis";
import type { MediaType } from "../lib/types";
import {
  cx,
  formatCount,
  formatDate,
  formatMoney,
  formatRuntime,
  formatYear,
  initials,
  qualityLabel,
  stripTags,
} from "../lib/format";
import type { IconName } from "../lib/icons";
import { Page } from "../components/Page";
import { Row } from "../components/Row";
import { Pill } from "../components/Pill";
import { Icon } from "../components/Icon";
import { Skeleton } from "../components/Skeleton";
import { SmartImage } from "../components/SmartImage";
import { ScoreRing } from "../components/ScoreRing";
import { BookmarkButton } from "../components/BookmarkButton";
import { TrailerModal } from "../components/TrailerModal";
import { PersonModal, type PersonTarget } from "../components/PersonModal";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "cast", label: "Cast & crew" },
  { id: "episodes", label: "Episodes" },
  { id: "watch", label: "Where to watch" },
  { id: "facts", label: "Facts" },
  { id: "similar", label: "Similar" },
];

const PROVIDER_GROUPS = ["Stream", "Free", "Free with ads", "Rent", "Buy", "Other"] as const;

function providerGroup(types: string[]): (typeof PROVIDER_GROUPS)[number] {
  const list = types.map((value) => value.toLowerCase());
  if (list.includes("subscription") || list.includes("flatrate")) return "Stream";
  if (list.includes("free")) return "Free";
  if (list.includes("ads")) return "Free with ads";
  if (list.includes("rent")) return "Rent";
  if (list.includes("buy")) return "Buy";
  return "Other";
}

function externalLink(key: string, value: string, type: MediaType): string {
  switch (key) {
    case "imdb":
      return `https://www.imdb.com/title/${value}/`;
    case "tmdb":
      return `https://www.themoviedb.org/${type === "series" ? "tv" : "movie"}/${value}`;
    case "tvdb":
      return `https://thetvdb.com/?id=${value}&tab=series`;
    case "rottenTomatoes":
      return `https://www.rottentomatoes.com/${value}`;
    case "metacritic":
      return `https://www.metacritic.com/${value}`;
    default:
      return value.startsWith("http") ? value : `https://www.wikidata.org/wiki/${value}`;
  }
}

export function Detail() {
  const params = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const type: MediaType = params.type === "series" ? "series" : "movie";
  const id = params.id ?? "";

  const [country, setCountry] = useLocalStorage(COUNTRY_STORAGE_KEY, DEFAULT_COUNTRY);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [person, setPerson] = useState<PersonTarget | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const meta = useApi(() => (id ? Api.meta(type, id) : Promise.resolve(null)), [type, id]);
  const scores = useApi(() => (id ? Api.scores(type, id) : Promise.resolve(null)), [type, id]);
  const credits = useApi(() => (id ? Api.credits(type, id) : Promise.resolve(null)), [type, id]);
  const similar = useApi(() => (id ? Api.similar(type, id) : Promise.resolve(null)), [type, id]);
  const streaming = useApi(() => (id ? Api.streaming(type, id, country) : Promise.resolve(null)), [type, id, country]);
  const tv = useApi(() => (id && type === "series" ? Api.tv(id) : Promise.resolve(null)), [type, id]);

  const m = meta.data?.meta ?? null;
  useTitle(m?.name ?? null, type === "series" ? "Series" : "Movie");

  const seasonList = useMemo(() => {
    const videos = m?.videos ?? [];
    if (!videos.length) return [];
    const set = new Set<number>();
    for (const video of videos) set.add(video.season ?? 1);
    return Array.from(set).sort((a, b) => a - b);
  }, [m]);

  useEffect(() => {
    if (season != null || !seasonList.length) return;
    setSeason(seasonList.includes(1) ? 1 : seasonList[0]);
  }, [seasonList, season]);

  const episodes = useMemo(() => {
    const videos = m?.videos ?? [];
    if (!videos.length) return [];
    const active = season ?? seasonList[0] ?? 1;
    return videos
      .filter((video) => (video.season ?? 1) === active)
      .sort((a, b) => (a.number ?? a.episode ?? 0) - (b.number ?? b.episode ?? 0));
  }, [m, season, seasonList]);

  const rings = useMemo(() => {
    const rt = scores.data?.rottenTomatoes;
    const mc = scores.data?.metacritic;
    const imdbRating = scores.data?.imdb?.rating ?? (m?.imdbRating ? Number(m.imdbRating) : null);
    const list: Array<{
      value: number | null;
      max: number;
      label: string;
      caption?: string | null;
      href?: string | null;
      icon: IconName;
      tone?: "primary" | "dim";
    }> = [];
    if (imdbRating && Number.isFinite(imdbRating)) {
      list.push({
        value: imdbRating,
        max: 10,
        label: "IMDb",
        caption: "User rating",
        href: scores.data?.imdb?.url,
        icon: "star",
      });
    }
    if (rt?.critics?.score != null) {
      list.push({
        value: rt.critics.score,
        max: 100,
        label: rt.critics.title ?? "Tomatometer",
        caption: rt.critics.reviewCount ? `${formatCount(rt.critics.reviewCount)} reviews` : "Critics",
        href: rt.url,
        icon: "medal",
      });
    }
    if (rt?.audience?.score != null) {
      list.push({
        value: rt.audience.score,
        max: 100,
        label: rt.audience.title ?? "Popcornmeter",
        caption: "Audience",
        href: rt.url,
        icon: "users",
      });
    }
    if (mc?.critics?.score != null) {
      list.push({
        value: mc.critics.score,
        max: mc.critics.bestRating ?? 100,
        label: mc.critics.title ?? "Metascore",
        caption: mc.critics.reviewCount ? `${formatCount(mc.critics.reviewCount)} critics` : "Critics",
        href: mc.url,
        icon: "graph",
      });
    }
    return list;
  }, [scores.data, m]);

  const providersByGroup = useMemo(() => {
    const map = new Map<string, NonNullable<typeof streaming.data>["providers"]>();
    for (const provider of streaming.data?.providers ?? []) {
      const group = providerGroup(provider.types ?? []);
      const bucket = map.get(group) ?? [];
      bucket.push(provider);
      map.set(group, bucket);
    }
    return map;
  }, [streaming.data]);

  if (meta.loading && !m) return <DetailSkeleton />;

  if (meta.error || !m) {
    return (
      <Page>
        <section className="container-x flex min-h-[70svh] flex-col items-start justify-center pt-32">
          <p className="label-mono">Not in the catalogue</p>
          <h1 className="mt-4 max-w-xl font-display text-[clamp(1.8rem,4.5vw,3rem)] uppercase leading-[1] tracking-tight text-ink">
            We could not open this title
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-body">
            The catalogue has no record for <span className="font-mono text-ink-2">{id}</span>. It may exist on IMDb —
            the suggestion feed is a good place to check.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://www.imdb.com/title/${id}/`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-void"
            >
              <Icon name="external" size={14} /> Open on IMDb
            </a>
            <Link
              to={type === "series" ? "/series" : "/movies"}
              className="inline-flex items-center gap-2.5 rounded-full border border-line-2 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
            >
              <Icon name="back" size={14} /> Back to browse
            </Link>
          </div>
        </section>
      </Page>
    );
  }

  const backdrop = m.background || m.poster;
  const year = formatYear(m.releaseInfo || m.year || m.released);
  const runtime = formatRuntime(m.runtime);
  const genres = m.genres ?? m.genre ?? [];
  const description = stripTags(m.description);
  const fact = m.facts;
  const certification = fact?.certification && !fact.certification.startsWith("http") ? fact.certification : null;
  const trailers = m.trailerStreams ?? [];
  const directors = credits.data?.directors ?? [];
  const crew = credits.data?.crew ?? [];
  const cast = credits.data?.cast ?? [];
  const show = tv.data?.show ?? null;
  const externalIds = Object.entries(m.externalIds ?? {}).filter(([, value]) => Boolean(value));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: m.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* dismissed */
    }
  };

  const availableSections = SECTIONS.filter((section) => {
    if (section.id === "cast") return cast.length > 0 || directors.length > 0 || crew.length > 0;
    if (section.id === "episodes") return episodes.length > 0;
    if (section.id === "watch") return (streaming.data?.providers ?? []).length > 0 || show != null;
    if (section.id === "similar") return (similar.data?.metas ?? []).length > 0;
    return true;
  });

  return (
    <Page>
      <section className="relative isolate overflow-hidden pb-10">
        <div className="absolute inset-0 -z-10">
          {backdrop ? (
            <SmartImage src={backdrop} alt="" className="h-full w-full object-cover object-top opacity-55" eager />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/80 to-void/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-void via-void/35 to-transparent" />
        </div>

        <div className="container-x pt-24">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex min-h-6 items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute transition-colors duration-300 hover:text-ink"
          >
            <Icon name="back" size={14} /> Back
          </button>

          <div className="grid gap-8 md:grid-cols-[228px_minmax(0,1fr)] md:items-end">
            <div className="w-[152px] md:w-full">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-media border border-line-2 bg-panel-2">
                <SmartImage src={m.poster} alt={m.name} className="h-full w-full object-cover" eager />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Pill tone="solid">
                  <Icon name={type === "series" ? "series" : "movies"} size={12} />
                  {type === "series" ? "Series" : "Feature film"}
                </Pill>
                {m.status ? <Pill>{m.status}</Pill> : null}
                {show?.network ? <Pill>{show.network}</Pill> : null}
              </div>

              {m.logo && !logoFailed ? (
                <img
                  src={m.logo}
                  alt={m.name}
                  onError={() => setLogoFailed(true)}
                  className="mt-5 max-h-[80px] w-auto max-w-[min(420px,80%)] object-contain object-left md:max-h-[110px]"
                />
              ) : null}
              <h1
                className={cx(
                  "font-display font-bold uppercase leading-[0.95] tracking-[-0.03em] text-ink",
                  m.logo && !logoFailed ? "sr-only" : "mt-5 text-[clamp(2rem,5.5vw,3.6rem)]",
                )}
              >
                {m.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-2">
                {year ? <span>{year}</span> : null}
                {runtime ? <span>{runtime}</span> : null}
                {certification ? (
                  <span className="rounded-[4px] border border-line-2 px-1.5 py-0.5">{certification}</span>
                ) : null}
                {m.imdbRating && Number(m.imdbRating) ? (
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <Icon name="star" size={13} /> {m.imdbRating}
                  </span>
                ) : null}
                {genres.length ? <span className="text-mute">{genres.join(" · ")}</span> : null}
              </div>

              {description ? (
                <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink-2">{description}</p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {trailers.length ? (
                  <button
                    type="button"
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Icon name="play" size={15} /> Play trailer
                  </button>
                ) : null}
                <BookmarkButton meta={m} type={type} />
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-panel-2/50 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-md transition-colors duration-300 hover:border-ink"
                >
                  <Icon name="share" size={15} /> {copied ? "Link copied" : "Share"}
                </button>
                {streaming.data?.justWatchUrl ? (
                  <a
                    href={streaming.data.justWatchUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-panel-2/50 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink backdrop-blur-md transition-colors duration-300 hover:border-ink"
                  >
                    <Icon name="ticket" size={15} /> JustWatch
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <nav className="sticky top-16 z-30 border-y border-line bg-void/85 backdrop-blur-xl">
        <div className="container-x no-scrollbar fade-x flex gap-1 overflow-x-auto py-2.5">
          {availableSections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToElement(document.getElementById(section.id), 128)}
              className="shrink-0 rounded-full px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute transition-colors duration-300 hover:bg-panel-2 hover:text-ink"
            >
              {section.label}
            </button>
          ))}
        </div>
      </nav>

      {rings.length > 0 ? (
        <section id="overview" className="container-x scroll-mt-32 pt-14">
          <div className="rounded-card border border-line bg-panel/60 p-6 sm:p-8">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
              <div>
                <p className="label-mono">Aggregate scores</p>
                <h2 className="mt-2.5 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] tracking-tight text-ink">
                  What the critics and the crowd said
                </h2>
              </div>
              <p className="hidden max-w-xs text-right text-[12.5px] leading-relaxed text-body sm:block">
                Each source links back to its own page — no scores are invented here.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-x-10 gap-y-8 sm:justify-start">
              {rings.map((ring) => (
                <ScoreRing key={ring.label} {...ring} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section id="overview" className="container-x scroll-mt-32 pt-14">
          <p className="rounded-card border border-line bg-panel/60 px-6 py-5 text-[13px] text-mute">
            Aggregate scores are not published for this title yet.
            {scores.error ? " The scoring service did not respond." : ""}
          </p>
        </section>
      )}

      {description || fact || m.wiki ? (
        <section className="container-x pt-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <p className="label-mono">Synopsis</p>
              {description ? (
                <p className="mt-4 max-w-[68ch] text-[15px] leading-[1.75] text-ink-2">{description}</p>
              ) : null}
              {m.wiki?.extract ? (
                <div className="mt-7 border-t border-line pt-6">
                  <p className="label-mono">From Wikipedia</p>
                  <p className="mt-3 text-[14px] leading-[1.75] text-body">{m.wiki.extract}</p>
                  {m.wiki.url ? (
                    <a
                      href={m.wiki.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                    >
                      Read the full article <Icon name="external" size={12} />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            {fact ? (
              <div className="rounded-card border border-line bg-panel/40 p-6">
                <p className="label-mono">Production</p>
                <dl className="mt-5 space-y-4">
                  {fact.budget ? (
                    <FactRow label="Budget" value={formatMoney(fact.budget) ?? "—"} />
                  ) : null}
                  {fact.boxOffice ? (
                    <FactRow label="Box office" value={formatMoney(fact.boxOffice) ?? "—"} />
                  ) : null}
                  {fact.countries?.length ? <FactRow label="Countries" value={fact.countries.join(", ")} /> : null}
                  {fact.languages?.length ? <FactRow label="Languages" value={fact.languages.join(", ")} /> : null}
                  {fact.productionCompanies?.length ? (
                    <FactRow label="Studios" value={fact.productionCompanies.slice(0, 4).join(", ")} />
                  ) : null}
                  {fact.composers?.length ? <FactRow label="Music" value={fact.composers.slice(0, 3).join(", ")} /> : null}
                  {fact.partOfSeries?.length ? (
                    <FactRow label="Franchise" value={fact.partOfSeries.join(", ")} />
                  ) : null}
                  {m.awards ? <FactRow label="Awards" value={m.awards} /> : null}
                  {show?.premiered ? <FactRow label="First aired" value={formatDate(show.premiered) ?? show.premiered} /> : null}
                  {show?.ended ? <FactRow label="Last aired" value={formatDate(show.ended) ?? show.ended} /> : null}
                </dl>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {cast.length > 0 || directors.length > 0 || crew.length > 0 ? (
        <section id="cast" className="scroll-mt-32 pt-16">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6 border-b border-line pb-5">
              <div>
                <p className="label-mono">Credits</p>
                <h2 className="mt-2.5 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] tracking-tight text-ink">
                  Cast &amp; crew
                </h2>
                <p className="mt-2 text-[13px] text-mute">
                  {credits.loading ? "Loading people…" : `${cast.length} billed performers`}
                  {directors.length ? ` · ${directors.length} directors` : ""}
                </p>
              </div>
              <Pill>
                <Icon name="user" size={12} /> Wikidata
              </Pill>
            </div>
          </div>

          {credits.loading && cast.length === 0 ? (
            <div className="no-scrollbar flex gap-4 overflow-hidden px-[clamp(1rem,4.2vw,3.5rem)] pt-7">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="w-[132px] shrink-0">
                  <Skeleton className="aspect-[3/4] w-full rounded-media" />
                  <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-scrollbar fade-x mt-7 flex gap-4 overflow-x-auto px-[clamp(1rem,4.2vw,3.5rem)] pb-2">
              {cast.slice(0, 24).map((member) => (
                <PersonCard
                  key={member.id || member.name}
                  name={member.name}
                  image={member.image}
                  role={member.description ?? undefined}
                  onOpen={
                    member.wikidataId
                      ? () => setPerson({ wikidataId: member.wikidataId as string, name: member.name, role: "Cast" })
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          {directors.length > 0 || crew.length > 0 ? (
            <div className="container-x mt-10 grid gap-8 sm:grid-cols-2">
              {directors.length > 0 ? (
                <div>
                  <p className="label-mono">Directed by</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {directors.map((person) => (
                      <li key={person.id || person.name}>
                        <button
                          type="button"
                          disabled={!person.wikidataId}
                          onClick={() =>
                            person.wikidataId &&
                            setPerson({ wikidataId: person.wikidataId, name: person.name, role: "Director" })
                          }
                          className="rounded-full border border-line-2 px-3.5 py-2 text-[12.5px] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink disabled:hover:border-line-2 disabled:hover:text-ink-2"
                        >
                          {person.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {crew.length > 0 ? (
                <div>
                  <p className="label-mono">Crew</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {crew.slice(0, 14).map((person) => (
                      <li key={`${person.role}-${person.id || person.name}`}>
                        <button
                          type="button"
                          disabled={!person.wikidataId}
                          onClick={() =>
                            person.wikidataId &&
                            setPerson({ wikidataId: person.wikidataId, name: person.name, role: person.role })
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 text-[12.5px] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink"
                        >
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-mute">{person.role}</span>
                          {person.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {episodes.length > 0 ? (
        <section id="episodes" className="container-x scroll-mt-32 pt-16">
          <div className="flex flex-col gap-5 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-mono">Episode guide</p>
              <h2 className="mt-2.5 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] tracking-tight text-ink">
                {seasonList.length} {seasonList.length === 1 ? "season" : "seasons"} on record
              </h2>
            </div>
            {seasonList.length > 1 ? (
              <div className="no-scrollbar fade-x flex gap-2 overflow-x-auto">
                {seasonList.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSeason(value)}
                    aria-pressed={value === season}
                    className={cx(
                      "shrink-0 rounded-full border px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300",
                      value === season ? "border-ink bg-ink text-void" : "border-line-2 text-mute hover:border-ink hover:text-ink",
                    )}
                  >
                    {value === 0 ? "Specials" : `Season ${value}`}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <ul className="mt-8 divide-y divide-line">
            {episodes.map((episode) => {
              const number = episode.number ?? episode.episode ?? 0;
              const still = episode.still || episode.thumbnail;
              return (
                <li key={episode.id ?? `${episode.season}-${number}`} className="group py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <div className="relative w-full shrink-0 overflow-hidden rounded-media border border-line bg-panel-2 sm:w-[188px]">
                      <div className="aspect-video w-full">
                        <SmartImage src={still} alt={episode.name ?? ""} className="h-full w-full object-cover" />
                      </div>
                      <span className="absolute left-2 top-2 rounded-full bg-void/80 px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink backdrop-blur-md">
                        E{String(number).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-[15px] font-semibold text-ink">{episode.name ?? `Episode ${number}`}</h3>
                        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
                          {[
                            episode.season != null ? `S${String(episode.season).padStart(2, "0")}` : null,
                            formatDate(episode.firstAired ?? episode.released),
                            episode.rating && Number(episode.rating) > 0 ? `★ ${Number(episode.rating).toFixed(1)}` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                      {episode.overview || episode.description ? (
                        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-body">
                          {stripTags(episode.overview ?? episode.description)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {(streaming.data?.providers ?? []).length > 0 || show ? (
        <section id="watch" className="container-x scroll-mt-32 pt-16">
          <div className="flex flex-col gap-5 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label-mono">Availability</p>
              <h2 className="mt-2.5 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] tracking-tight text-ink">
                Where to watch
              </h2>
              <p className="mt-2 text-[13px] text-mute">
                {streaming.loading
                  ? "Checking providers…"
                  : `${(streaming.data?.providers ?? []).length} offers in ${COUNTRIES.find((item) => item.code === country)?.name ?? country}`}
              </p>
            </div>
            <label className="flex shrink-0 items-center gap-2.5 rounded-full border border-line-2 bg-panel-2/60 px-4 py-2.5">
              <Icon name="globe" size={15} className="text-mute" />
              <span className="sr-only">Region</span>
              <select
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="bg-transparent font-mono text-[11px] uppercase tracking-[0.14em] text-ink outline-none"
              >
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-panel text-ink">
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {PROVIDER_GROUPS.map((group) => {
            const bucket = providersByGroup.get(group);
            if (!bucket?.length) return null;
            return (
              <div key={group} className="mt-8">
                <p className="label-mono">{group}</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {bucket.map((provider) => (
                    <li key={`${group}-${provider.name}`}>
                      <a
                        href={provider.webUrl ?? "https://www.justwatch.com"}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between gap-4 rounded-media border border-line bg-panel/60 px-4 py-3.5 transition-colors duration-300 hover:border-ink"
                      >
                        <span className="inline-flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] border border-line-2 bg-panel-2 text-ink">
                            <Icon name="ticket" size={16} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-semibold text-ink-2">
                              {provider.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-mute">
                              {(provider.types ?? []).map((value) => value.replace(/_/g, " ")).join(" · ") || group}
                            </span>
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {qualityLabel(provider.quality) ? <Pill>{qualityLabel(provider.quality)}</Pill> : null}
                          <Icon name="external" size={14} className="text-faint" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {show ? (
            <div className="mt-10 rounded-card border border-line bg-panel/40 p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="label-mono">Broadcast record</p>
                <Pill>
                  <Icon name="series" size={12} /> TVMaze
                </Pill>
              </div>
              <div className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {show.network ? <FactRow label="Network" value={show.network} /> : null}
                {show.status ? <FactRow label="Status" value={show.status} /> : null}
                {show.premiered ? <FactRow label="Premiered" value={formatDate(show.premiered) ?? show.premiered} /> : null}
                {show.ended ? <FactRow label="Ended" value={formatDate(show.ended) ?? show.ended} /> : null}
                {show.runtime ? <FactRow label="Runtime" value={`${show.runtime} min`} /> : null}
                {show.rating ? <FactRow label="TVMaze rating" value={show.rating.toFixed(1)} /> : null}
                {show.country ? <FactRow label="Country" value={show.country} /> : null}
                {show.language ? <FactRow label="Language" value={show.language} /> : null}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {fact || externalIds.length > 0 ? (
        <section id="facts" className="container-x scroll-mt-32 pt-16">
          <div className="border-b border-line pb-5">
            <p className="label-mono">Reference</p>
            <h2 className="mt-2.5 font-display text-[clamp(1.15rem,2.4vw,1.6rem)] tracking-tight text-ink">
              Facts &amp; identifiers
            </h2>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <dl className="space-y-4">
              {m.id ? <FactRow label="Catalogue ID" value={m.id} /> : null}
              {m.moviedb_id ? <FactRow label="TMDb" value={String(m.moviedb_id)} /> : null}
              {m.tvdb_id ? <FactRow label="TVDB" value={String(m.tvdb_id)} /> : null}
              {m.popularities
                ? Object.entries(m.popularities).map(([source, value]) => (
                    <FactRow key={source} label={`${source} popularity`} value={Number(value).toFixed(2)} />
                  ))
                : null}
              {fact?.runtimeMinutes ? <FactRow label="Runtime (minutes)" value={String(fact.runtimeMinutes)} /> : null}
            </dl>

            <div>
              <p className="label-mono">Open these records</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {externalIds.map(([key, value]) => (
                  <li key={key}>
                    <a
                      href={externalLink(key, String(value), type)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      <Icon name="external" size={12} /> {key}
                    </a>
                  </li>
                ))}
                {fact?.officialWebsite ? (
                  <li>
                    <a
                      href={fact.officialWebsite}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      <Icon name="globe" size={12} /> Official site
                    </a>
                  </li>
                ) : null}
                {scores.data?.rottenTomatoes?.url ? (
                  <li>
                    <a
                      href={scores.data.rottenTomatoes.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      <Icon name="medal" size={12} /> Rotten Tomatoes
                    </a>
                  </li>
                ) : null}
              </ul>

              {m.links?.some((link) => link.category === "Genres") ? (
                <div className="mt-8">
                  <p className="label-mono">Genre links</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {(m.links ?? [])
                      .filter((link) => link.category === "Genres")
                      .slice(0, 6)
                      .map((link) => (
                        <li key={link.url}>
                          <Link
                            to={`/${type === "series" ? "series" : "movies"}?genre=${encodeURIComponent(link.name)}`}
                            className="rounded-full border border-line-2 px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute transition-colors duration-300 hover:border-ink hover:text-ink"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {(similar.data?.metas ?? []).length > 0 ? (
        <div id="similar" className="scroll-mt-32 pt-6">
          <Row
            title="More like this"
            blurb={`Similar titles sourced by ${similar.data?.source ?? "the catalogue"}`}
            metas={similar.data?.metas}
            type={type}
          />
        </div>
      ) : null}

      <TrailerModal open={trailerOpen} onClose={() => setTrailerOpen(false)} title={m.name} trailers={trailers} />
      <PersonModal person={person} onClose={() => setPerson(null)} />
    </Page>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/70 pb-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{label}</dt>
      <dd className="text-[13.5px] text-ink-2 sm:max-w-[64%] sm:text-right">{value}</dd>
    </div>
  );
}

function PersonCard({
  name,
  image,
  role,
  onOpen,
}: {
  name: string;
  image: string | null;
  role?: string;
  onOpen?: () => void;
}) {
  const content = (
    <>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-media border border-line bg-panel-2">
        {image ? (
          <SmartImage src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-xl text-faint">{initials(name)}</div>
        )}
      </div>
      <p className="mt-3 line-clamp-2 text-[12.5px] font-semibold leading-snug text-ink-2">{name}</p>
      {role ? <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-mute">{role}</p> : null}
    </>
  );

  if (!onOpen) {
    return <div className="w-[132px] shrink-0">{content}</div>;
  }

  return (
    <button type="button" onClick={onOpen} className="group w-[132px] shrink-0 text-left">
      <span className="block [&>div]:transition-colors">{content}</span>
      <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint transition-colors group-hover:text-ink">
        <Icon name="info" size={11} /> Profile
      </span>
    </button>
  );
}

function DetailSkeleton() {
  return (
    <Page>
      <section className="container-x pt-28">
        <Skeleton className="h-4 w-24 rounded-full" />
        <div className="mt-8 grid gap-8 md:grid-cols-[228px_minmax(0,1fr)]">
          <Skeleton className="aspect-[2/3] w-[152px] rounded-media md:w-full" />
          <div>
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="mt-5 h-12 w-3/4 rounded-media" />
            <Skeleton className="mt-5 h-3.5 w-64 rounded-full" />
            <Skeleton className="mt-6 h-3.5 w-full max-w-2xl rounded-full" />
            <Skeleton className="mt-3 h-3.5 w-2/3 max-w-xl rounded-full" />
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-11 w-36 rounded-full" />
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-x pt-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="mx-auto h-[112px] w-[112px] rounded-full" />
          ))}
        </div>
      </section>

      <section className="container-x pt-14">
        <Skeleton className="h-6 w-48 rounded-full" />
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[3/4] w-full rounded-media" />
              <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </Page>
  );
}
     