import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { Api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { useHealth, useTitle } from "../lib/hooks";
import { ROWS } from "../lib/config";
import { useWatchlist } from "../lib/watchlist";
import type { IconName } from "../lib/icons";
import { Page } from "../components/Page";
import { Hero } from "../components/Hero";
import { Row } from "../components/Row";
import { DataRow } from "../components/DataRow";
import { Marquee } from "../components/Marquee";
import { Pill } from "../components/Pill";
import { Icon } from "../components/Icon";

const CAPABILITIES = [
  "Aggregate scores",
  "Cast & crew",
  "Where to watch",
  "Episode guides",
  "Production facts",
  "Wikipedia",
  "Similar titles",
  "Trailers",
];

const STATS: Array<{ label: string; value: string; detail: string }> = [
  { label: "Score sources", value: "3", detail: "IMDb, Rotten Tomatoes and Metacritic, side by side." },
  { label: "Episode guides", value: "TVmaze", detail: "Season-by-season episodes with air dates and stills." },
  { label: "Availability", value: "JustWatch", detail: "Stream, rent and buy, filtered by country." },
  { label: "Facts", value: "Wikidata", detail: "Budget, box office, certifications and studios." },
];

const FEATURES: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "graph",
    title: "Every score in one place",
    body: "Critic and audience ratings from IMDb, Rotten Tomatoes and Metacritic, presented without the usual clutter.",
  },
  {
    icon: "users",
    title: "Cast you can actually open",
    body: "Tap any performer to pull their biography, portraits and body of work straight from Wikidata.",
  },
  {
    icon: "ticket",
    title: "Know where to watch",
    body: "See which services carry a title in your country, with subscription, rental and purchase split apart.",
  },
  {
    icon: "compass",
    title: "Follow the thread",
    body: "Similar titles, franchises, trailers and Wikipedia summaries keep the next good pick within reach.",
  },
];

export function Home() {
  useTitle("Movies & Series", "Keyless metadata");
  const health = useHealth();
  const trending = useApi(() => Api.trending("movie", 8), []);
  const { items } = useWatchlist();
  const reduce = useReducedMotion();

  const revealInitial = reduce ? false : { opacity: 0, y: 24 };
  const revealWhile = reduce ? undefined : { opacity: 1, y: 0 };

  return (
    <Page>
      <Hero
        metas={trending.data?.metas ?? []}
        type="movie"
        loading={trending.loading && !trending.data}
      />

      <Marquee items={CAPABILITIES} className="mt-6" />

      <section className="container-x pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono">What the API returns</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-ink">
              More than a poster wall
            </h2>
          </div>
          {health?.version ? <Pill tone="ghost">API v{health.version}</Pill> : null}
        </div>

        <motion.div
          initial={revealInitial}
          whileInView={revealWhile}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="rounded-card border border-line bg-panel/60 p-6">
              <p className="label-mono">{stat.label}</p>
              <p className="mt-3 font-display text-[1.7rem] font-bold uppercase leading-none tracking-tight text-ink">
                {stat.value}
              </p>
              <p className="mt-3 text-[12.5px] leading-relaxed text-body">{stat.detail}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {items.length ? (
        <div className="pt-12">
          <Row title="My list" blurb="Saved on this device" metas={items} type="movie" />
        </div>
      ) : null}

      <div className="pt-8">
        {ROWS.map((def) => (
          <DataRow key={def.key} def={def} />
        ))}
      </div>

      <section className="container-x pt-16">
        <div className="border-b border-line pb-5">
          <p className="label-mono">Why StreamX</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-ink">
            Metadata Netflix never shows you
          </h2>
        </div>

        <motion.div
          initial={revealInitial}
          whileInView={revealWhile}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2"
        >
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-2 text-ink">
                <Icon name={feature.icon} size={20} />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">{feature.title}</h3>
                <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-body">{feature.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="container-x pb-6 pt-16">
        <div className="flex flex-col gap-8 rounded-card border border-line bg-panel/60 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="default">
                <Icon name="verified" size={12} /> Keyless API
              </Pill>
              <Pill tone="ghost">
                <Icon name="globe" size={12} /> No tracking
              </Pill>
            </div>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(1.4rem,3vw,2.1rem)] font-bold uppercase leading-[1.02] tracking-[-0.03em] text-ink">
              Browse with confidence
            </h2>
            <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-body">
              Every response comes from a self-hosted, keyless metadata API. Nothing is stored about you, and no API
              key ever reaches the browser.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-void transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Icon name="movies" size={15} /> Browse movies
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2.5 rounded-full border border-line-2 px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-ink"
            >
              <Icon name="search" size={15} /> Search
            </Link>
          </div>
        </div>
      </section>
    </Page>
  );
}
