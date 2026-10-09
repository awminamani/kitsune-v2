// Presentation helpers shared by every surface.

import type { Anime, MediaFormat, MediaStatus, Season } from "./types";

/** "87" for AniList's 0–100 scale, "8.7" for MAL's 0–10. */
export function scoreText(a: Anime): string {
  if (a.score == null) return "—";
  return a.scoreOrigin === "mal"
    ? a.score.toFixed(2).replace(/\.?0+$/, "")
    : String(Math.round(a.score));
}

/** "2024 · 24 ep · 24m" — only the parts that exist. */
export function metaLine(a: Anime): string {
  const parts: string[] = [];
  if (a.year) parts.push(String(a.year));
  if (a.episodes) parts.push(`${a.episodes} ep`);
  if (a.duration) parts.push(`${a.duration}m`);
  return parts.join(" · ");
}

export function formatLabel(f: MediaFormat | null): string | null {
  if (!f) return null;
  return f === "TV" ? "TV series" : f.charAt(0) + f.slice(1).toLowerCase();
}

export function statusLabel(s: MediaStatus | null): string | null {
  switch (s) {
    case "RELEASING":
      return "Airing";
    case "FINISHED":
      return "Finished";
    case "NOT_YET_RELEASED":
      return "Upcoming";
    case "CANCELLED":
      return "Cancelled";
    case "HIATUS":
      return "On hiatus";
    default:
      return null;
  }
}

export function seasonLabel(s: Season | null, year: number | null): string | null {
  if (!s) return year ? String(year) : null;
  const name = s.charAt(0) + s.slice(1).toLowerCase();
  return year ? `${name} ${year}` : name;
}

/** Compact counts: 128400 -> "128k". */
export function compact(n: number | null): string {
  if (n == null) return "—";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
