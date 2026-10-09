"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import type { Anime } from "@/lib/types";
import { meta, score } from "./format";
import { Play, Star } from "./icons";
import { DUR, EASE, SPRING } from "./motion";

/**
 * Detail dialog. Opening it adopts the title's hue, so the reader's whole view
 * settles into that series' colour. Esc / backdrop / close all dismiss.
 */
export default function Detail({
  anime,
  onClose,
  onAdopt,
}: {
  anime: Anime | null;
  onClose: () => void;
  onAdopt: (a: Anime) => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (anime) onAdopt(anime);
  }, [anime, onAdopt]);

  useEffect(() => {
    if (!anime) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [anime, onClose]);

  const trailer = anime?.trailerYoutubeId
    ? `https://www.youtube-nocookie.com/embed/${anime.trailerYoutubeId}?rel=0&autoplay=1`
    : null;

  return (
    <AnimatePresence>
      {anime && (
        <m.div
          className="scrim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.enter, ease: EASE }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <m.div
            className="detail"
            role="dialog"
            aria-modal="true"
            aria-label={anime.title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={reduce ? { duration: DUR.confirm } : SPRING}
          >
            <button className="detail-close" onClick={onClose} aria-label="Close">
              ✕
            </button>

            <div className="detail-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {anime.banner ? <img src={anime.banner} alt="" /> : null}
            </div>

            <div className="detail-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="detail-poster"
                src={anime.cover || "/placeholder.svg"}
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />

              <div className="detail-info">
                <h3>{anime.title}</h3>
                <div className="detail-meta">
                  {anime.score != null && (
                    <span className="detail-score">
                      <Star size={15} /> {score(anime)}
                    </span>
                  )}
                  {meta(anime) && <span>{meta(anime)}</span>}
                  <span>
                    via {anime.scoreSource === "mal" ? "MyAnimeList" : "AniList"}
                  </span>
                </div>

                {anime.genres.length > 0 && (
                  <div className="tags">
                    {anime.genres.map((g) => (
                      <span key={g} className="tag">
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {anime.synopsis && <p className="detail-desc">{anime.synopsis}</p>}

                <div className="detail-actions">
                  {trailer && (
                    <a
                      className="btn btn-solid"
                      href={`https://www.youtube.com/watch?v=${anime.trailerYoutubeId}`}
                      target="_blank"
                      rel="noopener"
                    >
                      <Play size={14} />
                      Watch on YouTube
                    </a>
                  )}
                  <a
                    className="btn btn-line"
                    href={anime.siteUrl}
                    target="_blank"
                    rel="noopener"
                  >
                    Open on {anime.source === "mal" ? "MyAnimeList" : "AniList"}
                  </a>
                </div>

                {trailer && (
                  <div className="detail-player">
                    <iframe
                      src={trailer}
                      title={`${anime.title} trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
