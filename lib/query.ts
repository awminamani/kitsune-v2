// URL <-> BrowseQuery translation, with validation.
//
// The API is the trust boundary: anything arriving from the network is parsed
// and clamped here so the AniList layer only ever receives known-good values.

import type {
  BrowseQuery,
  MediaFormat,
  MediaStatus,
  Season,
  SortKey,
} from "./types";

const FORMATS: MediaFormat[] = ["TV", "MOVIE", "OVA", "ONA", "SPECIAL", "MUSIC"];
const STATUSES: MediaStatus[] = [
  "RELEASING",
  "FINISHED",
  "NOT_YET_RELEASED",
  "CANCELLED",
  "HIATUS",
];
const SEASONS: Season[] = ["WINTER", "SPRING", "SUMMER", "FALL"];
const SORTS: SortKey[] = [
  "POPULARITY",
  "SCORE",
  "TRENDING",
  "FAVOURITES",
  "NEWEST",
  "TITLE",
];

export const FORMAT_OPTIONS = FORMATS;
export const STATUS_OPTIONS = STATUSES;
export const SEASON_OPTIONS = SEASONS;
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "POPULARITY", label: "Most watched" },
  { key: "SCORE", label: "Highest rated" },
  { key: "TRENDING", label: "Rising now" },
  { key: "FAVOURITES", label: "Most loved" },
  { key: "NEWEST", label: "Newest" },
  { key: "TITLE", label: "A–Z" },
];

const oneOf = <T extends string>(list: T[], v: string | null): T | undefined =>
  v && (list as string[]).includes(v) ? (v as T) : undefined;

const int = (v: string | null, min: number, max: number): number | undefined => {
  if (!v) return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

/** Reads a BrowseQuery out of request search params. Never throws. */
export function parseQuery(params: URLSearchParams): BrowseQuery {
  const q: BrowseQuery = {
    page: int(params.get("page"), 1, 500),
    perPage: int(params.get("perPage"), 1, 50),
    genre: params.get("genre")?.trim() || undefined,
    format: oneOf(FORMATS, params.get("format")),
    status: oneOf(STATUSES, params.get("status")),
    season: oneOf(SEASONS, params.get("season")),
    year: int(params.get("year"), 1940, 2100),
    sort: oneOf(SORTS, params.get("sort")),
  };

  const search = params.get("q")?.trim();
  // Two characters is the shortest query worth a round trip; below that the
  // result set is noise and the reader is still typing.
  if (search && search.length >= 2) q.search = search.slice(0, 120);

  return q;
}
