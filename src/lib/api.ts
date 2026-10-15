import { API_BASE, API_FALLBACK, DEFAULT_COUNTRY } from "./config";
import type {
  AnimeSearchResponse,
  CatalogResponse,
  Credits,
  Health,
  ImagesResponse,
  ImdbSearchResponse,
  MediaType,
  Meta,
  Person,
  Scores,
  SearchResponse,
  SimilarResponse,
  StreamingResponse,
  TvResponse,
} from "./types";

let primaryBase = API_BASE;
const memo = new Map<string, Promise<unknown>>();

export function activeBase(): string {
  return primaryBase;
}

async function request<T>(path: string): Promise<T> {
  const bases = primaryBase === API_BASE ? [API_BASE, API_FALLBACK] : [primaryBase, API_FALLBACK];
  let lastError: Error | null = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { accept: "application/json" },
        mode: "cors",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as T;
      primaryBase = base;
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("Request failed");
}

function get<T>(path: string): Promise<T> {
  const cached = memo.get(path);
  if (cached) return cached as Promise<T>;
  const pending = request<T>(path).catch((error) => {
    memo.delete(path);
    throw error;
  });
  memo.set(path, pending as Promise<unknown>);
  return pending;
}

function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const out = search.toString();
  return out ? `?${out}` : "";
}

export interface CatalogQuery {
  genre?: string;
  skip?: number;
  search?: string;
  catalog?: string;
}

export const Api = {
  health: () => get<Health>("/health"),

  catalog: (type: MediaType, { genre, skip, search, catalog = "top" }: CatalogQuery = {}) =>
    get<CatalogResponse>(`/catalog/${type}/${catalog}${qs({ genre, skip, search })}`),

  trending: (type: MediaType, limit = 20) => get<CatalogResponse>(`/trending/${type}${qs({ limit })}`),

  search: (query: string, type?: MediaType) =>
    get<SearchResponse>(`/search${qs({ q: query, type })}`),

  imdbSearch: (query: string) => get<ImdbSearchResponse>(`/imdb/search${qs({ q: query })}`),

  animeSearch: (query: string) => get<AnimeSearchResponse>(`/anime/search${qs({ q: query })}`),

  meta: (type: MediaType, id: string) => get<{ meta: Meta }>(`/meta/${type}/${id}`),

  scores: (type: MediaType, id: string) => get<Scores>(`/scores/${type}/${id}`),

  credits: (type: MediaType, id: string) => get<Credits>(`/credits/${type}/${id}`),

  similar: (type: MediaType, id: string) => get<SimilarResponse>(`/similar/${type}/${id}`),

  streaming: (type: MediaType, id: string, country: string = DEFAULT_COUNTRY) =>
    get<StreamingResponse>(`/streaming/${type}/${id}${qs({ country })}`),

  tv: (id: string) => get<TvResponse>(`/tv/${id}`),

  person: (id: string) => get<Person>(`/person/${id}`),

  images: (type: MediaType, id: string) => get<ImagesResponse>(`/images/${type}/${id}`),
};
