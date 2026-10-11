import { API_BASE, API_FALLBACK } from "./config.js";

let base = API_BASE;

async function request(path) {
  const res = await fetch(base + path, { headers: { accept: "application/json" } });
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
  } catch (e) {
    if (base !== API_FALLBACK) {
      base = API_FALLBACK;
      return request(path);
    }
    throw e;
  }
}

export function activeBase() {
  return base;
}

export function catalog(type, { genre, skip } = {}) {
  const p = new URLSearchParams();
  if (genre) p.set("genre", genre);
  if (skip != null) p.set("skip", String(skip));
  const qs = p.toString();
  return getJSON(`/catalog/${type}/top${qs ? `?${qs}` : ""}`);
}

export function search(q, type) {
  const p = new URLSearchParams({ q });
  if (type) p.set("type", type);
  return getJSON(`/search?${p.toString()}`);
}

export function meta(type, id) {
  return getJSON(`/meta/${type}/${encodeURIComponent(id)}`);
}

export function poster(id, size = "medium") {
  return `${base}/img/poster/${size}/${id}/img`;
}

export function background(id, size = "large") {
  return `${base}/img/background/${size}/${id}/img`;
}

export function logo(id, size = "medium") {
  return `${base}/img/logo/${size}/${id}/img`;
}
