// StreamX web front end — small DOM / formatting helpers.

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}

export function el(tag, attrs = {}, html = "") {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "dataset") Object.assign(node.dataset, v);
    else node.setAttribute(k, v);
  }
  if (html) node.innerHTML = html;
  return node;
}

export function yearOf(m) {
  if (!m) return "";
  if (m.year) return String(m.year).slice(0, 4);
  if (m.releaseInfo) return String(m.releaseInfo).slice(0, 4);
  if (m.released) return String(m.released).slice(0, 4);
  return "";
}

export function itemId(m) {
  return m?.imdb_id || m?.id || "";
}

export function typeLabel(t) {
  return t === "series" ? "Series" : "Movie";
}

export function normalizeType(t) {
  const v = String(t || "").toLowerCase();
  if (["series", "tv", "show", "tvshow", "tvseries"].includes(v)) return "series";
  return "movie";
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function money(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Load a URL into an element's background-image, fading in once decoded.
export function loadBg(node, url) {
  if (!node || !url) return;
  const img = new Image();
  img.onload = () => {
    node.style.backgroundImage = `url("${url}")`;
    node.classList.add("ready");
  };
  img.onerror = () => node.classList.remove("ready");
  img.src = url;
}

export function truncate(text, max = 240) {
  const s = String(text ?? "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
