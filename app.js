import { catalog, search, meta, poster, background, logo } from "./api.js";

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

const ROWS = [
  { key: "movies-top", title: "Trending Movies", type: "movie" },
  { key: "series-top", title: "Trending Series", type: "series" },
  { key: "action", title: "Action & Adventure", type: "movie", genre: "Action" },
  { key: "comedy", title: "Comedy", type: "movie", genre: "Comedy" },
  { key: "scifi", title: "Sci-Fi & Fantasy", type: "movie", genre: "Sci-Fi" },
  { key: "drama-series", title: "Drama Series", type: "series", genre: "Drama" },
  { key: "animation", title: "Animated Movies", type: "movie", genre: "Animation" },
  { key: "horror", title: "Horror", type: "movie", genre: "Horror" },
  { key: "crime-series", title: "Crime Series", type: "series", genre: "Crime" },
];

const HERO_ROTATE_MS = 9000;

/* ------------------------------------------------------------------ *
 * DOM
 * ------------------------------------------------------------------ */

const navEl = document.getElementById("nav");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const heroEl = document.getElementById("hero");
const rowsEl = document.getElementById("rows");
const resultsEl = document.getElementById("search-results");
const detailEl = document.getElementById("detail");
const lightboxEl = document.getElementById("lightbox");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function yearOf(m) {
  if (m.year) return String(m.year).slice(0, 4);
  if (m.released) return String(m.released).slice(0, 4);
  return m.releaseInfo || "";
}

function itemId(m) {
  return m.imdb_id || m.id || "";
}

function typeLabel(t) {
  return t === "series" ? "Series" : "Movie";
}

const STAR = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.26L21.5 9l-4.75 4.4L18 20l-6-3.4L6 20l1.25-6.6L2.5 9l6.6-.74z"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const INFO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-linecap="round"/></svg>`;

let bgObserver = null;
function loadBg(node, url) {
  if (!node || !url) return;
  const img = new Image();
  img.onload = () => {
    node.style.backgroundImage = `url("${url}")`;
    node.classList.add("ready");
  };
  img.onerror = () => node.classList.remove("ready");
  img.src = url;
}

/* ------------------------------------------------------------------ *
 * Cards
 * ------------------------------------------------------------------ */

function cardHTML(m, opts = {}) {
  const id = itemId(m);
  const type = m.type || "movie";
  const name = m.name || "Untitled";
  const y = yearOf(m);
  const rating = m.imdbRating;
  const badge = opts.badge || "";
  return `
    <button class="card" data-type="${esc(type)}" data-id="${esc(id)}" aria-label="${esc(name)}">
      <div class="card-fallback">${esc(name)}</div>
      <img src="${poster(id)}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">
      ${badge ? `<span class="card-badge">${esc(badge)}</span>` : ""}
      <div class="card-overlay">
        <h4>${esc(name)}</h4>
        <div class="card-meta">
          ${y ? `<span>${esc(y)}</span>` : ""}
          ${rating ? `<span class="rating" style="font-size:.72rem">${STAR}${esc(rating)}</span>` : ""}
        </div>
      </div>
    </button>`;
}

function skeletonRow(title) {
  const cards = Array.from({ length: 8 }, () => `<div class="sk sk-card"></div>`).join("");
  return `
    <section class="row">
      <div class="row-head"><h2 class="row-title">${esc(title)}</h2></div>
      <div class="row-track">${cards}</div>
    </section>`;
}

/* ------------------------------------------------------------------ *
 * Home / rows
 * ------------------------------------------------------------------ */

const rowCache = new Map();

function rowsFor(view) {
  if (view === "movie" || view === "series") return ROWS.filter((r) => r.type === view);
  return ROWS;
}

async function fetchRowData(row) {
  const key = row.key;
  if (rowCache.has(key)) return rowCache.get(key);
  const promise = catalog(row.type, { genre: row.genre })
    .then((d) => d.metas || [])
    .catch(() => []);
  rowCache.set(key, promise);
  return promise;
}

async function showHome(view = "home") {
  setActiveNav(view);
  heroEl.classList.remove("hidden");
  joinSearchView(false);

  const rows = rowsFor(view);
  rowsEl.innerHTML = rows.map((r) => skeletonRow(r.title)).join("");

  const sections = [...rowsEl.querySelectorAll(".row")];
  const data = await Promise.all(rows.map(fetchRowData));
  const byKey = {};
  rows.forEach((r, i) => (byKey[r.key] = data[i]));

  rows.forEach((row, i) => {
    const metas = (byKey[row.key] || []).slice(0, 20);
    const track = sections[i].querySelector(".row-track");
    if (!metas.length) {
      sections[i].style.display = "none";
      return;
    }
    track.innerHTML = metas.map((m) => cardHTML(m)).join("");
    sections[i].querySelector(".row-head").insertAdjacentHTML(
      "beforeend",
      `<span class="row-sub">${metas.length} titles</span>`
    );
  });

  if (view === "home") {
    const featuredPool = [...(byKey["movies-top"] || []), ...(byKey["series-top"] || [])];
    setFeatured(featuredPool);
  } else {
    stopHeroTimer();
    heroEl.classList.add("hidden");
  }
}

function setActiveNav(view) {
  navLinks.forEach((a) => {
    const v = a.dataset.view;
    const on = view === "home" ? v === "home" : v === view;
    a.classList.toggle("active", on);
  });
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

let heroItems = [];
let heroIndex = 0;
let heroTimer = null;

function heroHTML(m) {
  const id = itemId(m);
  const type = m.type || "movie";
  const genres = (m.genres || m.genre || []).slice(0, 3).join(" · ");
  const y = yearOf(m);
  const trailer = (m.trailers || []).find((t) => t && t.source);
  return `
    <div class="hero-bg"></div>
    <div class="hero-content">
      <span class="hero-kicker">StreamX ${typeLabel(type)}</span>
      <img class="hero-logo" src="${logo(id)}" alt="" onerror="this.remove()">
      <h1 class="hero-title">${esc(m.name || "Untitled")}</h1>
      <div class="hero-meta">
        ${y ? `<span>${esc(y)}</span>` : ""}
        ${m.imdbRating ? `<span class="rating">${STAR}${esc(m.imdbRating)}</span>` : ""}
        ${m.runtime ? `<span>${esc(m.runtime)}</span>` : ""}
        ${genres ? `<span>${esc(genres)}</span>` : ""}
      </div>
      <p class="hero-desc">${esc(m.description || "")}</p>
      <div class="hero-actions">
        ${trailer ? `<button class="btn btn-primary" data-play="${esc(trailer.source)}">${PLAY} Play trailer</button>` : ""}
        <button class="btn btn-ghost" data-info="${esc(type)}" data-id="${esc(id)}">${INFO} More info</button>
      </div>
    </div>`;
}

function setFeatured(items) {
  heroItems = items.filter(Boolean).slice(0, 6);
  heroIndex = 0;
  renderHero();
  renderDots();
  startHeroTimer();
}

function renderHero() {
  const m = heroItems[heroIndex];
  if (!m) {
    heroEl.innerHTML = "";
    return;
  }
  heroEl.classList.remove("hidden");
  heroEl.innerHTML = heroHTML(m);
  loadBg(heroEl.querySelector(".hero-bg"), background(itemId(m)));
  renderDots();
}

function renderDots() {
  heroEl.querySelector(".hero-dots")?.remove();
  if (heroItems.length < 2) return;
  const dots = document.createElement("div");
  dots.className = "hero-dots";
  dots.innerHTML = heroItems
    .map((_, i) => `<button data-dot="${i}" class="${i === heroIndex ? "active" : ""}" aria-label="Featured ${i + 1}"></button>`)
    .join("");
  heroEl.appendChild(dots);
}

function startHeroTimer() {
  stopHeroTimer();
  if (heroItems.length < 2) return;
  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroItems.length;
    renderHero();
  }, HERO_ROTATE_MS);
}

function stopHeroTimer() {
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = null;
}

/* ------------------------------------------------------------------ *
 * Detail
 * ------------------------------------------------------------------ */

async function openDetail(type, id) {
  document.body.style.overflow = "hidden";
  detailEl.classList.remove("hidden");
  detailEl.innerHTML = `<button class="detail-close" data-close aria-label="Close">&times;</button><div class="spinner"></div>`;
  try {
    const res = await meta(type, id);
    renderDetail(res.meta || {});
  } catch (err) {
    detailEl.innerHTML = `
      <button class="detail-close" data-close aria-label="Close">&times;</button>
      <div class="error-box"><strong>Could not load details</strong>The API did not return data for this title.</div>`;
  }
}

function closeDetail() {
  detailEl.classList.add("hidden");
  detailEl.innerHTML = "";
  document.body.style.overflow = "";
}

function renderDetail(m) {
  const id = itemId(m);
  const type = m.type || "movie";
  const y = yearOf(m);
  const genres = m.genres || m.genre || [];
  const trailer = (m.trailers || []).find((t) => t && t.source);
  const cast = (m.cast || []).slice(0, 12).join(", ");
  const director = (m.director || []).join(", ");
  const writer = (m.writer || []).join(", ");

  const facts = [
    director && ["Director", director],
    writer && ["Writer", writer],
    cast && ["Cast", cast],
    m.country && ["Country", m.country],
    m.awards && ["Awards", m.awards],
  ].filter(Boolean);

  const episodes = type === "series" ? (m.videos || []) : [];

  detailEl.innerHTML = `
    <button class="detail-close" data-close aria-label="Close">&times;</button>
    <div class="detail-hero">
      <div class="detail-bg"></div>
      <div class="detail-content">
        <img class="detail-logo" src="${logo(id)}" alt="" onerror="this.remove()">
        <h1>${esc(m.name || "Untitled")}</h1>
        <div class="detail-meta">
          <span class="pill">${typeLabel(type)}</span>
          ${y ? `<span>${esc(y)}</span>` : ""}
          ${m.runtime ? `<span>${esc(m.runtime)}</span>` : ""}
          ${m.imdbRating ? `<span class="rating">${STAR}${esc(m.imdbRating)}</span>` : ""}
        </div>
        <p class="detail-desc">${esc(m.description || "")}</p>
        <div class="detail-actions">
          ${trailer ? `<button class="btn btn-primary" data-play="${esc(trailer.source)}">${PLAY} Play trailer</button>` : ""}
          <button class="btn btn-ghost" data-close-inline>${INFO} Close</button>
        </div>
        ${genres.length ? `<div class="chips">${genres.map((g) => `<span class="chip">${esc(g)}</span>`).join("")}</div>` : ""}
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-main">
        ${episodes.length ? episodesSectionHTML(episodes) : `<h2 class="section-title">Overview</h2><p class="muted">${esc(m.description || "No overview available.")}</p>`}
      </div>
      <aside>
        <h2 class="section-title">Details</h2>
        <ul class="facts">
          ${facts.map(([k, v]) => `<li><strong>${esc(k)}</strong>${esc(v)}</li>`).join("")}
        </ul>
      </aside>
    </div>`;

  loadBg(detailEl.querySelector(".detail-bg"), background(id, "large"));
  detailEl.querySelector(".detail-hero").scrollIntoView({ block: "start" });
  detailEl.scrollTop = 0;

  if (episodes.length) wireSeasons(episodes);
}

function episodesSectionHTML(videos) {
  const bySeason = new Map();
  for (const v of videos) {
    const s = Number.isFinite(v.season) ? v.season : 0;
    if (!bySeason.has(s)) bySeason.set(s, []);
    bySeason.get(s).push(v);
  }
  const seasons = [...bySeason.keys()].sort((a, b) => a - b);
  const first = seasons[0];
  return `
    <div class="seasons">
      <h2 class="section-title">Episodes</h2>
      <div class="season-tabs" data-season-tabs>
        ${seasons
          .map(
            (s) =>
              `<button data-season="${s}" class="${s === first ? "active" : ""}">${
                s === 0 ? "Specials" : "Season " + s
              }</button>`
          )
          .join("")}
      </div>
      <div class="episodes" data-episodes>${episodeListHTML(bySeason.get(first) || [])}</div>
    </div>`;
}

function episodeListHTML(list) {
  const sorted = [...list].sort((a, b) => (a.episode ?? a.number ?? 0) - (b.episode ?? b.number ?? 0));
  return sorted
    .map((v) => {
      const num = v.episode ?? v.number ?? "";
      const date = v.firstAired || v.released || "";
      const dateStr = date ? new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";
      return `
        <article class="episode">
          <div class="episode-thumb">
            <img src="${esc(v.thumbnail || "")}" alt="" loading="lazy" onerror="this.remove()">
            <span class="episode-num">${esc(num)}</span>
          </div>
          <div class="episode-body">
            <h4>${esc(v.name || "Episode " + num)}</h4>
            ${dateStr ? `<div class="ep-date">${esc(dateStr)}</div>` : ""}
            <p>${esc(v.overview || v.description || "")}</p>
          </div>
        </article>`;
    })
    .join("");
}

function wireSeasons(videos) {
  const bySeason = new Map();
  for (const v of videos) {
    const s = Number.isFinite(v.season) ? v.season : 0;
    if (!bySeason.has(s)) bySeason.set(s, []);
    bySeason.get(s).push(v);
  }
  const tabs = detailEl.querySelector("[data-season-tabs]");
  const list = detailEl.querySelector("[data-episodes]");
  if (!tabs || !list) return;
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-season]");
    if (!btn) return;
    const s = Number(btn.dataset.season);
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    list.innerHTML = episodeListHTML(bySeason.get(s) || []);
    list.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

/* ------------------------------------------------------------------ *
 * Trailer lightbox
 * ------------------------------------------------------------------ */

function openTrailer(source) {
  if (!source) return;
  lightboxEl.classList.remove("hidden");
  lightboxEl.innerHTML = `
    <button class="lightbox-close" data-lightbox-close aria-label="Close">&times;</button>
    <div class="lightbox-frame">
      <iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(source)}?autoplay=1&rel=0"
        title="Trailer" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
    </div>`;
  document.body.style.overflow = "hidden";
}

function closeTrailer() {
  lightboxEl.classList.add("hidden");
  lightboxEl.innerHTML = "";
  if (detailEl.classList.contains("hidden")) document.body.style.overflow = "";
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

function joinSearchView(on) {
  resultsEl.classList.toggle("hidden", !on);
  heroEl.classList.toggle("hidden", on || heroItems.length === 0);
  rowsEl.classList.toggle("hidden", on);
  document.querySelector(".footer").classList.toggle("hidden", on);
}

async function showSearch(q) {
  if (!q) {
    location.hash = "#/";
    return;
  }
  setActiveNav("");
  joinSearchView(true);
  resultsEl.innerHTML = `
    <div class="search-head"><h2>Results for “${esc(q)}”</h2><p class="muted">Loading…</p></div>
    <div class="spinner"></div>`;

  const [movies, series] = await Promise.all([
    search(q, "movie").catch(() => ({ metas: [] })),
    search(q, "series").catch(() => ({ metas: [] })),
  ]);
  const seen = new Set();
  const items = [...(movies.metas || []), ...(series.metas || [])].filter((m) => {
    const id = itemId(m);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  resultsEl.innerHTML = `
    <div class="search-head">
      <h2>Results for “${esc(q)}”</h2>
      <p class="muted">${items.length} title${items.length === 1 ? "" : "s"}</p>
    </div>
    ${
      items.length
        ? `<div class="grid">${items.map((m) => cardHTML(m, { badge: typeLabel(m.type || "movie") })).join("")}</div>`
        : `<div class="empty">No matches. Try another title.</div>`
    }`;
}

/* ------------------------------------------------------------------ *
 * Routing
 * ------------------------------------------------------------------ */

function onRoute() {
  const h = location.hash.replace(/^#\/?/, "");
  const [seg, a, b] = h.split("/");
  const q = new URLSearchParams(h.includes("?") ? h.slice(h.indexOf("?")) : "").get("q");

  if (seg === "movies") return showHome("movie");
  if (seg === "series") return showHome("series");
  if (seg === "search") return showSearch(decodeURIComponent(q || a || ""));
  if (seg === "title" && a && b) {
    showHome("home");
    return openDetail(a, decodeURIComponent(b));
  }
  return showHome("home");
}

/* ------------------------------------------------------------------ *
 * Global events
 * ------------------------------------------------------------------ */

document.addEventListener("click", (e) => {
  const play = e.target.closest("[data-play]");
  if (play) return openTrailer(play.dataset.play);

  const info = e.target.closest("[data-info]");
  if (info) return openDetail(info.dataset.info, info.dataset.id);

  const card = e.target.closest(".card");
  if (card) {
    const type = card.dataset.type;
    const id = card.dataset.id;
    if (id) location.hash = `#/title/${type}/${id}`;
    return;
  }

  const dot = e.target.closest("[data-dot]");
  if (dot) {
    heroIndex = Number(dot.dataset.dot);
    renderHero();
    startHeroTimer();
    return;
  }

  if (e.target.closest("[data-close]") || e.target.closest("[data-close-inline]")) return closeDetail();
  if (e.target.closest("[data-lightbox-close]") || e.target === lightboxEl) return closeTrailer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!lightboxEl.classList.contains("hidden")) return closeTrailer();
    if (!detailEl.classList.contains("hidden")) return closeDetail();
  }
});

let searchDebounce;
searchInput.addEventListener("input", () => {
  searchClear.hidden = !searchInput.value;
  clearTimeout(searchDebounce);
  const q = searchInput.value.trim();
  searchDebounce = setTimeout(() => {
    if (q.length >= 2) location.hash = `#/search/${encodeURIComponent(q)}`;
    else if (!q && location.hash.startsWith("#/search")) location.hash = "#/";
  }, 320);
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (q) location.hash = `#/search/${encodeURIComponent(q)}`;
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.hidden = true;
  searchInput.focus();
  if (location.hash.startsWith("#/search")) location.hash = "#/";
});

window.addEventListener("scroll", () => {
  navEl.classList.toggle("solid", window.scrollY > 24);
});

window.addEventListener("hashchange", () => {
  closeDetail();
  closeTrailer();
  onRoute();
});

onRoute();
