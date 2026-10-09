// AniList GraphQL access layer.
//
// One place knows the GraphQL dialect; everything else speaks the domain model
// in `types.ts`. Requests are built from a declarative argument list so we
// never send `null` for a filter (AniList reads an explicit null filter as
// "match nothing", which silently empties a page).

import type {
  Anime,
  BrowseQuery,
  MediaFormat,
  MediaStatus,
  Page,
  Season,
  SortKey,
} from "./types";

const ENDPOINT = "https://graphql.anilist.co";

/** Sort keys → AniList's MediaSort enum values. */
const SORT: Record<SortKey, string[]> = {
  POPULARITY: ["POPULARITY_DESC"],
  SCORE: ["SCORE_DESC"],
  TRENDING: ["TRENDING_DESC"],
  FAVOURITES: ["FAVOURITES_DESC"],
  NEWEST: ["START_DATE_DESC"],
  TITLE: ["TITLE_ROMAJI"],
};

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  averageScore
  meanScore
  popularity
  favourites
  episodes
  duration
  seasonYear
  season
  format
  status
  genres
  description(asHtml: false)
  trailer { id site }
  siteUrl
`;

interface RawMedia {
  id: number;
  title?: { romaji?: string; english?: string; native?: string };
  coverImage?: { extraLarge?: string; large?: string; color?: string };
  bannerImage?: string;
  averageScore?: number;
  meanScore?: number;
  popularity?: number;
  favourites?: number;
  episodes?: number;
  duration?: number;
  seasonYear?: number;
  season?: string;
  format?: string;
  status?: string;
  genres?: string[];
  description?: string;
  trailer?: { id?: string; site?: string };
  siteUrl?: string;
}

/** Strip the small amount of HTML AniList leaves in descriptions. */
function plain(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

function toAnime(m: RawMedia): Anime {
  const romaji = m.title?.romaji ?? "";
  const english = m.title?.english ?? null;
  return {
    id: m.id,
    title: {
      id: m.id,
      display: english || romaji || "Untitled",
      romaji,
      english,
      native: m.title?.native ?? null,
    },
    art: {
      cover: m.coverImage?.extraLarge || m.coverImage?.large || "",
      coverColor: m.coverImage?.color ?? null,
      banner: m.bannerImage ?? null,
    },
    score: m.averageScore ?? m.meanScore ?? null,
    scoreOrigin: "anilist",
    popularity: m.popularity ?? null,
    favourites: m.favourites ?? null,
    episodes: m.episodes ?? null,
    duration: m.duration ?? null,
    year: m.seasonYear ?? null,
    season: (m.season as Season) ?? null,
    format: (m.format as MediaFormat) ?? null,
    status: (m.status as MediaStatus) ?? null,
    genres: m.genres ?? [],
    synopsis: plain(m.description),
    trailerId: m.trailer?.site === "youtube" ? m.trailer.id ?? null : null,
    siteUrl: m.siteUrl || `https://anilist.co/anime/${m.id}`,
  };
}

/**
 * Builds a query whose variable declarations match exactly the filters present.
 * Declaring a variable and passing null is not the same as omitting it.
 */
function buildQuery(q: BrowseQuery): { text: string; variables: Record<string, unknown> } {
  const defs = ["$page: Int", "$perPage: Int"];
  const args = ["type: ANIME", "isAdult: false"];
  const vars: Record<string, unknown> = {};

  if (q.search) {
    defs.push("$search: String");
    args.push("search: $search");
    vars.search = q.search;
  }
  if (q.genre) {
    defs.push("$genre: String");
    args.push("genre: $genre");
    vars.genre = q.genre;
  }
  if (q.format) {
    defs.push("$format: MediaFormat");
    args.push("format: $format");
    vars.format = q.format;
  }
  if (q.status) {
    defs.push("$status: MediaStatus");
    args.push("status: $status");
    vars.status = q.status;
  }
  if (q.season) {
    defs.push("$season: MediaSeason");
    args.push("season: $season");
    vars.season = q.season;
  }
  if (q.year) {
    defs.push("$year: Int");
    args.push("seasonYear: $year");
    vars.year = q.year;
  }

  const sort = SORT[q.sort ?? "POPULARITY"];
  defs.push("$sort: [MediaSort]");
  args.push("sort: $sort");
  vars.sort = sort;

  const text = `query (${defs.join(", ")}) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(${args.join(", ")}) { ${MEDIA_FIELDS} }
    }
  }`;

  return { text, variables: vars };
}

/**
 * One POST with bounded retry. AniList returns 429 under burst and 5xx during
 * incidents; both are worth a short backoff because the result is cached after.
 */
async function request(
  query: string,
  variables: Record<string, unknown>,
  revalidate: number
): Promise<unknown> {
  const body = JSON.stringify({ query, variables });
  let lastError: unknown = new Error("AniList unreachable");

  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
        signal: controller.signal,
        next: { revalidate },
      } as RequestInit & { next: { revalidate: number } });

      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`AniList ${res.status}`);
        await sleep(700 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`AniList ${res.status}`);

      const json = await res.json();
      if (json?.errors?.length) {
        throw new Error(
          json.errors.map((e: { message: string }) => e.message).join("; ")
        );
      }
      return json?.data;
    } catch (err) {
      lastError = err;
      await sleep(700 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The single browse entry point. Every list on the site goes through here. */
export async function browse(q: BrowseQuery = {}): Promise<Page<Anime>> {
  const page = Math.max(1, q.page ?? 1);
  const perPage = Math.min(50, Math.max(1, q.perPage ?? 24));
  const { text, variables } = buildQuery(q);

  const data = (await request(
    text,
    { page, perPage, ...variables },
    q.search ? 600 : 3600
  )) as {
    Page?: { media?: RawMedia[]; pageInfo?: { hasNextPage?: boolean; total?: number } };
  };

  return {
    items: (data?.Page?.media ?? []).map(toAnime),
    page,
    hasNext: data?.Page?.pageInfo?.hasNextPage ?? false,
    total: data?.Page?.pageInfo?.total ?? null,
  };
}

/** Single title, used by the detail route. */
export async function byId(id: number): Promise<Anime | null> {
  const data = (await request(
    `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`,
    { id },
    86400
  )) as { Media?: RawMedia };
  return data?.Media ? toAnime(data.Media) : null;
}

/**
 * A handful of highly-rated titles that actually have banner artwork — the
 * spotlight reel needs wide art, so titles without it are useless there.
 */
export async function banners(limit = 6): Promise<Anime[]> {
  const data = (await request(
    `query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(type: ANIME, isAdult: false, sort: [SCORE_DESC, POPULARITY_DESC]) {
          ${MEDIA_FIELDS}
        }
      }
    }`,
    { perPage: limit + 8 },
    86400
  )) as { Page?: { media?: RawMedia[] } };

  const all = (data?.Page?.media ?? []).map(toAnime);
  const withBanner = all.filter((a) => a.art.banner);
  return (withBanner.length >= limit ? withBanner : all).slice(0, limit);
}

/** The genre vocabulary, minus the adult-only entry. Cached for a week. */
export async function genres(): Promise<string[]> {
  const data = (await request(`{ GenreCollection }`, {}, 604_800)) as {
    GenreCollection?: string[];
  };
  return (data?.GenreCollection ?? []).filter((g) => g !== "Hentai");
}
