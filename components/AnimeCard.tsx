"use client";

import { m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Anime } from "@/lib/types";
import { formatLabel, metaLine, scoreText } from "@/lib/format";
import { Play, Star } from "./icons";
import { SPRING_SNAP, waveItem } from "./motion";

/**
 * Poster card. A real link to /anime/[id], so results are shareable and
 * middle-clickable. Hover adopts the title's hue into the page theme, lifts on
 * a spring, and bleeds the artwork's own colour behind the poster.
 */
export default function AnimeCard({
  anime,
  index,
  onAdopt,
  priority = false,
}: {
  anime: Anime;
  index?: number;
  onAdopt?: (a: Anime) => void;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();

  const kind = formatLabel(anime.format);
  const meta = metaLine(anime);

  return (
    <m.article
      className="card"
      variants={waveItem}
      whileHover={reduce ? undefined : { y: -7 }}
      transition={SPRING_SNAP}
      onPointerEnter={reduce ? undefined : () => onAdopt?.(anime)}
      onFocus={reduce ? undefined : () => onAdopt?.(anime)}
    >
      <a
        href={`/anime/${anime.id}`}
        className="card-link"
        aria-label={`${anime.title.display}${kind ? ` — ${kind}` : ""}`}
      >
        <div className="card-art">
          {anime.art.coverColor && (
            <span
              className="card-glow"
              aria-hidden="true"
              style={{ background: anime.art.coverColor }}
            />
          )}

          {index != null && <span className="card-num">{index}</span>}

          {anime.score != null && (
            <span className="card-score">
              <Star size={10} />
              {scoreText(anime)}
            </span>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={failed ? "/placeholder.svg" : anime.art.cover || "/placeholder.svg"}
            alt=""
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />

          <span className="card-veil" aria-hidden="true" />

          <span className="card-reveal">
            <span className="card-reveal-row">
              {kind && <span className="card-kind">{kind}</span>}
              {meta && <span className="card-meta">{meta}</span>}
            </span>
            <span className="card-cta">
              <Play size={12} />
              {anime.trailerId ? "Details & trailer" : "See details"}
            </span>
          </span>
        </div>

        <div className="card-text">
          <h3>{anime.title.display}</h3>
          {anime.title.romaji && anime.title.english && (
            <p className="card-alt">{anime.title.romaji}</p>
          )}
        </div>
      </a>
    </m.article>
  );
}
