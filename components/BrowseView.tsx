"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import type { BrowseQuery, MediaFormat, Season, SortKey } from "@/lib/types";
import { useFeed } from "./useFeed";
import { useSentinel } from "./useInfinite";
import FilterSheet from "./FilterSheet";
import { CardGrid, CardSkeletons } from "./CardGrid";
import { Search, Sliders } from "./icons";
import { SORT_OPTIONS } from "@/lib/query";

function BrowseInner() {
  const router = useRouter();
  const params = useSearchParams();

  const query = useMemo<BrowseQuery>(() => {
    const n = (k: string) => { const v = params.get(k); return v ? Number(v) : undefined; };
    const s = (k: string) => params.get(k) ?? undefined;
    return {
      search: s("q"),
      genre: s("genre"),
      format: s("format") as MediaFormat | undefined,
      season: s("season") as Season | undefined,
      sort: (s("sort") as SortKey | undefined) ?? "POPULARITY",
      year: n("year"),
      perPage: 24,
    };
  }, [params]);

  const feed = useFeed(query);
  const sentinel = useSentinel(feed.loadMore, !feed.initial && feed.hasNext);

  const [text, setText] = useState(query.search ?? "");
  useEffect(() => setText(query.search ?? ""), [query.search]);

  const [sheet, setSheet] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/genres").then((r) => r.json()).then((d) => setGenres(d.genres ?? [])).catch(() => setGenres([]));
  }, []);

  const push = useCallback((next: BrowseQuery) => {
    const sp = new URLSearchParams();
    if (next.search) sp.set("q", next.search);
    if (next.genre) sp.set("genre", next.genre);
    if (next.format) sp.set("format", next.format);
    if (next.season) sp.set("season", next.season);
    if (next.year) sp.set("year", String(next.year));
    if (next.sort && next.sort !== "POPULARITY") sp.set("sort", next.sort);
    const qs = sp.toString();
    router.push(qs ? `/browse?${qs}` : "/browse", { scroll: false });
  }, [router]);

  useEffect(() => {
    const current = query.search ?? "";
    if (text === current) return;
    const t = setTimeout(() => {
      push({ ...query, search: text.trim().length >= 2 ? text.trim() : undefined });
    }, 420);
    return () => clearTimeout(t);
  }, [text, query, push]);

  const activeChips = [
    query.genre && { label: query.genre, clear: () => push({ ...query, genre: undefined }) },
    query.format && { label: query.format, clear: () => push({ ...query, format: undefined }) },
    query.season && { label: query.season, clear: () => push({ ...query, season: undefined }) },
    query.year && { label: String(query.year), clear: () => push({ ...query, year: undefined }) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const filterCount = activeChips.length;
  const hasQuery = !!query.search || filterCount > 0;

  return (
    <main>
      <section className="section shell" style={{ paddingTop: "calc(var(--nav-h) + 48px)" }}>
        <div className="sec-head">
          <div>
            <div className="sec-kicker">Browse</div>
            <h2>
              {query.search ? <>Results for <em>{query.search}</em></> : <>The whole <em>catalogue</em></>}
            </h2>
          </div>
          {feed.total != null && <span className="sec-note">{feed.total.toLocaleString()} titles</span>}
        </div>

        <div className="search" style={{ maxWidth: 720, marginBottom: 20 }}>
          <Search size={19} />
          <input type="search" placeholder="Search a title…" autoComplete="off" aria-label="Search anime" value={text} onChange={(e) => setText(e.target.value)} />
          <button className={filterCount > 0 ? "icon-btn has" : "icon-btn"} onClick={() => setSheet(true)} aria-label="Filters">
            <Sliders size={16} />
            {filterCount > 0 && <span className="badge">{filterCount}</span>}
          </button>
        </div>

        <div className="filters">
          {SORT_OPTIONS.map((s) => (
            <button key={s.key} className={(query.sort ?? "POPULARITY") === s.key ? "pill on" : "pill"} onClick={() => push({ ...query, sort: s.key })}>
              {s.label}
            </button>
          ))}
          {activeChips.length > 0 && <span className="filters-sep" aria-hidden="true" />}
          {activeChips.map((c) => (
            <button key={c.label} className="pill on" onClick={c.clear}>{c.label} ✕</button>
          ))}
          {hasQuery && (
            <button className="sec-link" style={{ marginLeft: 4 }} onClick={() => push({ sort: query.sort })}>Clear all</button>
          )}
        </div>

        {feed.error && feed.items.length === 0 ? (
          <div className="notice">
            <h3>That didn&apos;t load</h3>
            <p>{feed.error}</p>
            <button className="btn btn-solid" onClick={feed.reload}>Try again</button>
          </div>
        ) : feed.initial ? (
          <CardSkeletons count={12} />
        ) : feed.items.length === 0 ? (
          <div className="notice">
            <h3>Nothing matched</h3>
            <p>Try a shorter title, or loosen the filters.</p>
            <button className="btn btn-line" onClick={() => push({ sort: query.sort })}>Clear filters</button>
          </div>
        ) : (
          <>
            <CardGrid items={feed.items} priorityCount={6} />
            {feed.appending && <CardSkeletons count={6} />}
            {!feed.hasNext && <p className="endmark">end of catalogue</p>}
            <div ref={sentinel} className="sentinel" />
          </>
        )}
      </section>

      <FilterSheet open={sheet} current={query} genres={genres} onApply={(q) => { push(q); setSheet(false); }} onClose={() => setSheet(false)} />
    </main>
  );
}

export default function BrowseView() {
  return (
    <Suspense fallback={<div className="shell section" />}>
      <BrowseInner />
    </Suspense>
  );
}
