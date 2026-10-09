"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Anime } from "@/lib/types";

/**
 * Dynamic theme engine.
 *
 * One CSS custom property (`--hue`, registered via `@property`) drives every
 * accent in the interface, so the whole page retints as one animated unit.
 * The hue is chosen deterministically from the thing you are looking at — a
 * title's genres, then its id — so browsing feels like each series brings its
 * own colour, without ever using a random or "trust gradient" palette.
 *
 * The reader can also drive it directly from the nav dial; that manual choice
 * then pins the theme until they release it back to auto.
 */

// Genre → base hue. Chosen so related moods sit near each other and the
// warm end of the wheel (30–90) stays dominant, matching the ink canvas.
const GENRE_HUE: Record<string, number> = {
  Action: 8,
  Adventure: 32,
  Comedy: 48,
  Drama: 340,
  Ecchi: 320,
  Fantasy: 268,
  Horror: 285,
  "Mahou Shoujo": 312,
  Mecha: 200,
  Music: 228,
  Mystery: 250,
  Psychological: 258,
  Romance: 336,
  "Sci-Fi": 186,
  "Slice of Life": 96,
  Sports: 132,
  Supernatural: 274,
  Thriller: 18,
};

export const DEFAULT_HUE = 38;

/** Deterministic hue for a title: genre first, then a stable id nudge. */
export function hueFor(anime: Anime | null | undefined): number {
  if (!anime) return DEFAULT_HUE;
  const g = anime.genres.find((x) => x in GENRE_HUE);
  const base = g ? GENRE_HUE[g] : DEFAULT_HUE;
  // Small stable offset so two same-genre titles still differ slightly.
  const nudge = (hashId(anime.id) % 17) - 8;
  return ((base + nudge) % 360 + 360) % 360;
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

interface ThemeCtx {
  hue: number;
  auto: boolean;
  setHue: (h: number) => void;
  /** Adopt the hue of whatever the reader is focused on. */
  adopt: (anime: Anime | null | undefined) => void;
  /** Return control to the deterministic auto-theme. */
  release: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hue, setHueState] = useState(DEFAULT_HUE);
  const [auto, setAuto] = useState(true);

  // Push the hue onto <html> so every --accent derives from one property.
  useEffect(() => {
    document.documentElement.style.setProperty("--hue", String(hue));
  }, [hue]);

  const setHue = useCallback((h: number) => {
    setAuto(false);
    setHueState(((h % 360) + 360) % 360);
  }, []);

  const adopt = useCallback(
    (anime: Anime | null | undefined) => {
      if (!auto) return; // a manual choice wins until released
      setHueState(hueFor(anime));
    },
    [auto]
  );

  const release = useCallback(() => setAuto(true), []);

  const value = useMemo(
    () => ({ hue, auto, setHue, adopt, release }),
    [hue, auto, setHue, adopt, release]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
}
