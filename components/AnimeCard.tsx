"use client";

import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { Anime } from "@/lib/types";
import { formatLabel, metaLine, scoreText } from "@/lib/format";
import { Play, Star } from "./icons";
import { SPRING_SNAP, waveItem } from "./motion";

export default function AnimeCard({
  anime,
  index,
  priority = false,
}: {
  anime: Anime;
  index?: number;
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
      whileHover={reduce ? undefined : { y: -6 }}
      transition={SPRING_SNAP}
    >
      <Link
        href={`/anime/${anime.id}`}
        className="card-link"
        aria-label={`${anime.title.display}${kind ? ` — ${kind}` : ""}`}
      >
        <div className="card-art">
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
      </Link>
    </m.article>
  );
}
