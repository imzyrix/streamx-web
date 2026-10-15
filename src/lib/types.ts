export type MediaType = "movie" | "series";

export interface TrailerLink {
  source: string;
  type?: string;
}

export interface TrailerStream {
  title: string;
  ytId: string;
}

export interface MetaLink {
  name: string;
  category: string;
  url: string;
}

export interface Episode {
  id?: string;
  name?: string | null;
  title?: string | null;
  season?: number;
  number?: number;
  episode?: number;
  firstAired?: string | null;
  released?: string | null;
  rating?: string | number | null;
  overview?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  still?: string | null;
  tvdb_id?: number;
}

export interface ImagesResponse {
  ok?: boolean;
  type?: MediaType;
  id?: string;
  source?: string;
  direct?: boolean;
  kinds?: string[];
  sizes?: string[];
  poster?: Record<string, string>;
  background?: Record<string, string>;
  logo?: Record<string, string>;
}

export interface StillTemplate {
  sizes?: string[];
  template?: string;
}

export interface Facts {
  source?: string;
  externalIds?: Record<string, string | null>;
  budget?: number | null;
  boxOffice?: number | null;
  runtimeMinutes?: number | null;
  certification?: string | null;
  officialWebsite?: string | null;
  countries?: string[];
  languages?: string[];
  productionCompanies?: string[];
  genres?: string[];
  directors?: string[];
  composers?: string[];
  partOfSeries?: string[];
}

export interface Meta {
  id: string;
  imdb_id?: string;
  type?: MediaType;
  name: string;
  slug?: string;
  poster?: string;
  background?: string;
  logo?: string;
  genres?: string[];
  genre?: string[];
  description?: string;
  imdbRating?: string;
  runtime?: string;
  released?: string;
  releaseInfo?: string;
  year?: string;
  cast?: string[];
  director?: string[];
  writer?: string[];
  country?: string;
  awards?: string;
  popularity?: number;
  popularities?: Record<string, number>;
  moviedb_id?: number;
  tvdb_id?: number;
  status?: string;
  dvdRelease?: string;
  trailers?: TrailerLink[];
  trailerStreams?: TrailerStream[];
  links?: MetaLink[];
  videos?: Episode[];
  images?: ImagesResponse;
  externalIds?: Record<string, string | null>;
  seasons?: number[];
  still?: StillTemplate;
  facts?: Facts;
  wiki?: WikiSummary | null;
  behaviorHints?: { defaultVideoId?: string; hasScheduledVideos?: boolean };
}

export interface CatalogResponse {
  metas: Meta[];
  count: number;
  hasMore?: boolean;
  cacheMaxAge?: number;
  query?: Record<string, unknown>;
}

export interface SearchResponse {
  metas: Meta[];
  count: number;
  rank?: number | Record<string, unknown>;
  cacheMaxAge?: number;
  query?: Record<string, unknown>;
}

export interface ImdbResult {
  id: string;
  title: string | null;
  type: MediaType;
  kind: string | null;
  year: number | null;
  rank?: number | null;
  stars: string[];
  poster: string | null;
  posterWidth?: number | null;
  posterHeight?: number | null;
}

export interface ImdbSearchResponse {
  results: ImdbResult[];
  count: number;
  source: string;
  ok?: boolean;
  requiresApiKey?: boolean;
  query?: string;
}

export interface AnimeResult {
  id: number | null;
  title: string | null;
  titleNative: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  coverImage: string | null;
  bannerImage: string | null;
  siteUrl: string | null;
  description: string | null;
}

export interface AnimeSearchResponse {
  results: AnimeResult[];
  count: number;
  source: string;
  ok?: boolean;
  requiresApiKey?: boolean;
  query?: string;
}

export interface ScoreCritics {
  title?: string;
  score?: number | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  sentiment?: string | null;
  certified?: boolean;
  bestRating?: number | null;
}

export interface Scores {
  ok?: boolean;
  id?: string;
  title: string;
  type: MediaType;
  year?: number | string | null;
  imdb?: { rating: number | null; url: string | null };
  rottenTomatoes?: {
    source?: string;
    url?: string | null;
    critics?: ScoreCritics;
    audience?: ScoreCritics;
  };
  metacritic?: {
    source?: string;
    url?: string | null;
    critics?: ScoreCritics;
    contentRating?: string | null;
  };
  sources?: Record<string, boolean>;
  notes?: string | string[];
  generatedAt?: string;
}

export interface PersonRef {
  id: string;
  wikidataId?: string | null;
  name: string;
  role: string;
  image: string | null;
  description?: string | null;
}

export interface Credits {
  ok?: boolean;
  id?: string;
  type?: MediaType;
  source?: string;
  cast: PersonRef[];
  crew: PersonRef[];
  directors: PersonRef[];
  generatedAt?: string;
}

export interface SimilarResponse {
  ok?: boolean;
  id?: string;
  type?: MediaType;
  source?: string;
  count: number;
  metas: Meta[];
  generatedAt?: string;
}

export interface Provider {
  name: string;
  logo?: string | null;
  types: string[];
  quality: string | null;
  webUrl?: string | null;
}

export interface StreamingResponse {
  ok?: boolean;
  id?: string;
  type?: MediaType;
  source?: string;
  title?: string | null;
  country?: string;
  matched?: { title?: string; year?: number | string | null; path?: string } | null;
  justWatchUrl?: string | null;
  providers: Provider[];
  generatedAt?: string;
}

export interface TvShow {
  source?: string;
  id?: number | null;
  url?: string | null;
  name?: string | null;
  type?: string | null;
  language?: string | null;
  genres?: string[];
  status?: string | null;
  runtime?: number | null;
  premiered?: string | null;
  ended?: string | null;
  officialSite?: string | null;
  rating?: number | null;
  weight?: number | null;
  network?: string | null;
  country?: string | null;
  image?: string | null;
  summary?: string | null;
  externals?: { imdb?: string | null; thetvdb?: number | null; tvrage?: number | null };
}

export interface TvResponse {
  ok?: boolean;
  id?: string;
  requiresApiKey?: boolean;
  show?: TvShow | null;
  generatedAt?: string;
}

export interface WikiSummary {
  source?: string;
  title?: string;
  description?: string | null;
  extract?: string | null;
  url?: string | null;
  thumbnail?: string | null;
}

export interface Person {
  ok?: boolean;
  id?: string;
  name?: string | null;
  born?: string | null;
  died?: string | null;
  description?: string | null;
  image?: string | null;
  officialSite?: string | null;
  wikidataId?: string | null;
  source?: string;
  externalIds?: Record<string, string | null>;
  wiki?: WikiSummary | null;
  generatedAt?: string;
}

export interface Health {
  ok?: boolean;
  service?: string;
  version?: string;
  requiresApiKey?: boolean;
  time?: string;
  endpoints?: Record<string, string>;
  upstreams?: string[];
  imageKinds?: string[];
  imageSizes?: string[];
  stillSizes?: string[];
}
