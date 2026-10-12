// StreamX web front end — full title detail view.
// Wires every detail endpoint: meta, scores, credits, similar, streaming, tv,
// images and series episodes. Each extra loads independently and fails soft.

import {
  background,
  credits as fetchCredits,
  logo,
  meta as fetchMeta,
  similar as fetchSimilar,
  scores as fetchScores,
  still as stillUrl,
  streaming as fetchStreaming,
  tv as fetchTv,
} from "./api.js";
import { esc, formatDate, itemId, loadBg, money, normalizeType, typeLabel, yearOf } from "./util.js";
import { BACK, CLOCK, EXTERNAL, INFO, PLAY, STAR, USER } from "./icons.js";
import { portraitCard } from "./cards.js";

const detailEl = document.getElementById("detail");

const COUNTRIES = [
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["IN", "India"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["JP", "Japan"],
  ["BR", "Brazil"],
];

let current = { type: "movie", id: "" };
let country = localStorage.getItem("streamx:country") || "US";

/* ------------------------------- primitives -------------------------------- */

function externalLink(label, url) {
  if (!url) return "";
  return `<a class="ext-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${EXTERNAL}</a>`;
}

// `fraction` is 0..1 and drives the ring; `display` is what the ring shows.
function scoreDial({ label, display, fraction, tone = "", title = "" }) {
  if (display == null || display === "") return "";
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  return `
    <div class="score ${tone}" style="--pct:${pct}" title="${esc(title || label)}">
      <div class="score-ring"><span>${esc(String(display))}</span></div>
      <div class="score-label">${esc(label)}</div>
    </div>`;
}

function section(title, inner, id = "") {
  if (!inner) return "";
  return `
    <section class="block"${id ? ` id="${esc(id)}"` : ""}>
      <h2 class="section-title">${esc(title)}</h2>
      ${inner}
    </section>`;
}

/* --------------------------------- scores ---------------------------------- */

function scoresHTML(s) {
  if (!s || s.ok === false) return "";
  const rtCritics = s.rottenTomatoes?.critics;
  const rtAudience = s.rottenTomatoes?.audience;
  const imdb = s.imdb?.rating != null ? Number(s.imdb.rating) : null;
  const dials = [
    imdb != null &&
      !Number.isNaN(imdb) &&
      scoreDial({ label: "IMDb /10", display: s.imdb.rating, fraction: imdb / 10, tone: "imdb" }),
    rtCritics?.score != null &&
      scoreDial({
        label: rtCritics.certified ? "RT Certified" : "Tomatometer",
        display: `${rtCritics.score}%`,
        fraction: Number(rtCritics.score) / 100,
        tone: rtCritics.sentiment === "NEGATIVE" ? "rotten" : "fresh",
      }),
    rtAudience?.score != null &&
      scoreDial({
        label: "Popcornmeter",
        display: `${rtAudience.score}%`,
        fraction: Number(rtAudience.score) / 100,
        tone: rtAudience.sentiment === "NEGATIVE" ? "rotten" : "fresh",
      }),
    s.metacritic?.critics?.score != null &&
      scoreDial({
        label: "Metascore",
        display: s.metacritic.critics.score,
        fraction: Number(s.metacritic.critics.score) / 100,
        tone: "meta",
        title: s.metacritic.critics.reviewCount ? `${s.metacritic.critics.reviewCount} critic reviews` : "Metascore",
      }),
  ]
    .filter(Boolean)
    .join("");
  if (!dials) return "";
  const links = [
    externalLink("IMDb", s.imdb?.url),
    externalLink("Rotten Tomatoes", s.rottenTomatoes?.url),
    externalLink("Metacritic", s.metacritic?.url),
  ]
    .filter(Boolean)
    .join("");
  return `
    <div class="score-strip">${dials}</div>
    ${links ? `<div class="score-links">${links}</div>` : ""}`;
}

/* ------------------------------- where to watch ----------------------------- */

const TYPE_ORDER = ["subscription", "free", "ads", "rent", "buy"];

function watchHTML(data, onCountryChange) {
  if (!data) return "";
  const providers = Array.isArray(data.providers) ? data.providers : [];
  const grouped = new Map();
  for (const p of providers) {
    for (const t of p.types || []) {
      if (!grouped.has(t)) grouped.set(t, new Map());
      grouped.get(t).set(p.name, p);
    }
  }
  const groups = TYPE_ORDER.filter((t) => grouped.has(t))
    .map((t) => {
      const chips = [...grouped.get(t).values()]
        .map(
          (p) =>
            `<a class="provider" href="${esc(p.webUrl || data.justWatchUrl || "#")}" target="_blank" rel="noopener" title="${esc(p.name)}">
               <span class="provider-name">${esc(p.name)}</span>
               ${p.quality ? `<span class="provider-q">${esc(p.quality.replace("_", ""))}</span>` : ""}
             </a>`,
        )
        .join("");
      return `
        <div class="provider-group">
          <span class="provider-type">${esc(t)}</span>
          <div class="provider-chips">${chips}</div>
        </div>`;
    })
    .join("");

  const select = `
    <select class="country-select" data-country>
      ${COUNTRIES.map(
        ([code, name]) => `<option value="${code}" ${code === country ? "selected" : ""}>${esc(name)}</option>`,
      ).join("")}
    </select>`;

  const body =
    providers.length && groups
      ? `<div class="providers">${groups}</div>`
      : `<p class="muted small">No streaming offers found in this region.</p>`;

  return `<div class="watch-head">${select}${
    data.justWatchUrl
      ? `<a class="ext-link" href="${esc(data.justWatchUrl)}" target="_blank" rel="noopener">JustWatch${EXTERNAL}</a>`
      : ""
  }</div>${body}`;
}

/* ----------------------------------- cast ---------------------------------- */

function peopleRow(list, { empty = "" } = {}) {
  const people = (list || []).filter((p) => p && p.name);
  if (!people.length) return empty;
  return `<div class="people-row">${people
    .map(
      (p) => `
      <button class="person-card" data-person="${esc(p.id)}" aria-label="${esc(p.name)}">
        <div class="person-photo">${
          p.image
            ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
            : `<span class="person-initial">${USER}</span>`
        }</div>
        <div class="person-name">${esc(p.name)}</div>
        ${p.description ? `<div class="person-role">${esc(p.description)}</div>` : ""}
      </button>`,
    )
    .join("")}</div>`;
}

/* ---------------------------------- facts ---------------------------------- */

function factList(rows) {
  const clean = rows.filter(([, v]) => v != null && v !== "" && !(Array.isArray(v) && !v.length));
  if (!clean.length) return "";
  return `<ul class="facts">${clean
    .map(([k, v]) => `<li><strong>${esc(k)}</strong>${v}</li>`)
    .join("")}</ul>`;
}

function rtUrl(path) {
  if (!path) return "";
  return /^https?:/i.test(path) ? path : `https://www.rottentomatoes.com/${String(path).replace(/^\/+/, "")}`;
}

function factsHTML(m, tvShow) {
  const facts = m.facts || {};
  const ids = m.externalIds || {};
  const type = normalizeType(m.type);
  const director = (m.director || facts.directors || []).join(", ");
  const writer = (m.writer || []).join(", ");
  const composers = (facts.composers || []).join(", ");
  const companies = (facts.productionCompanies || []).join(", ");
  const languages = (facts.languages || []).join(", ");
  const countries = facts.countries?.length ? facts.countries.join(", ") : m.country;
  const runtime = m.runtime || (facts.runtimeMinutes ? `${facts.runtimeMinutes} min` : "");
  const cert = facts.certification || "";
  const released = m.released || m.releaseInfo || tvShow?.premiered;

  const extLinks = [
    ids.imdb && externalLink("IMDb", `https://www.imdb.com/title/${ids.imdb}/`),
    ids.tmdb &&
      externalLink("TMDb", `https://www.themoviedb.org/${type === "series" ? "tv" : "movie"}/${ids.tmdb}`),
    ids.tvdb && externalLink("TVDB", `https://thetvdb.com/dereferrer/series/${ids.tvdb}`),
    ids.rottenTomatoes && externalLink("RT", rtUrl(ids.rottenTomatoes)),
    ids.metacritic &&
      externalLink(
        "Metacritic",
        /^https?:/i.test(ids.metacritic)
          ? ids.metacritic
          : `https://www.metacritic.com/${type === "series" ? "tv" : "movie"}/${ids.metacritic}`,
      ),
    facts.officialWebsite && externalLink("Official site", facts.officialWebsite),
  ]
    .filter(Boolean)
    .join(" ");

  return factList([
    ["Type", typeLabel(type)],
    ["Released", released ? esc(formatDate(released)) : ""],
    ["Runtime", runtime ? esc(runtime) : ""],
    ["Rated", cert ? esc(cert) : ""],
    ["Network", tvShow?.network ? esc(tvShow.network) : ""],
    ["Status", tvShow?.status ? esc(tvShow.status) : ""],
    ["Director", director ? esc(director) : ""],
    ["Writer", writer ? esc(writer) : ""],
    ["Composer", composers ? esc(composers) : ""],
    ["Budget", facts.budget ? esc(money(facts.budget)) : ""],
    ["Box office", facts.boxOffice ? esc(money(facts.boxOffice)) : ""],
    ["Country", countries ? esc(countries) : ""],
    ["Language", languages ? esc(languages) : ""],
    ["Production", companies ? esc(companies) : ""],
    ["Part of", facts.partOfSeries ? esc(facts.partOfSeries) : ""],
    ["Links", extLinks],
  ]);
}

/* --------------------------------- episodes --------------------------------- */

function groupBySeason(videos) {
  const map = new Map();
  for (const v of videos) {
    const s = Number.isFinite(v.season) ? v.season : 0;
    if (!map.has(s)) map.set(s, []);
    map.get(s).push(v);
  }
  return map;
}

function episodeListHTML(list, id) {
  const sorted = [...list].sort((a, b) => (a.episode ?? a.number ?? 0) - (b.episode ?? b.number ?? 0));
  return sorted
    .map((v) => {
      const num = v.episode ?? v.number ?? "";
      const season = Number.isFinite(v.season) ? v.season : 1;
      const thumb = v.still || v.thumbnail || stillUrl(id, season, num);
      const date = v.firstAired || v.released;
      return `
        <article class="episode">
          <div class="episode-thumb">
            <img src="${esc(thumb)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">
            <span class="episode-num">${esc(num)}</span>
          </div>
          <div class="episode-body">
            <h4>${esc(v.name || v.title || `Episode ${num}`)}</h4>
            ${date ? `<div class="ep-date">${esc(formatDate(date))}</div>` : ""}
            <p>${esc(v.overview || v.description || "")}</p>
          </div>
        </article>`;
    })
    .join("");
}

function episodesHTML(videos, id) {
  if (!videos?.length) return "";
  const bySeason = groupBySeason(videos);
  const seasons = [...bySeason.keys()].sort((a, b) => a - b);
  const first = seasons[0];
  return `
    <div class="season-tabs" data-season-tabs>
      ${seasons
        .map(
          (s) =>
            `<button data-season="${s}" class="${s === first ? "active" : ""}">${
              s === 0 ? "Specials" : `Season ${s}`
            }</button>`,
        )
        .join("")}
    </div>
    <div class="episodes" data-episodes>${episodeListHTML(bySeason.get(first) || [], id)}</div>`;
}

/* ---------------------------------- render --------------------------------- */

function skeletonsHTML(m) {
  const id = itemId(m);
  const type = m.type || "movie";
  const trailer = (m.trailers || []).find((t) => t && t.source) || (m.trailerStreams || [])[0];
  const trailerId = trailer?.source || trailer?.ytId;
  const genres = m.genres || m.genre || [];
  const y = yearOf(m);
  return `
    <div class="detail-hero">
      <div class="detail-bg"></div>
      <div class="detail-content">
        <img class="detail-logo" src="${logo(id, "large")}" alt="" onerror="this.remove()">
        <h1>${esc(m.name || "Untitled")}</h1>
        <div class="detail-meta">
          <span class="pill">${typeLabel(type)}</span>
          ${y ? `<span>${esc(y)}</span>` : ""}
          ${m.runtime ? `<span>${CLOCK}${esc(m.runtime)}</span>` : ""}
          ${m.imdbRating ? `<span class="rating">${STAR}${esc(m.imdbRating)}</span>` : ""}
        </div>
        <p class="detail-desc">${esc(m.description || "")}</p>
        <div class="detail-actions">
          ${trailerId ? `<button class="btn btn-primary" data-play="${esc(trailerId)}">${PLAY} Play trailer</button>` : ""}
          <button class="btn btn-ghost" data-close-inline>${INFO} Close</button>
        </div>
        ${genres.length ? `<div class="chips">${genres.map((g) => `<span class="chip">${esc(g)}</span>`).join("")}</div>` : ""}
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-main">
        <div id="d-scores" class="detail-scores"></div>
        <div id="d-watch"></div>
        <div id="d-episodes"></div>
        <div id="d-cast"></div>
        <div id="d-similar"></div>
      </div>
      <aside class="detail-side" id="d-side"></aside>
    </div>`;
}

function render(m) {
  const id = itemId(m);
  detailEl.innerHTML = `
    <button class="detail-back" data-close aria-label="Back">${BACK}</button>
    <button class="detail-close" data-close aria-label="Close">&times;</button>
    ${skeletonsHTML(m)}`;

  loadBg(detailEl.querySelector(".detail-bg"), background(id, "large"));
  detailEl.scrollTop = 0;

  if (m.wiki?.extract) {
    detailEl.querySelector(".detail-main")?.insertAdjacentHTML(
      "afterbegin",
      section("Story", `<p class="prose">${esc(m.wiki.extract)}</p>`),
    );
  }

  return id;
}

/* ---------------------------------- extras --------------------------------- */

async function fillScores(type, id) {
  const host = detailEl.querySelector("#d-scores");
  if (!host) return;
  try {
    const data = await fetchScores(type, id);
    host.innerHTML = scoresHTML(data);
  } catch {
    host.remove();
  }
}

async function fillWatch(type, id) {
  const host = detailEl.querySelector("#d-watch");
  if (!host) return;
  const load = async () => {
    try {
      const data = await fetchStreaming(type, id, { country });
      host.innerHTML = section("Where to watch", watchHTML(data));
      host.querySelector("[data-country]")?.addEventListener("change", (e) => {
        country = e.target.value;
        localStorage.setItem("streamx:country", country);
        load();
      });
    } catch {
      host.innerHTML = "";
    }
  };
  await load();
}

async function fillCast(type, id) {
  const host = detailEl.querySelector("#d-cast");
  if (!host) return;
  try {
    const data = await fetchCredits(type, id);
    const cast = peopleRow((data.cast || []).slice(0, 20));
    const directors = (data.crew || []).filter((p) => p.role === "director");
    const parts = [
      cast && section("Cast", cast),
      directors.length && section("Directed by", peopleRow(directors)),
    ].filter(Boolean);
    host.innerHTML = parts.join("");
  } catch {
    host.innerHTML = "";
  }
}

async function fillSimilar(type, id) {
  const host = detailEl.querySelector("#d-similar");
  if (!host) return;
  try {
    const data = await fetchSimilar(type, id);
    const items = (data.metas || []).filter((m) => m.id);
    if (!items.length) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = section(
      "More like this",
      `<div class="row-track inline">${items.map((m) => portraitCard(m, { size: "medium" })).join("")}</div>`,
    );
  } catch {
    host.innerHTML = "";
  }
}

async function fillSide(m, tvShow) {
  const host = detailEl.querySelector("#d-side");
  if (!host) return;
  const overview = m.description || m.wiki?.extract || "No overview available.";
  const tvFacts = tvShow
    ? factList([
        ["Network", tvShow.network],
        ["Status", tvShow.status],
        ["Aired", tvShow.premiered ? esc(formatDate(tvShow.premiered)) : ""],
      ])
    : "";
  host.innerHTML = `
    ${tvFacts ? `<div class="side-block">${tvFacts}</div>` : ""}
    <div class="side-block">
      <h2 class="section-title">Details</h2>
      ${factsHTML(m, tvShow)}
    </div>
    ${m.description ? `<div class="side-block"><h2 class="section-title">Overview</h2><p class="prose small">${esc(overview)}</p></div>` : ""}`;
}

function fillEpisodes(m, id, tvShow) {
  const host = detailEl.querySelector("#d-episodes");
  if (!host) return;
  if (normalizeType(m.type) !== "series") {
    host.remove();
    return;
  }
  const videos = m.videos || [];
  if (!videos.length) {
    host.remove();
    return;
  }
  host.innerHTML = section("Episodes", episodesHTML(videos, id));
  const tabs = host.querySelector("[data-season-tabs]");
  const list = host.querySelector("[data-episodes]");
  const bySeason = groupBySeason(videos);
  tabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-season]");
    if (!btn) return;
    const s = Number(btn.dataset.season);
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    list.innerHTML = episodeListHTML(bySeason.get(s) || [], id);
    list.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

/* ---------------------------------- public --------------------------------- */

export function openDetail(type, id) {
  type = normalizeType(type);
  current = { type, id };
  document.body.style.overflow = "hidden";
  detailEl.classList.remove("hidden");
  detailEl.innerHTML = `<button class="detail-back" data-close aria-label="Back">${BACK}</button><button class="detail-close" data-close aria-label="Close">&times;</button><div class="spinner"></div>`;

  fetchMeta(type, id)
    .then((res) => {
      const m = res.meta || res || {};
      if (!m || !(m.name || m.title)) throw new Error("empty");
      const isSeries = normalizeType(m.type || type) === "series";
      render(m);
      fillEpisodes(m, id);
      fillSide(m);
      fillScores(normalizeType(m.type || type), id);
      fillWatch(normalizeType(m.type || type), id);
      fillCast(normalizeType(m.type || type), id);
      fillSimilar(normalizeType(m.type || type), id);
      if (isSeries) {
        fetchTv(id)
          .then((tv) => tv?.show && fillSide(m, tv.show))
          .catch(() => {});
      }
    })
    .catch(() => {
      detailEl.innerHTML = `
        <button class="detail-back" data-close aria-label="Back">${BACK}</button>
        <button class="detail-close" data-close aria-label="Close">&times;</button>
        <div class="error-box"><strong>Could not load details</strong>The API did not return data for this title.</div>`;
    });
}

export function closeDetail() {
  detailEl.classList.add("hidden");
  detailEl.innerHTML = "";
  document.body.style.overflow = "";
}

export function detailIsOpen() {
  return !detailEl.classList.contains("hidden");
}

export function currentDetail() {
  return { ...current };
}
