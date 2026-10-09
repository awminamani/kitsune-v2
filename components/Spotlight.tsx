"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Anime } from "@/lib/types";
import { meta, score } from "./format";
import { Play, Star } from "./icons";
import { EASE } from "./motion";

/**
 * Cinematic spotlight. The active title's hue is adopted into the page theme
 * and crossfades with the artwork, so the whole interface shifts as the reel
 * advances. Reduced-motion readers get a static crossfade only.
 */
export default function Spotlight({
  items,
  onOpen,
  onAdopt,
}: {
  items: Anime[];
  onOpen: (a: Anime) => void;
  onAdopt: (a: Anime) => void;
}) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  // Advance the reel on a slow timer; stop when the reader is interacting.
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (items.length < 2 || held) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [items.length, held]);

  useEffect(() => {
    if (items[i]) onAdopt(items[i]);
  }, [i, items, onAdopt]);

  if (items.length === 0) return null;
  const a = items[i];

  return (
    <div
      className="spot"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      <div className="spot-stage">
        <div className="spot-bg" aria-hidden="true">
          {items.map((it, n) => (
            <m.div
              key={it.id}
              className="spot-bg"
              style={{ position: "absolute", inset: 0 }}
              initial={false}
              animate={{ opacity: n === i ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.banner || it.cover} alt="" />
            </m.div>
          ))}
        </div>
        <div className="spot-scrim" aria-hidden="true" />

        <m.div
          key={a.id}
          className="spot-copy"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: EASE }}
        >
          <span className="spot-tag">Spotlight</span>
          <h3>{a.title}</h3>
          <div className="spot-meta">
            {a.score != null && (
              <span className="spot-score">
                <Star size={14} /> {score(a)}
              </span>
            )}
            {meta(a) && <span>{meta(a)}</span>}
          </div>
          {a.synopsis && <p className="spot-desc">{a.synopsis}</p>}
          <button className="btn btn-solid" onClick={() => onOpen(a)}>
            <Play size={14} />
            {a.trailerYoutubeId ? "Watch the trailer" : "See details"}
          </button>
        </m.div>

        <div className="spot-thumbs" role="tablist" aria-label="Spotlight titles">
          {items.map((it, n) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={n === i}
              className={n === i ? "spot-thumb on" : "spot-thumb"}
              onClick={() => setI(n)}
              aria-label={it.title}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.cover} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
