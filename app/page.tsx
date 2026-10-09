import { getTrending, getGenreCollection, getSpotlight, getByGenre } from "@/lib/anilist";
import type { Anime } from "@/lib/types";
import Site from "@/components/Site";

// Whole page revalidates every 30 min; per-fetch caches govern the rest.
export const revalidate = 1800;

// Genre rails on the home page. Short and bounded — one query per genre.
const FEATURED = ["Action", "Romance", "Fantasy", "Sci-Fi", "Comedy"];

export default async function Page() {
  const [trending, genres, spotlight] = await Promise.all([
    getTrending(12).catch(() => []),
    getGenreCollection().catch(() => [] as string[]),
    getSpotlight(6).catch(() => []),
  ]);

  const rails = await Promise.all(
    FEATURED.map(async (g) => ({
      genre: g,
      items: await getByGenre(g, 12).catch(() => [] as Anime[]),
    }))
  );

  return (
    <Site
      trending={trending}
      genres={genres}
      spotlight={spotlight}
      rails={rails.filter((r) => r.items.length > 0)}
    />
  );
}
