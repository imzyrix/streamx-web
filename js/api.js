// StreamX web front end — API client.
// Thin wrapper over the keyless StreamX API with a fallback host, session
// memoisation and a normalised error shape.

import { API_BASE, API_FALLBACK, DEFAULT_COUNTRY } from "./config.js";

let base = API_BASE;
const memo = new Map();

export function activeBase() {
  return base;
}

function withQuery(path, params) {
  const entries = Object.entries(params || {}).filter(([, v]) => v != null && v !== "");
  if (!entries.length) return path;
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${path}?${qs.toString()}`;
}

async function request(path) {
  const res = await fetch(`${base}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const err = new Error(`Request failed (${res.status}) for ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function getJSON(path) {
  try {
    return await request(path);
  } catch (err) {
    if (base !== API_FALLBACK) {
      base = API_FALLBACK;
      return request(path);
    }
    throw err;
  }
}

// Session cache: identical requests resolve once. Failed requests are evicted
// so a retry can succeed.
function cached(key, loader) {
  if (memo.has(key)) return memo.get(key);
  const promise = loader().catch((err) => {
    memo.delete(key);
    throw err;
  });
  memo.set(key, promise);
  return promise;
}

/* ------------------------------ single objects ----------------------------- */

export function health() {
  return cached("health", () => getJSON("/health"));
}

export function meta(type, id, { enrich } = {}) {
  return cached(`meta:${type}:${id}:${enrich ?? ""}`, () =>
    getJSON(withQuery(`/meta/${type}/${encodeURIComponent(id)}`, { enrich })),
  );
}

export function scores(type, id) {
  return cached(`scores:${type}:${id}`, () => getJSON(`/scores/${type}/${encodeURIComponent(id)}`));
}

export function credits(type, id) {
  return cached(`credits:${type}:${id}`, () => getJSON(`/credits/${type}/${encodeURIComponent(id)}`));
}

export function similar(type, id) {
  return cached(`similar:${type}:${id}`, () => getJSON(`/similar/${type}/${encodeURIComponent(id)}`));
}

export function person(id) {
  return cached(`person:${id}`, () => getJSON(`/person/${encodeURIComponent(id)}`));
}

export function tv(id) {
  return cached(`tv:${id}`, () => getJSON(`/tv/${encodeURIComponent(id)}`));
}

export function images(type, id) {
  return cached(`images:${type}:${id}`, () => getJSON(`/images/${type}/${encodeURIComponent(id)}`));
}

export function streaming(type, id, { country = DEFAULT_COUNTRY } = {}) {
  return cached(`streaming:${type}:${id}:${country}`, () =>
    getJSON(withQuery(`/streaming/${type}/${encodeURIComponent(id)}`, { country })),
  );
}

/* -------------------------------- collections ------------------------------ */

export function catalog(type, { genre, skip, search: term } = {}) {
  return cached(`catalog:${type}:${genre || ""}:${skip ?? ""}:${term || ""}`, () =>
    getJSON(withQuery(`/catalog/${type}/top`, { genre, skip, search: term })),
  );
}

export function trending(type, { limit } = {}) {
  return cached(`trending:${type}:${limit ?? ""}`, () =>
    getJSON(withQuery(`/trending/${type}`, { limit })),
  );
}

export function search(q, type, { skip } = {}) {
  return cached(`search:${q}:${type || ""}:${skip ?? ""}`, () =>
    getJSON(withQuery("/search", { q, type, skip })),
  );
}

export function imdbSearch(q) {
  return cached(`imdb:${q}`, () => getJSON(withQuery("/imdb/search", { q })));
}

export function animeSearch(q) {
  return cached(`anime:${q}`, () => getJSON(withQuery("/anime/search", { q })));
}

/* --------------------------------- artwork --------------------------------- */

export function poster(id, size = "medium") {
  return `${base}/img/poster/${size}/${encodeURIComponent(id)}/img`;
}

export function background(id, size = "large") {
  return `${base}/img/background/${size}/${encodeURIComponent(id)}/img`;
}

export function logo(id, size = "medium") {
  return `${base}/img/logo/${size}/${encodeURIComponent(id)}/img`;
}

export function still(id, season, episode, size = "w780") {
  return `${base}/img/still/${encodeURIComponent(id)}/${season}/${episode}/${size}`;
}
