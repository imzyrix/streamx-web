// StreamX web front end — poster card markup.

import { poster } from "./api.js";
import { esc, itemId, typeLabel, yearOf } from "./util.js";
import { STAR } from "./icons.js";

export function cardHTML(m, { badge = "", size = "medium", className = "" } = {}) {
  const id = itemId(m);
  const type = m.type || "movie";
  const name = m.name || m.title || "Untitled";
  const y = yearOf(m);
  const rating = m.imdbRating;
  const posterUrl = m.poster && String(m.poster).startsWith("http") && size === "original"
    ? m.poster
    : poster(id, size);
  return `
    <button class="card ${className}" data-type="${esc(type)}" data-id="${esc(id)}" aria-label="${esc(name)}">
      <div class="card-fallback">${esc(name)}</div>
      <img src="${esc(posterUrl)}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">
      ${badge ? `<span class="card-badge">${esc(badge)}</span>` : ""}
      <div class="card-overlay">
        <h4>${esc(name)}</h4>
        <div class="card-meta">
          ${y ? `<span>${esc(y)}</span>` : ""}
          ${rating ? `<span class="rating">${STAR}${esc(rating)}</span>` : ""}
        </div>
      </div>
    </button>`;
}

export function cardsHTML(items, opts = {}) {
  return items.map((m) => cardHTML(m, opts)).join("");
}

export function portraitCard(item, { size = "large" } = {}) {
  const id = item.id || item.imdb_id;
  const name = item.name || item.title || "Untitled";
  const year = item.releaseInfo || item.year || "";
  return `
    <button class="card" data-type="${esc(item.type || "movie")}" data-id="${esc(id)}" aria-label="${esc(name)}">
      <div class="card-fallback">${esc(name)}</div>
      <img src="${esc(poster(id, size))}" alt="${esc(name)}" loading="lazy" decoding="async" onerror="this.remove()">
      <div class="card-overlay">
        <h4>${esc(name)}</h4>
        ${year ? `<div class="card-meta"><span>${esc(String(year).slice(0, 4))}</span></div>` : ""}
      </div>
    </button>`;
}

export function skeletonRow(title, count = 8) {
  const cards = Array.from({ length: count }, () => `<div class="sk sk-card"></div>`).join("");
  return `
    <section class="row">
      <div class="row-head"><h2 class="row-title">${esc(title)}</h2></div>
      <div class="row-track">${cards}</div>
    </section>`;
}

export function badge(m) {
  return typeLabel(m?.type || "movie");
}
