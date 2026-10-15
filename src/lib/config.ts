import type { MediaType } from "./types";

export const API_BASE = "https://api.streamx.qzz.io";
export const API_FALLBACK = "https://streamx-api.pages.dev";

export const DEFAULT_COUNTRY = "US";
export const COUNTRY_STORAGE_KEY = "streamx.country";

export interface Country {
  code: string;
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "IN", name: "India" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "PL", name: "Poland" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
];

export type RowSource = "trending" | "catalog";

export interface RowDef {
  key: string;
  title: string;
  blurb?: string;
  type: MediaType;
  source: RowSource;
  genre?: string;
  catalog?: string;
}

export const ROWS: RowDef[] = [
  { key: "trending-movies", title: "Trending Movies", blurb: "What the world is watching now", type: "movie", source: "trending" },
  { key: "trending-series", title: "Trending Series", blurb: "Binge-worthy, just released", type: "series", source: "trending" },
  { key: "action", title: "Action & Adventure", type: "movie", source: "catalog", genre: "Action" },
  { key: "scifi", title: "Sci-Fi & Fantasy", type: "movie", source: "catalog", genre: "Sci-Fi" },
  { key: "comedy", title: "Comedy", type: "movie", source: "catalog", genre: "Comedy" },
  { key: "drama-series", title: "Prestige Drama", type: "series", source: "catalog", genre: "Drama" },
  { key: "animation", title: "Animation", type: "movie", source: "catalog", genre: "Animation" },
  { key: "crime-series", title: "Crime & Mystery", type: "series", source: "catalog", genre: "Crime" },
  { key: "horror", title: "Horror", type: "movie", source: "catalog", genre: "Horror" },
  { key: "thriller", title: "Thrillers", type: "movie", source: "catalog", genre: "Thriller" },
  { key: "documentary", title: "Documentaries", type: "movie", source: "catalog", genre: "Documentary" },
];

export const GENRES: Record<MediaType, string[]> = {
  movie: [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
  ],
  series: [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
  ],
};

export const HERO_ROTATE_MS = 9000;
export const HOME_ROW_LIMIT = 18;
