// StreamX web front end — configuration.
// Point this at any StreamX API deployment (self-hosted, keyless).

export const API_BASE = "https://api.streamx.qzz.io";

// Fallback if the custom domain is not reachable (e.g. a fresh deployment).
export const API_FALLBACK = "https://streamx-api.pages.dev";

// Default justWatch region for the "Where to watch" section.
export const DEFAULT_COUNTRY = "US";

// Home row definitions. Each row is a catalogue request.
export const ROWS = [
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

export const HERO_ROTATE_MS = 9000;
