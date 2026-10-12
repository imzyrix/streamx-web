// StreamX web front end — hash router.

import { openDetail } from "./detail.js";
import { showHome } from "./home.js";
import { showSearch } from "./search.js";

export function onRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [seg, a, b] = hash.split("/");
  const query = new URLSearchParams(hash.includes("?") ? hash.slice(hash.indexOf("?")) : "").get("q");

  if (seg === "movies") return showHome("movie");
  if (seg === "series") return showHome("series");
  if (seg === "search") return showSearch(decodeURIComponent(query || a || ""));
  if (seg === "title" && a && b) {
    showHome("home");
    return openDetail(a, decodeURIComponent(b));
  }
  return showHome("home");
}
