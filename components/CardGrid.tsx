"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { rise, wave, VIEWPORT, waveItem } from "./motion";

export function Wave({
  children,
  className,
}: {
  children: ReactNode;
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

export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
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

export function CardGrid({
  items,
  priorityCount = 0,
}: {
  items: import("@/lib/types").Anime[];
  priorityCount?: number;
}) {
  return (
    <Wave className="grid">
      {items.map((a, i) => (
        <AnimeCard key={a.id} anime={a} index={i + 1} priority={i < priorityCount} />
      ))}
    </Wave>
  );
}

export function CardRail({ items }: { items: import("@/lib/types").Anime[] }) {
  return (
    <Wave className="rail">
      {items.map((a, i) => (
        <AnimeCard key={a.id} anime={a} index={i + 1} />
      ))}
    </Wave>
  );
}

import AnimeCard from "./AnimeCard";

export function CardSkeletons({
  count,
  rail = false,
}: {
  count: number;
  rail?: boolean;
}) {
  const items = Array.from({ length: count }).map((_, i) => (
    <div className="sk" key={i} style={rail ? { width: 172 } : undefined}>
      <div className="sk-art sk-shim" />
      <div className="sk-line sk-shim" />
      <div className="sk-line sk-shim" style={{ width: "56%" }} />
    </div>
  ));
  return rail ? <div className="rail">{items}</div> : <div className="grid">{items}</div>;
}
