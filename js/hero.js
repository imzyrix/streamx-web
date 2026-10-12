// StreamX web front end — rotating hero banner.

import { background, logo } from "./api.js";
import { esc, itemId, loadBg, typeLabel, yearOf } from "./util.js";
import { INFO, PLAY, STAR } from "./icons.js";
import { HERO_ROTATE_MS } from "./config.js";

const heroEl = document.getElementById("hero");

let items = [];
let index = 0;
let timer = null;

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
      <img class="hero-logo" src="${logo(id, "large")}" alt="" onerror="this.remove()">
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

function render() {
  const m = items[index];
  if (!m) {
    heroEl.innerHTML = "";
    return;
  }
  heroEl.innerHTML = heroHTML(m);
  loadBg(heroEl.querySelector(".hero-bg"), background(itemId(m), "large"));
  renderDots();
}

function renderDots() {
  heroEl.querySelector(".hero-dots")?.remove();
  if (items.length < 2) return;
  const dots = document.createElement("div");
  dots.className = "hero-dots";
  dots.innerHTML = items
    .map(
      (_, i) =>
        `<button data-dot="${i}" class="${i === index ? "active" : ""}" aria-label="Featured ${i + 1}"></button>`,
    )
    .join("");
  heroEl.appendChild(dots);
}

export function stopHero() {
  if (timer) clearInterval(timer);
  timer = null;
}

function start() {
  stopHero();
  if (items.length < 2) return;
  timer = setInterval(() => {
    index = (index + 1) % items.length;
    render();
  }, HERO_ROTATE_MS);
}

export function showHero() {
  if (!items.length) {
    heroEl.classList.add("hidden");
    return;
  }
  heroEl.classList.remove("hidden");
}

export function hideHero() {
  stopHero();
  heroEl.classList.add("hidden");
}

export function setFeatured(pool) {
  const seen = new Set();
  items = pool
    .filter(Boolean)
    .filter((m) => {
      const id = itemId(m);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 6);
  index = 0;
  render();
  start();
}

export function goToHero(i) {
  if (i < 0 || i >= items.length) return;
  index = i;
  render();
  start();
}
