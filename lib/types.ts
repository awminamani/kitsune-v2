// Domain model.
// Deliberately narrow: only what the interface actually renders. Adapters in
// `lib/anilist` are responsible for translating the upstream shape into this.

export type MediaFormat = "TV" | "MOVIE" | "OVA" | "ONA" | "SPECIAL" | "MUSIC";
export type MediaStatus = "RELEASING" | "FINISHED" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
export type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

/** Where a score came from, because the two scales are not comparable. */
export type ScoreOrigin = "anilist" | "mal";

export interface Title {
  id: number;
  /** Preferred display title. */
  display: string;
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface Artwork {
  cover: string;
  coverColor: string | null;
  banner: string | null;
}

export interface Anime {
  id: number;
  title: Title;
  art: Artwork;
  /** 0–100 when `scoreOrigin` is "anilist". */
  score: number | null;
  scoreOrigin: ScoreOrigin;
  popularity: number | null;
  favourites: number | null;
  episodes: number | null;
  duration: number | null;
  year: number | null;
  season: Season | null;
  format: MediaFormat | null;
  status: MediaStatus | null;
  genres: string[];
  /** Plain text — upstream HTML is stripped at the adapter boundary. */
  synopsis: string;
  trailerId: string | null;
  siteUrl: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  /** Total matches when the upstream reports one. */
  total: number | null;
}

/** What a browse request can ask for. Every field is optional. */
export interface BrowseQuery {
  page?: number;
  perPage?: number;
  genre?: string;
  format?: MediaFormat;
  status?: MediaStatus;
  season?: Season;
  year?: number;
  search?: string;
  sort?: SortKey;
}

export type SortKey =
  | "POPULARITY"
  | "SCORE"
  | "TRENDING"
  | "FAVOURITES"
  | "NEWEST"
  | "TITLE";
