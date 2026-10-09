"use client";

import { m } from "framer-motion";
import type { Anime } from "@/lib/types";
import AnimeCard from "./AnimeCard";
import { wave, VIEWPORT } from "./motion";
import { rise } from "./motion";

/** Wave container: children carrying `waveItem` arrive staggered. */
export function Wave({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={wave}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  );
}

/** Single block that rises into view. */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <m.div
      className={className}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </m.div>
  );
}

/** A responsive grid of poster cards. */
export function CardGrid({
  items,
  onAdopt,
  priorityCount = 0,
}: {
  items: Anime[];
  onAdopt?: (a: Anime) => void;
  priorityCount?: number;
}) {
  return (
    <Wave className="grid">
      {items.map((a, i) => (
        <AnimeCard
          key={a.id}
          anime={a}
          index={i + 1}
          onAdopt={onAdopt}
          priority={i < priorityCount}
        />
      ))}
    </Wave>
  );
}

/** A horizontal rail of poster cards. */
export function CardRail({
  items,
  onAdopt,
}: {
  items: Anime[];
  onAdopt?: (a: Anime) => void;
}) {
  return (
    <Wave className="rail">
      {items.map((a) => (
        <AnimeCard key={a.id} anime={a} onAdopt={onAdopt} />
      ))}
    </Wave>
  );
}

/** Placeholder cards shaped exactly like the real ones. */
export function CardSkeletons({ count, rail = false }: { count: number; rail?: boolean }) {
  const items = Array.from({ length: count }).map((_, i) => (
    <div className="sk" key={i} style={rail ? { width: 178 } : undefined}>
      <div className="sk-art sk-shim" />
      <div className="sk-line sk-shim" />
      <div className="sk-line sk-shim" style={{ width: "56%" }} />
    </div>
  ));
  return rail ? <div className="rail">{items}</div> : <div className="grid">{items}</div>;
}
