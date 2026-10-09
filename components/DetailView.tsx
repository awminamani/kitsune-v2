"use client";

import Link from "next/link";
import type { Anime } from "@/lib/types";
import { compact, formatLabel, metaLine, scoreText, seasonLabel, statusLabel } from "@/lib/format";
import { CardRail, Reveal } from "./CardGrid";
import { Play, Star } from "./icons";

export default function DetailView({
  anime,
  related,
}: {
  anime: Anime;
  related: Anime[];
}) {
  const trailer = anime.trailerId
    ? `https://www.youtube-nocookie.com/embed/${anime.trailerId}?rel=0&autoplay=1`
    : null;

  const facts = [
    formatLabel(anime.format),
    statusLabel(anime.status),
    seasonLabel(anime.season, anime.year),
    anime.episodes ? `${anime.episodes} episodes` : null,
    anime.duration ? `${anime.duration} min` : null,
  ].filter((x): x is string => !!x);

  return (
    <main>
      <section className="detail-hero">
        {anime.art.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={anime.art.banner} alt="" />
        )}
        <Link className="back" href="/browse">← Browse</Link>
      </section>

      <div className="shell detail-wrap">
        <div className="detail-grid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="detail-poster"
            src={anime.art.cover || "/placeholder.svg"}
            alt=""
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />

          <div className="detail-main">
            <h1>{anime.title.display}</h1>
            {(anime.title.romaji || anime.title.native) && (
              <p className="detail-alt">
                {[anime.title.romaji, anime.title.native].filter((x): x is string => !!x).join(" · ")}
              </p>
            )}

            {facts.length > 0 && (
              <div className="detail-facts">
                {facts.map((f, i) => (
                  <span key={f} className={i === 0 ? "fact fact-hot" : "fact"}>{f}</span>
                ))}
              </div>
            )}

            <div className="detail-scores">
              <div>
                <div className="detail-score-n">{scoreText(anime)}<em> / 100</em></div>
                <div className="detail-score-l">Rating</div>
              </div>
              <div>
                <div className="detail-score-n">{compact(anime.popularity)}</div>
                <div className="detail-score-l">Members</div>
              </div>
              <div>
                <div className="detail-score-n">{compact(anime.favourites)}</div>
                <div className="detail-score-l">Favourites</div>
              </div>
            </div>

            {anime.genres.length > 0 && (
              <div className="detail-facts" style={{ marginBottom: 22 }}>
                {anime.genres.map((g) => (
                  <Link key={g} className="fact" href={`/browse?genre=${encodeURIComponent(g)}`}>{g}</Link>
                ))}
              </div>
            )}

            {anime.synopsis && <p className="detail-synopsis">{anime.synopsis}</p>}

            <div className="detail-actions">
              {anime.trailerId && (
                <a className="btn btn-solid" href={`https://www.youtube.com/watch?v=${anime.trailerId}`} target="_blank" rel="noopener noreferrer">
                  <Play size={14} /> Watch trailer
                </a>
              )}
              <a className="btn btn-line" href={anime.siteUrl} target="_blank" rel="noopener noreferrer">
                View on AniList
              </a>
            </div>

            {trailer && (
              <div className="detail-player">
                <iframe src={trailer} title={`${anime.title.display} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="section" style={{ paddingTop: 60 }}>
            <Reveal>
              <div className="sec-head">
                <div><div className="sec-kicker">More like this</div><h2>{anime.genres[0]}</h2></div>
                <Link className="sec-link" href={`/browse?genre=${encodeURIComponent(anime.genres[0])}`}>See all</Link>
              </div>
            </Reveal>
            <CardRail items={related} />
          </section>
        )}

        <div className="foot" style={{ marginTop: 64 }}>
          <span><Star size={11} /> {metaLine(anime) || "—"}</span>
          <Link href="/browse">Back to browse</Link>
        </div>
      </div>
    </main>
  );
}
