"use client";

import { m, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Anime } from "@/lib/types";
import { useTheme } from "./theme";
import Spotlight from "./Spotlight";
import { CardRail, CardSkeletons, Reveal, Wave } from "./CardGrid";
import { Search, Sliders } from "./icons";
import { SORT_OPTIONS } from "@/lib/query";

const MOODS = ["Action", "Romance", "Fantasy", "Thriller", "Comedy", "Horror", "Sci-Fi", "Drama"];

/**
 * Home.
 *
 * A single editorial column: hero with a ruled search, then the spotlight
 * reel, trending rail, and genre rails. The hero backdrop drifts on scroll
 * (the one place motion genuinely maps to "moving through space").
 */
export default function HomeView({
  reel,
  genres,
  trending,
  rails,
}: {
  reel: Anime[];
  genres: string[];
  trending: Anime[];
  rails: { genre: string; items: Anime[] }[];
}) {
  const { adopt } = useTheme();
  const router = useRouter();

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "17%"]);
  const artFade = useTransform(scrollYProgress, [0, 0.9], [1, 0.08]);
  const innerY = useTransform(scrollYProgress, [0, 1], ["0%", "-11%"]);
  const innerFade = useTransform(scrollYProgress, [0, 0.78], [1, 0]);

  const [q, setQ] = useState("");
  const [bg, setBg] = useState(0);
  const banners = reel.map((a) => a.art.banner).filter((b): b is string => !!b);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBg((n) => (n + 1) % banners.length), 7000);
    return () => clearInterval(t);
  }, [banners.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term.length >= 2 ? `/browse?q=${encodeURIComponent(term)}` : "/browse");
  };

  const count = trending.length + rails.reduce((n, r) => n + r.items.length, 0);

  return (
    <main>
      {/* ================= hero ================= */}
      <section className="hero" id="top" ref={heroRef}>
        <m.div className="hero-art" style={{ y: artY, opacity: artFade }} aria-hidden="true">
          {banners.map((b, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={b} src={b} alt="" className={i === bg ? "on" : ""} />
          ))}
          <div className="hero-scrim" />
        </m.div>

        <m.div className="hero-inner" style={{ y: innerY, opacity: innerFade }}>
          <span className="eyebrow">Anime discovery</span>
          <h1>
            Find the one you&apos;ll <em>binge</em> next.
          </h1>

          <form className="search" onSubmit={submit}>
            <Search size={20} />
            <input
              type="search"
              placeholder="Search a title…"
              autoComplete="off"
              aria-label="Search anime"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="icon-btn" aria-label="Search">
              <Sliders size={15} />
            </button>
          </form>

          <div className="pills">
            {MOODS.map((g) => (
              <Link key={g} className="pill" href={`/browse?genre=${encodeURIComponent(g)}`}>
                {g}
              </Link>
            ))}
            <Link className="pill pill-dashed" href="/browse">
              Everything
            </Link>
          </div>

          <div className="stats">
            <div>
              <div className="stat-n">{count}</div>
              <div className="stat-l">titles on this page</div>
            </div>
            <div>
              <div className="stat-n">20k+</div>
              <div className="stat-l">searchable</div>
            </div>
            <div>
              <div className="stat-n">{genres.length || 18}</div>
              <div className="stat-l">genres</div>
            </div>
          </div>
        </m.div>
      </section>

      {/* ================= spotlight ================= */}
      {reel.length > 0 && (
        <section className="section shell" id="spotlight">
          <Reveal>
            <div className="sec-head">
              <div>
                <div className="sec-kicker">Featured</div>
                <h2>
                  Tonight&apos;s <em>spotlight</em>
                </h2>
              </div>
              <Link className="sec-link" href="/browse?sort=SCORE">
                Highest rated
              </Link>
            </div>
          </Reveal>
          <Spotlight items={reel} onAdopt={adopt} />
        </section>
      )}

      {/* ================= trending ================= */}
      <section className="section shell" id="trending">
        <Reveal>
          <div className="sec-head">
            <div>
              <div className="sec-kicker">Right now</div>
              <h2>Trending</h2>
            </div>
            <Link className="sec-link" href="/browse?sort=TRENDING">
              See all
            </Link>
          </div>
        </Reveal>
        {trending.length === 0 ? (
          <CardSkeletons count={6} rail />
        ) : (
          <CardRail items={trending} onAdopt={adopt} />
        )}
      </section>

      {/* ================= genre rails ================= */}
      {rails.map((r) => (
        <section className="section shell" key={r.genre} id={`g-${r.genre}`}>
          <Reveal>
            <div className="sec-head">
              <div>
                <div className="sec-kicker">By mood</div>
                <h2>{r.genre}</h2>
              </div>
              <Link className="sec-link" href={`/browse?genre=${encodeURIComponent(r.genre)}`}>
                See all
              </Link>
            </div>
          </Reveal>
          <CardRail items={r.items} onAdopt={adopt} />
        </section>
      ))}

      {/* ================= sorts ================= */}
      <section className="section shell">
        <Reveal>
          <div className="sec-head">
            <div>
              <div className="sec-kicker">Ways in</div>
              <h2>
                Start <em>somewhere</em>
              </h2>
            </div>
          </div>
        </Reveal>
        <Wave className="pills">
          {SORT_OPTIONS.map((s) => (
            <Link key={s.key} className="pill" href={`/browse?sort=${s.key}`}>
              {s.label}
            </Link>
          ))}
        </Wave>
      </section>
    </main>
  );
}
