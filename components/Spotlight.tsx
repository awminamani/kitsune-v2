"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Anime } from "@/lib/types";
import { metaLine, scoreText } from "@/lib/format";
import { Play, Star } from "./icons";
import { EASE } from "./motion";

export default function Spotlight({ items }: { items: Anime[] }) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (items.length < 2 || held || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 9000);
    return () => clearInterval(t);
  }, [items.length, held, reduce]);

  const active = items[i];
  if (!active) return null;

  return (
    <div className="spot" onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)}>
      <div className="spot-stage">
        <div aria-hidden="true">
          {items.map((it, n) => (
            <m.div
              key={it.id}
              className="spot-layer"
              initial={false}
              animate={{ opacity: n === i ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.95, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.art.banner || it.art.cover} alt="" />
            </m.div>
          ))}
        </div>
        <div className="spot-scrim" aria-hidden="true" />
        <m.div
          key={active.id}
          className="spot-copy"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, ease: EASE }}
        >
          <span className="spot-tag">Spotlight</span>
          <h3>{active.title.display}</h3>
          <div className="spot-meta">
            {active.score != null && (
              <span className="spot-score"><Star size={14} /> {scoreText(active)}</span>
            )}
            {metaLine(active) && <span>{metaLine(active)}</span>}
            {active.genres.length > 0 && <span>{active.genres.slice(0, 2).join(" · ")}</span>}
          </div>
          {active.synopsis && <p className="spot-desc">{active.synopsis}</p>}
          <a className="btn btn-solid" href={`/anime/${active.id}`}>
            <Play size={14} />
            {active.trailerId ? "Watch the trailer" : "See details"}
          </a>
        </m.div>
        <div className="spot-thumbs" role="tablist" aria-label="Spotlight titles">
          {items.map((it, n) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={n === i}
              className={n === i ? "spot-thumb on" : "spot-thumb"}
              onClick={() => setI(n)}
              aria-label={it.title.display}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.art.cover} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
