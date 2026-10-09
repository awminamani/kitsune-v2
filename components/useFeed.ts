"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Anime, BrowseQuery, Page } from "@/lib/types";

export interface FeedState {
  items: Anime[];
  page: number;
  hasNext: boolean;
  total: number | null;
  initial: boolean;
  appending: boolean;
  error: string | null;
  loadMore: () => void;
  reload: () => void;
}

function toParams(q: BrowseQuery): string {
  const sp = new URLSearchParams();
  if (q.search) sp.set("q", q.search);
  if (q.genre) sp.set("genre", q.genre);
  if (q.format) sp.set("format", q.format);
  if (q.status) sp.set("status", q.status);
  if (q.season) sp.set("season", q.season);
  if (q.year) sp.set("year", String(q.year));
  if (q.sort) sp.set("sort", q.sort);
  if (q.perPage) sp.set("perPage", String(q.perPage));
  return sp.toString();
}

export function useFeed(query: BrowseQuery, enabled = true): FeedState {
  const [items, setItems] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [initial, setInitial] = useState(enabled);
  const [appending, setAppending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const key = toParams(query);

  const load = useCallback(
    async (target: number, append: boolean, myKey: string) => {
      const my = ++seq.current;
      if (append) setAppending(true);
      else setInitial(true);
      setError(null);
      try {
        const res = await fetch(`/api/anime?${myKey}&page=${target}`);
        const json = (await res.json()) as Page<Anime> & { error?: string };
        if (my !== seq.current) return;
        if (json.error) throw new Error(json.error);
        setItems((prev) => (append ? [...prev, ...json.items] : json.items));
        setPage(json.page);
        setHasNext(json.hasNext);
        setTotal(json.total);
      } catch (err) {
        if (my !== seq.current) return;
        setError(err instanceof Error ? err.message : "Could not load");
        if (!append) {
          setItems([]);
          setHasNext(false);
          setTotal(null);
        }
      } finally {
        if (my === seq.current) {
          setInitial(false);
          setAppending(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;
    setItems([]);
    setPage(1);
    setHasNext(false);
    setTotal(null);
    load(1, false, key);
  }, [key, enabled, load]);

  const loadMore = useCallback(() => {
    if (initial || appending || !hasNext) return;
    load(page + 1, true, key);
  }, [initial, appending, hasNext, load, page, key]);

  const reload = useCallback(() => {
    load(1, false, key);
  }, [load, key]);

  return { items, page, hasNext, total, initial, appending, error, loadMore, reload };
}
