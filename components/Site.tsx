"use client";

import {
  AnimatePresence,
  m,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";
import Detail from "./Detail";
import Spotlight from "./Spotlight";
import { Reveal, Wave } from "./Reveal";
import { useSentinel } from "./useInfinite";
import { useTheme } from "./theme";
import { EASE } from "./motion";
import { ArrowUp, Compass, Search, Sliders, Spark } from "./icons";

interface Props {
  trending: Anime[];
  genres: string[];
  spotlight: Anime[];
  rails: { genre: string; items: Anime[] }[];
}

interface Filters {
  genre: string;
  format: string;
  sort: string;
  year: string;
}

const EMPTY: Filters = { genre: "", format: "", sort: "POPULARITY_DESC", year: "" };
const FORMATS = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"];
const SORTS = [
  { v: "POPULARITY_DESC", l: "Most watched" },
  { v: "SCORE_DESC", l: "Highest rated" },
  { v: "TRENDING_DESC", l: "Rising now" },
  { v: "TITLE_ENGLISH", l: "A–Z" },
];
const RAIL_SORTS = [
  { v: "POPULARITY_DESC", l: "Most watched" },
  { v: "SCORE_DESC", l: "Highest rated" },
  { v: "TRENDING_DESC", l: "Rising now" },
  { v: "FAVOURITES_DESC", l: "Most loved" },
];
const MOODS = ["Action", "Romance", "Fantasy", "Thriller", "Comedy", "Horror", "Sci-Fi", "Drama"];
const FALLBACK = [
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
  "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
  "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
];

const nActive = (f: Filters) => (f.genre ? 1 : 0) + (f.format ? 1 : 0) + (f.year ? 1 : 0);
const wants = (q: string, f: Filters) =>
  q.trim().length >= 2 || !!f.genre || !!f.format || !!f.year;

function qs(p: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== "") sp.set(k, String(v));
  return sp.toString();
}

export default function Site({ trending, genres, spotlight, rails }: Props) {
  const { hue, auto, setHue, adopt, release } = useTheme();

  const [open, setOpen] = useState<Anime | null>(null);

  // ---------- hero parallax ----------
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: hp } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(hp, [0, 1], ["0%", "18%"]);
  const bgFade = useTransform(hp, [0, 0.9], [1, 0.1]);
  const bodyY = useTransform(hp, [0, 1], ["0%", "-11%"]);
  const bodyFade = useTransform(hp, [0, 0.78], [1, 0]);

  // ---------- nav progress ----------
  const { scrollYProgress } = useScroll();
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // ---------- search ----------
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [allGenres, setAllGenres] = useState(false);
  const [res, setRes] = useState<Anime[]>([]);
  const [rPage, setRPage] = useState(1);
  const [rMore, setRMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [moreBusy, setMoreBusy] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const runSearch = useCallback(
    async (query: string, fl: Filters, page: number, append: boolean) => {
      const s = ++seq.current;
      if (append) setMoreBusy(true);
      else setBusy(true);
      try {
        const r = await fetch(
          `/api/search?${qs({
            q: query.trim() || undefined,
            page,
            genre: fl.genre || undefined,
            format: fl.format || undefined,
            sort: fl.sort,
            year: fl.year || undefined,
          })}`
        );
        const j = await r.json();
        if (s !== seq.current) return;
        setRes((p) => (append ? [...p, ...(j.results ?? [])] : j.results ?? []));
        setRPage(page);
        setRMore(!!j.hasNextPage);
      } catch {
        if (s !== seq.current) return;
        if (!append) setRes([]);
        setRMore(false);
      } finally {
        if (s === seq.current) {
          setBusy(false);
          setMoreBusy(false);
        }
      }
    },
    []
  );

  const onType = useCallback(
    (v: string) => {
      setQ(v);
      if (debounce.current) clearTimeout(debounce.current);
      if (!wants(v, f)) {
        setRes([]);
        setRMore(false);
        setBusy(false);
        return;
      }
      setBusy(true);
      debounce.current = setTimeout(() => runSearch(v, f, 1, false), 420);
    },
    [f, runSearch]
  );

  const apply = useCallback(
    (next: Filters) => {
      setF(next);
      setSheet(false);
      if (wants(q, next)) runSearch(q, next, 1, false);
      else {
        setRes([]);
        setRMore(false);
      }
    },
    [q, runSearch]
  );

  const clearAll = useCallback(() => {
    setQ("");
    setF(EMPTY);
    setRes([]);
    setRMore(false);
    release();
    if (debounce.current) clearTimeout(debounce.current);
  }, [release]);

  const showRes = wants(q, f);

  const loadMoreRes = useCallback(() => {
    if (moreBusy || busy || !rMore) return;
    runSearch(q, f, rPage + 1, true);
  }, [moreBusy, busy, rMore, runSearch, q, f, rPage]);
  const resSentinel = useSentinel(loadMoreRes, showRes && rMore && !busy);

  // ---------- explore feed ----------
  const [eSort, setESort] = useState("POPULARITY_DESC");
  const [eItems, setEItems] = useState<Anime[]>([]);
  const [ePage, setEPage] = useState(1);
  const [eMore, setEMore] = useState(true);
  const [eBusy, setEBusy] = useState(false);
  const [eFirst, setEFirst] = useState(true);
  const eSeq = useRef(0);

  const loadExplore = useCallback(
    async (genre: string, sort: string, page: number, append: boolean) => {
      const s = ++eSeq.current;
      if (append) setEBusy(true);
      else setEFirst(true);
      try {
        const r = await fetch(`/api/browse?${qs({ page, genre: genre || undefined, sort })}`);
        const j = await r.json();
        if (s !== eSeq.current) return;
        setEItems((p) => (append ? [...p, ...(j.results ?? [])] : j.results ?? []));
        setEPage(page);
        setEMore(!!j.hasNextPage);
      } catch {
        if (s !== eSeq.current) return;
        if (!append) setEItems([]);
        setEMore(false);
      } finally {
        if (s === eSeq.current) {
          setEBusy(false);
          setEFirst(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadExplore(f.genre, eSort, 1, false);
  }, [f.genre, eSort, loadExplore]);

  const loadMoreExplore = useCallback(() => {
    if (eBusy || eFirst || !eMore) return;
    loadExplore(f.genre, eSort, ePage + 1, true);
  }, [eBusy, eFirst, eMore, loadExplore, f.genre, eSort, ePage]);
  const eSentinel = useSentinel(loadMoreExplore, eMore && !eFirst);

  // ---------- nav state ----------
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const [active, setActive] = useState("top");
  useEffect(() => {
    const ids = ["top", "spotlight", "trending", "explore"];
    const els = ids.map((i) => document.getElementById(i)).filter((e): e is HTMLElement => !!e);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  // ---------- hero backdrop rotation ----------
  const banners = trending
    .map((a) => a.banner)
    .filter((b): b is string => !!b)
    .filter((b, i, arr) => arr.indexOf(b) === i)
    .slice(0, 6);

  const genreList = genres.length ? genres : FALLBACK;
  const count = trending.length + rails.reduce((n, r) => n + r.items.length, 0);

  return (
    <>
      {/* ============ nav ============ */}
      <header className={solid ? "nav solid" : "nav"}>
        <m.span className="nav-progress" style={{ scaleX: bar }} aria-hidden="true" />
        <a className="brand" href="#top">
          <img src="/kitsune.png" alt="" />
          <span>
            Kit<em>sune</em>
          </span>
        </a>
        <nav className="nav-links">
          <a href="#spotlight">Spotlight</a>
          <a href="#trending">Trending</a>
          <a href="#explore">Explore</a>
        </nav>
        <div className="hue-dial" title="Theme colour">
          <span className="hue-swatch" aria-hidden="true" />
          <input
            type="range"
            min={0}
            max={360}
            value={Math.round(hue)}
            onChange={(e) => setHue(Number(e.target.value))}
            aria-label="Theme hue"
          />
          {!auto && (
            <button
              className="sec-link"
              style={{ fontSize: "0.7rem" }}
              onClick={release}
              title="Return to automatic theme"
            >
              auto
            </button>
          )}
        </div>
      </header>

      <main>
        {/* ============ hero ============ */}
        <section className="hero" id="top" ref={heroRef}>
          <m.div className="hero-layer" style={{ y: bgY, opacity: bgFade }} aria-hidden="true">
            <div className="hero-img">
              {banners.map((b, i) => (
                <img key={b} src={b} alt="" className={i === 0 ? "on" : ""} />
              ))}
            </div>
            <div className="hero-wash" />
          </m.div>

          <m.div className="hero-body" style={{ y: bodyY, opacity: bodyFade }}>
            <span className="hero-eyebrow">Kitsune · anime discovery</span>
            <h1 className="hero-title">
              Find the one you&apos;ll <em>binge</em> next.
            </h1>

            <div className="search">
              <Search size={20} />
              <input
                type="search"
                placeholder="Search a title…"
                autoComplete="off"
                aria-label="Search anime"
                value={q}
                onChange={(e) => onType(e.target.value)}
              />
              {q && (
                <button className="search-clear" onClick={() => onType("")} aria-label="Clear">
                  ✕
                </button>
              )}
              <button
                className="search-clear"
                onClick={() => setSheet(true)}
                aria-label="Filters"
                style={{ position: "relative" }}
              >
                <Sliders size={16} />
                {nActive(f) > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      color: "var(--accent-ink)",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {nActive(f)}
                  </span>
                )}
              </button>
            </div>

            <div className="hero-moods">
              {MOODS.map((g) => (
                <button
                  key={g}
                  className={f.genre === g ? "mood on" : "mood"}
                  onClick={() => apply({ ...f, genre: f.genre === g ? "" : g })}
                >
                  {g}
                </button>
              ))}
              <button
                className={allGenres ? "mood mood-more on" : "mood mood-more"}
                onClick={() => setAllGenres((v) => !v)}
                aria-expanded={allGenres}
              >
                {allGenres ? "Fewer" : `All ${genreList.length}`}
              </button>
            </div>

            {allGenres && (
              <m.div
                className="hero-moods"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: EASE }}
              >
                {genreList
                  .filter((g) => !MOODS.includes(g))
                  .map((g) => (
                    <button
                      key={g}
                      className={f.genre === g ? "mood on" : "mood"}
                      onClick={() => apply({ ...f, genre: f.genre === g ? "" : g })}
                    >
                      {g}
                    </button>
                  ))}
              </m.div>
            )}

            <div className="hero-stats">
              <div>
                <div className="stat-n">{count}</div>
                <div className="stat-l">titles on this page</div>
              </div>
              <div>
                <div className="stat-n">20k+</div>
                <div className="stat-l">searchable via AniList</div>
              </div>
              <div>
                <div className="stat-n">{genreList.length}</div>
                <div className="stat-l">moods to filter by</div>
              </div>
            </div>
          </m.div>
        </section>

        {/* ============ search results ============ */}
        <AnimatePresence>
          {showRes && (
            <m.section
              className="section shell"
              id="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              <div className="sec-head">
                <div>
                  <div className="sec-kicker">Results</div>
                  <h2>
                    {busy && res.length === 0
                      ? "Searching…"
                      : `${res.length}${rMore ? "+" : ""} found`}
                  </h2>
                </div>
                <button className="sec-link" onClick={clearAll}>
                  Clear
                </button>
              </div>

              <Wave className="grid">
                {busy && res.length === 0 ? (
                  <Skeletons n={12} />
                ) : (
                  res.map((a, i) => (
                    <AnimeCard
                      key={a.id}
                      anime={a}
                      index={i + 1}
                      onOpen={setOpen}
                      onHover={adopt}
                    />
                  ))
                )}
              </Wave>

              {moreBusy && (
                <Wave className="grid" >
                  <Skeletons n={6} />
                </Wave>
              )}
              {!busy && !moreBusy && res.length === 0 && (
                <p className="empty">
                  Nothing matched — try a shorter title, or loosen the filters.
                </p>
              )}
              {!rMore && res.length > 0 && <p className="endmark">end of results</p>}
              <div ref={resSentinel} className="sentinel" />
            </m.section>
          )}
        </AnimatePresence>

        {/* ============ spotlight ============ */}
        {spotlight.length > 0 && (
          <section className="section shell" id="spotlight">
            <Reveal>
              <div className="sec-head">
                <div>
                  <div className="sec-kicker">Featured</div>
                  <h2>
                    Tonight&apos;s <em>spotlight</em>
                  </h2>
                </div>
              </div>
            </Reveal>
            <Spotlight items={spotlight} onOpen={setOpen} onAdopt={adopt} />
          </section>
        )}

        {/* ============ trending ============ */}
        <section className="section shell" id="trending">
          <Reveal>
            <div className="sec-head">
              <div>
                <div className="sec-kicker">Right now</div>
                <h2>Trending</h2>
              </div>
            </div>
          </Reveal>
          <Wave className="rail">
            {trending.length === 0 ? (
              <RailSkeletons n={6} />
            ) : (
              trending.map((a, i) => (
                <AnimeCard
                  key={a.id}
                  anime={a}
                  index={i + 1}
                  onOpen={setOpen}
                  onHover={adopt}
                />
              ))
            )}
          </Wave>
        </section>

        {/* ============ genre rails ============ */}
        {rails.map((r) => (
          <section className="section shell" key={r.genre} id={`g-${r.genre}`}>
            <Reveal>
              <div className="sec-head">
                <div>
                  <div className="sec-kicker">By mood</div>
                  <h2>{r.genre}</h2>
                </div>
                <button
                  className="sec-link"
                  onClick={() => {
                    apply({ ...f, genre: r.genre });
                    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See all
                </button>
              </div>
            </Reveal>
            <Wave className="rail">
              {r.items.map((a) => (
                <AnimeCard key={a.id} anime={a} onOpen={setOpen} onHover={adopt} />
              ))}
            </Wave>
          </section>
        ))}

        {/* ============ explore ============ */}
        <section className="section shell" id="explore">
          <Reveal>
            <div className="sec-head">
              <div>
                <div className="sec-kicker">The whole catalogue</div>
                <h2>
                  Explore{f.genre ? <> · <em>{f.genre}</em></> : ""}
                </h2>
              </div>
              {f.genre && (
                <button className="sec-link" onClick={() => apply({ ...f, genre: "" })}>
                  Clear
                </button>
              )}
            </div>
          </Reveal>

          <Reveal>
            <div className="hero-moods" style={{ marginTop: 0, marginBottom: 22 }}>
              {RAIL_SORTS.map((s) => (
                <button
                  key={s.v}
                  className={eSort === s.v ? "mood on" : "mood"}
                  onClick={() => setESort(s.v)}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </Reveal>

          <Wave className="grid">
            {eFirst ? (
              <Skeletons n={12} />
            ) : (
              eItems.map((a, i) => (
                <AnimeCard
                  key={a.id}
                  anime={a}
                  index={i + 1}
                  onOpen={setOpen}
                  onHover={adopt}
                />
              ))
            )}
          </Wave>

          {eBusy && (
            <Wave className="grid">
              <Skeletons n={6} />
            </Wave>
          )}
          {!eFirst && eItems.length === 0 && <p className="empty">Nothing here yet.</p>}
          {!eMore && eItems.length > 0 && <p className="endmark">end of catalogue</p>}
          <div ref={eSentinel} className="sentinel" />
        </section>

        <footer className="section shell" style={{ paddingBottom: 64 }}>
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="sec-kicker">Kitsune</div>
              <h2 style={{ fontSize: "1rem", fontFamily: "var(--font-body)", color: "var(--bone-mute)" }}>
                Data from AniList &amp; MyAnimeList. Built for finding something good.
              </h2>
            </div>
            <a className="sec-link" href="#top">
              Back to top <ArrowUp size={12} />
            </a>
          </div>
        </footer>
      </main>

      {/* ============ mobile tabs ============ */}
      <nav className="tabbar" aria-label="Sections">
        <a className={active === "top" ? "tab on" : "tab"} href="#top">
          <Search size={19} />
          <span>Search</span>
        </a>
        <a className={active === "spotlight" ? "tab on" : "tab"} href="#spotlight">
          <Spark size={19} />
          <span>Spotlight</span>
        </a>
        <a className={active === "trending" ? "tab on" : "tab"} href="#trending">
          <Compass size={19} />
          <span>Trending</span>
        </a>
        <a className={active === "explore" ? "tab on" : "tab"} href="#explore">
          <Sliders size={19} />
          <span>Explore</span>
        </a>
      </nav>

      {/* ============ filter sheet ============ */}
      <AnimatePresence>
        {sheet && (
          <m.div
            className="sheet-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && setSheet(false)}
          >
            <Sheet
              initial={f}
              genres={genreList}
              onApply={apply}
              onClose={() => setSheet(false)}
            />
          </m.div>
        )}
      </AnimatePresence>

      <Detail anime={open} onClose={() => setOpen(null)} onAdopt={adopt} />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Skeletons({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div className="sk" key={i}>
          <div className="sk-img sk-shim" />
          <div className="sk-line sk-shim" />
          <div className="sk-line sk-shim" style={{ width: "58%" }} />
        </div>
      ))}
    </>
  );
}

function RailSkeletons({ n }: { n: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div className="sk" key={i} style={{ width: 176 }}>
          <div className="sk-img sk-shim" />
          <div className="sk-line sk-shim" />
        </div>
      ))}
    </>
  );
}

function Sheet({
  initial,
  genres,
  onApply,
  onClose,
}: {
  initial: Filters;
  genres: string[];
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<Filters>(initial);
  return (
    <m.div
      className="sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 44, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
    >
      <div className="sheet-grip" aria-hidden="true" />
      <div className="sheet-head">
        <h3>Refine</h3>
        <button className="sec-link" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="sheet-label">Genre</p>
      <div className="chips scroll">
        <button className={!d.genre ? "chip on" : "chip"} onClick={() => setD({ ...d, genre: "" })}>
          Any
        </button>
        {genres.map((g) => (
          <button
            key={g}
            className={d.genre === g ? "chip on" : "chip"}
            onClick={() => setD({ ...d, genre: d.genre === g ? "" : g })}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="sheet-label">Format</p>
      <div className="chips">
        <button className={!d.format ? "chip on" : "chip"} onClick={() => setD({ ...d, format: "" })}>
          Any
        </button>
        {FORMATS.map((x) => (
          <button
            key={x}
            className={d.format === x ? "chip on" : "chip"}
            onClick={() => setD({ ...d, format: d.format === x ? "" : x })}
          >
            {x}
          </button>
        ))}
      </div>

      <p className="sheet-label">Sort by</p>
      <div className="chips">
        {SORTS.map((s) => (
          <button
            key={s.v}
            className={d.sort === s.v ? "chip on" : "chip"}
            onClick={() => setD({ ...d, sort: s.v })}
          >
            {s.l}
          </button>
        ))}
      </div>

      <p className="sheet-label">Year</p>
      <input
        className="year"
        type="number"
        inputMode="numeric"
        min={1970}
        max={2030}
        placeholder="Any year, e.g. 2024"
        value={d.year}
        onChange={(e) =>
          setD({ ...d, year: e.target.value.replace(/\D/g, "").slice(0, 4) })
        }
      />

      <div className="sheet-foot">
        <button className="btn btn-line" onClick={() => setD(EMPTY)}>
          Reset
        </button>
        <button
          className="btn btn-solid"
          onClick={() => {
            const y = Number(d.year);
            onApply({ ...d, year: y >= 1970 && y <= 2030 ? d.year : "" });
          }}
        >
          Show results
        </button>
      </div>
    </m.div>
  );
}
