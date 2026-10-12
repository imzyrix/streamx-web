// StreamX web front end — search view.
// Combines the title search, IMDb suggestions and (when available) AniList.

import { animeSearch, imdbSearch, search } from "./api.js";
import { cardsHTML, cardHTML } from "./cards.js";
import { hideHero } from "./hero.js";
import { setActiveNav } from "./nav.js";
import { debounce, esc, itemId, typeLabel } from "./util.js";
import { icon } from "./icons.js";

const resultsEl = document.getElementById("search-results");
const rowsEl = document.getElementById("rows");
const footerEl = document.querySelector(".footer");

let activeQuery = "";

function imdbCard(r) {
  const name = r.title || "Untitled";
  const year = r.year ? String(r.year).slice(0, 4) : "";
  const stars = (r.stars || []).slice(0, 2).join(", ");
  return `
    <button class="card" data-type="${esc(r.type || "movie")}" data-id="${esc(r.id)}" aria-label="${esc(name)}">
      <div class="card-fallback">${esc(name)}</div>
      ${r.poster ? `<img src="${esc(r.poster)}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">` : ""}
      <div class="card-overlay">
        <h4>${esc(name)}</h4>
        <div class="card-meta">${year ? `<span>${esc(year)}</span>` : ""}${r.kind ? `<span>${esc(r.kind)}</span>` : ""}</div>
        ${stars ? `<div class="card-sub">${esc(stars)}</div>` : ""}
      </div>
    </button>`;
}

function animeCard(a) {
  const name = a.title || "Untitled";
  return `
    <button class="card" data-anime="${esc(a.siteUrl || "")}" aria-label="${esc(name)}">
      <div class="card-fallback">${esc(name)}</div>
      ${a.coverImage ? `<img src="${esc(a.coverImage)}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">` : ""}
      <div class="card-overlay">
        <h4>${esc(name)}</h4>
        <div class="card-meta">
          ${a.seasonYear ? `<span>${esc(a.seasonYear)}</span>` : ""}
          ${a.format ? `<span>${esc(a.format)}</span>` : ""}
        </div>
      </div>
    </button>`;
}

function searchViewHTML(q) {
  return `
    <div class="search-wrap">
      <div class="searchbar">
        ${icon("magnifer", "search-icon")}
        <input id="search-view-input" type="search" value="${esc(q)}" placeholder="Search movies &amp; series" autocomplete="off" aria-label="Search" />
        <button type="button" class="search-clear" data-clear-search aria-label="Clear search" hidden>&times;</button>
      </div>
      <div id="search-view-results"></div>
    </div>`;
}

function emptyState() {
  document.getElementById("search-view-results").innerHTML =
    `<div class="empty">Start typing to search movies &amp; series.</div>`;
}

async function runSearch(q) {
  const host = document.getElementById("search-view-results");
  if (!host) return;
  activeQuery = q;
  host.innerHTML = `<div class="spinner"></div>`;

  const [movies, series, imdb, anime] = await Promise.all([
    search(q, "movie").catch(() => ({ metas: [] })),
    search(q, "series").catch(() => ({ metas: [] })),
    imdbSearch(q).catch(() => ({ results: [] })),
    animeSearch(q).catch(() => ({ results: [] })),
  ]);
  if (activeQuery !== q) return;

  const seen = new Set();
  const items = [...(movies.metas || []), ...(series.metas || [])].filter((m) => {
    const id = itemId(m);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const imdbItems = (imdb.results || []).filter((r) => r.id && !seen.has(r.id));
  const animeItems = (anime.results || []).map((a) => a);

  const blocks = [];
  if (items.length) {
    blocks.push(`
      <section class="search-block">
        <h3>Movies &amp; Series</h3>
        <div class="grid">${items.map((m) => cardHTML(m, { badge: typeLabel(m.type || "movie") })).join("")}</div>
      </section>`);
  }
  if (imdbItems.length) {
    blocks.push(`
      <section class="search-block">
        <h3>From IMDb</h3>
        <div class="grid">${imdbItems.map(imdbCard).join("")}</div>
      </section>`);
  }
  if (animeItems.length) {
    blocks.push(`
      <section class="search-block">
        <h3>Anime</h3>
        <div class="grid">${animeItems.map(animeCard).join("")}</div>
      </section>`);
  }

  host.innerHTML = `
    <div class="search-head">
      <h2>Results for “${esc(q)}”</h2>
    </div>
    ${blocks.length ? blocks.join("") : `<div class="empty">No matches for “${esc(q)}”. Try another title.</div>`}`;
}

function wireSearchView() {
  const input = document.getElementById("search-view-input");
  if (!input) return;
  const clear = document.querySelector("[data-clear-search]");
  const schedule = debounce((q) => {
    if (q.length >= 2) runSearch(q);
    else emptyState();
  }, 300);

  input.focus({ preventScroll: true });
  clear.hidden = !input.value;
  input.addEventListener("input", () => {
    clear.hidden = !input.value;
    schedule(input.value.trim());
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = input.value.trim();
      if (q.length >= 2) runSearch(q);
    }
  });
  clear.addEventListener("click", () => {
    input.value = "";
    clear.hidden = true;
    input.focus();
    emptyState();
  });
}

export function showSearch(q) {
  setActiveNav("search");
  rowsEl.classList.add("hidden");
  footerEl?.classList.add("hidden");
  resultsEl.classList.remove("hidden");
  hideHero();
  activeQuery = "";
  q = (q || "").trim();
  resultsEl.innerHTML = searchViewHTML(q);
  wireSearchView();
  if (q) runSearch(q);
  else emptyState();
}
