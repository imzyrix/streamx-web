// StreamX web front end — person (cast/crew) modal.

import { person as fetchPerson } from "./api.js";
import { esc, formatDate } from "./util.js";
import { CLOSE, EXTERNAL } from "./icons.js";

let modal = null;

function ensure() {
  if (modal) return modal;
  modal = document.createElement("div");
  modal.className = "modal person-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `<div class="modal-panel person-panel" data-panel></div>`;
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest("[data-person-close]")) closePerson();
  });
  document.body.appendChild(modal);
  return modal;
}

function links(ids = {}) {
  const map = [
    ["IMDb", ids.imdb && `https://www.imdb.com/name/${ids.imdb}/`],
    ["TMDb", ids.tmdb && `https://www.themoviedb.org/person/${ids.tmdb}`],
    ["Twitter", ids.twitter && `https://twitter.com/${ids.twitter}`],
    ["Instagram", ids.instagram && `https://instagram.com/${ids.instagram}`],
  ];
  return map
    .filter(([, url]) => url)
    .map(
      ([label, url]) =>
        `<a class="ext-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}${EXTERNAL}</a>`,
    )
    .join(" ");
}

function panelHTML(p) {
  const life = [p.born && `Born ${formatDate(p.born)}`, p.died && `Died ${formatDate(p.died)}`]
    .filter(Boolean)
    .join(" · ");
  const bio = p.wiki?.extract || p.description || "";
  return `
    <button class="modal-close" data-person-close aria-label="Close">${CLOSE}</button>
    <div class="person-head">
      <div class="person-photo lg">${
        p.image ? `<img src="${esc(p.image)}" alt="" onerror="this.remove()">` : ""
      }</div>
      <div>
        <h2>${esc(p.name || "Unknown")}</h2>
        ${p.description ? `<p class="muted">${esc(p.description)}</p>` : ""}
        ${life ? `<p class="muted small">${esc(life)}</p>` : ""}
        <div class="person-links">${links(p.externalIds)}${
          p.officialSite ? `<a class="ext-link" href="${esc(p.officialSite)}" target="_blank" rel="noopener">Website${EXTERNAL}</a>` : ""
        }</div>
      </div>
    </div>
    ${bio ? `<p class="prose">${esc(bio)}</p>` : ""}
    ${
      p.wiki?.url
        ? `<a class="ext-link" href="${esc(p.wiki.url)}" target="_blank" rel="noopener">Read more on Wikipedia${EXTERNAL}</a>`
        : ""
    }`;
}

export function openPerson(id) {
  if (!id) return;
  const node = ensure();
  const panel = node.querySelector("[data-panel]");
  node.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  panel.innerHTML = `<div class="spinner"></div>`;
  const wasOpen = document.getElementById("detail")?.classList.contains("hidden") === false;

  fetchPerson(id)
    .then((data) => {
      panel.innerHTML = panelHTML(data);
    })
    .catch(() => {
      panel.innerHTML = `
        <button class="modal-close" data-person-close aria-label="Close">${CLOSE}</button>
        <div class="error-box"><strong>No profile found</strong>This person has no metadata available.</div>`;
    });

  // remember whether the detail view was open so we can restore scroll lock
  node.dataset.restore = wasOpen ? "1" : "";
}

export function closePerson() {
  if (!modal) return;
  modal.classList.add("hidden");
  const detailOpen = document.getElementById("detail")?.classList.contains("hidden") === false;
  if (!detailOpen) document.body.style.overflow = "";
}

export function personIsOpen() {
  return !!modal && !modal.classList.contains("hidden");
}
