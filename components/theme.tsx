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
 * One registered custom property (`--hue`) drives every accent, so the whole
 * page retints as a single animated unit. The hue comes from what the reader
 * is looking at — a title's genres, then a stable nudge from its id — so
 * browsing feels like each series brings its own colour. There is no random
 * palette and no fixed "brand gradient"; the interface borrows the colour of
 * the content.
 *
 * The reader can pin a hue from the nav dial; that choice is remembered and
 * survives reloads. `release()` hands control back to the content.
 */

// Genre → base hue, arranged so neighbouring moods sit near each other and the
// warm end of the wheel stays dominant (the canvas is warm ink).
const GENRE_HUE: Record<string, number> = {
  Action: 6,
  Adventure: 30,
  Comedy: 46,
  Drama: 342,
  Ecchi: 318,
  Fantasy: 266,
  Horror: 288,
  "Mahou Shoujo": 310,
  Mecha: 204,
  Music: 226,
  Mystery: 248,
  Psychological: 256,
  Romance: 334,
  "Sci-Fi": 184,
  "Slice of Life": 94,
  Sports: 130,
  Supernatural: 272,
  Thriller: 16,
};

export const BASE_HUE = 36;
const STORE_KEY = "kitsune:hue";

function hash(id: number): number {
  // Small integer hash; stable across reloads, spreads similar ids apart.
  let h = id * 2654435761;
  h ^= h >>> 15;
  return Math.abs(h);
}

/** Deterministic hue for a title: genre first, then a stable per-id nudge. */
export function hueFor(anime: Anime | null | undefined): number {
  if (!anime) return BASE_HUE;
  const g = anime.genres.find((x) => x in GENRE_HUE);
  const base = g ? GENRE_HUE[g] : BASE_HUE;
  const nudge = (hash(anime.id) % 19) - 9;
  return (((base + nudge) % 360) + 360) % 360;
}

interface ThemeCtx {
  hue: number;
  /** True while the content is choosing the colour. */
  auto: boolean;
  setHue: (h: number) => void;
  adopt: (anime: Anime | null | undefined) => void;
  release: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hue, setHueState] = useState(BASE_HUE);
  const [auto, setAuto] = useState(true);

  // Restore a pinned hue before first paint of the accent.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved != null) {
        const n = Number(saved);
        if (Number.isFinite(n)) {
          setHueState(((n % 360) + 360) % 360);
          setAuto(false);
        }
      }
    } catch {
      /* storage unavailable — stay on the content-driven default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--hue", String(hue));
  }, [hue]);

  const setHue = useCallback((h: number) => {
    const n = ((h % 360) + 360) % 360;
    setAuto(false);
    setHueState(n);
    try {
      localStorage.setItem(STORE_KEY, String(n));
    } catch {
      /* ignore */
    }
  }, []);

  const adopt = useCallback(
    (anime: Anime | null | undefined) => {
      if (!auto) return; // a pinned hue wins until released
      setHueState(hueFor(anime));
    },
    [auto]
  );

  const release = useCallback(() => {
    setAuto(true);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ hue, auto, setHue, adopt, release }),
    [hue, auto, setHue, adopt, release]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}
