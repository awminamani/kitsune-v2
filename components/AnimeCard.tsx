"use client";

import { m, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Anime } from "@/lib/types";
import { meta, score } from "./format";
import { Play, Star } from "./icons";
import { SPRING_SNAP, waveItem } from "./motion";

/**
 * Poster card. The entrance is a wave child (the grid/rail drives it), and
 * hovering adopts the title's own hue into the page theme — so moving across
 * the shelf retints the interface. Hover lift is a spring (position), and
 * reduced-motion readers get no lift and no theme chasing.
 */
export default function AnimeCard({
  anime,
  index,
  onOpen,
  onHover,
}: {
  anime: Anime;
  index?: number;
  onOpen: (a: Anime) => void;
  onHover?: (a: Anime) => void;
}) {
  const [src, setSrc] = useState(anime.cover);
  const reduce = useReducedMotion();

  return (
    <m.button
      type="button"
      className="card"
      variants={waveItem}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={SPRING_SNAP}
      onClick={() => onOpen(anime)}
      onPointerEnter={reduce ? undefined : () => onHover?.(anime)}
      onFocus={reduce ? undefined : () => onHover?.(anime)}
      aria-label={anime.title}
    >
      <div className="card-img">
        {index != null && <span className="card-index">{index}</span>}
        {anime.score != null && (
          <span className="card-score">
            <Star />
            {score(anime)}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src || "/placeholder.svg"}
          alt=""
          loading="lazy"
          onError={() => setSrc("/placeholder.svg")}
        />
        <span className="card-veil" aria-hidden="true" />
        <span className="card-cue">
          <Play size={13} /> Details{anime.trailerYoutubeId ? " · trailer" : ""}
        </span>
      </div>
      <div className="card-body">
        <h3>{anime.title}</h3>
        <p>{meta(anime)}</p>
      </div>
    </m.button>
  );
}
