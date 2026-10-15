import { useEffect, useState } from "react";
import type { MediaType, Meta } from "./types";

const KEY = "streamx.watchlist.v1";

export interface WatchItem {
  id: string;
  imdb_id?: string;
  type: MediaType;
  name: string;
  poster?: string;
  releaseInfo?: string;
  imdbRating?: string;
  addedAt: number;
}

const listeners = new Set<() => void>();
let cache: WatchItem[] | null = null;

function read(): WatchItem[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as WatchItem[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: WatchItem[]): void {
  cache = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
  for (const listener of listeners) listener();
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>(read);

  useEffect(() => {
    const listener = () => setItems(read());
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const has = (id: string) => items.some((item) => item.id === id);

  const toggle = (meta: Meta, type: MediaType) => {
    const id = meta.imdb_id || meta.id;
    const current = read();
    if (current.some((item) => item.id === id)) {
      write(current.filter((item) => item.id !== id));
      return;
    }
    const next: WatchItem = {
      id,
      imdb_id: meta.imdb_id,
      type: meta.type ?? type,
      name: meta.name,
      poster: meta.poster,
      releaseInfo: meta.releaseInfo || meta.year,
      imdbRating: meta.imdbRating,
      addedAt: Date.now(),
    };
    write([next, ...current].slice(0, 240));
  };

  return { items, has, toggle };
}
