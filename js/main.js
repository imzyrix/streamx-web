// StreamX web front end — entry point.
// Wires global events and starts routing.

import { closeDetail, openDetail } from "./detail.js";
import { goToHero } from "./hero.js";
import { closeTrailer, lightboxIsOpen, openTrailer } from "./lightbox.js";
import { closePerson, openPerson, personIsOpen } from "./person.js";
import { onRoute } from "./router.js";
import { debounce } from "./util.js";

const navEl = document.getElementById("nav");
const lightboxEl = document.getElementById("lightbox");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchClear = document.getElementById("search-clear");

function detailIsOpen() {
  return document.getElementById("detail")?.classList.contains("hidden") === false;
}

/* --------------------------------- clicks ---------------------------------- */

document.addEventListener("click", (e) => {
  const anime = e.target.closest("[data-anime]");
  if (anime) {
    if (anime.dataset.anime) window.open(anime.dataset.anime, "_blank", "noopener");
    return;
  }

  const play = e.target.closest("[data-play]");
  if (play) return openTrailer(play.dataset.play);

  const personBtn = e.target.closest("[data-person]");
  if (personBtn) return openPerson(personBtn.dataset.person);

  const info = e.target.closest("[data-info]");
  if (info) return openDetail(info.dataset.info, info.dataset.id);

  const card = e.target.closest(".card");
  if (card && card.dataset.id) {
    location.hash = `#/title/${card.dataset.type}/${card.dataset.id}`;
    return;
  }

  const dot = e.target.closest("[data-dot]");
  if (dot) return goToHero(Number(dot.dataset.dot));

  if (e.target.closest("[data-close]") || e.target.closest("[data-close-inline]")) return closeDetail();
  if (e.target.closest("[data-lightbox-close]") || e.target === lightboxEl) return closeTrailer();
});

/* -------------------------------- keyboard --------------------------------- */

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (personIsOpen()) return closePerson();
  if (lightboxIsOpen()) return closeTrailer();
  if (detailIsOpen()) return closeDetail();
});

/* ---------------------------- header search bar ---------------------------- */

const goSearch = debounce((q) => {
  if (q.length >= 2) location.hash = `#/search/${encodeURIComponent(q)}`;
  else if (!q && location.hash.startsWith("#/search")) location.hash = "#/";
}, 320);

searchInput.addEventListener("input", () => {
  searchClear.hidden = !searchInput.value;
  goSearch(searchInput.value.trim());
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

/* -------------------------------- lifecycle -------------------------------- */

window.addEventListener(
  "scroll",
  () => navEl.classList.toggle("solid", window.scrollY > 24),
  { passive: true },
);

window.addEventListener("hashchange", () => {
  closeDetail();
  closeTrailer();
  closePerson();
  onRoute();
});

onRoute();
