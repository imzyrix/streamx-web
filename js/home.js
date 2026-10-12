// StreamX web front end — home / browse view (hero + catalogue rows).

import { catalog } from "./api.js";
import { ROWS } from "./config.js";
import { cardsHTML, skeletonRow } from "./cards.js";
import { hideHero, setFeatured, showHero } from "./hero.js";
import { setActiveNav } from "./nav.js";

const rowsEl = document.getElementById("rows");
const resultsEl = document.getElementById("search-results");
const footerEl = document.querySelector(".footer");

const rowCache = new Map();

function rowsFor(view) {
  if (view === "movie" || view === "series") return ROWS.filter((r) => r.type === view);
  return ROWS;
}

function fetchRow(row) {
  if (!rowCache.has(row.key)) {
    const promise = catalog(row.type, { genre: row.genre })
      .then((d) => d.metas || [])
      .catch(() => []);
    rowCache.set(row.key, promise);
  }
  return rowCache.get(row.key);
}

export async function showHome(view = "home") {
  setActiveNav(view);
  resultsEl.classList.add("hidden");
  rowsEl.classList.remove("hidden");
  footerEl?.classList.remove("hidden");

  const rows = rowsFor(view);
  rowsEl.innerHTML = rows.map((r) => skeletonRow(r.title)).join("");

  const sections = [...rowsEl.querySelectorAll(".row")];
  const data = await Promise.all(rows.map(fetchRow));
  const byKey = {};
  rows.forEach((r, i) => (byKey[r.key] = data[i]));

  rows.forEach((row, i) => {
    const metas = (byKey[row.key] || []).slice(0, 24);
    const section = sections[i];
    if (!section) return;
    const track = section.querySelector(".row-track");
    if (!metas.length) {
      section.style.display = "none";
      return;
    }
    track.innerHTML = cardsHTML(metas);
    section.querySelector(".row-head").insertAdjacentHTML(
      "beforeend",
      `<span class="row-sub">${metas.length} titles</span>`,
    );
  });

  rowsEl.classList.toggle("heroless", view !== "home");
  if (view === "home") {
    setFeatured([...(byKey["movies-top"] || []), ...(byKey["series-top"] || [])]);
    showHero();
  } else {
    hideHero();
  }
}
