import { banners, browse, genres } from "@/lib/anilist";
import type { Anime } from "@/lib/types";
import HomeView from "@/components/HomeView";

export const revalidate = 1800;

// Genre rails on the home page. Bounded on purpose — one query per genre.
const RAILS = ["Action", "Romance", "Fantasy", "Sci-Fi", "Comedy"];

export default async function Home() {
  const [reel, genreList, trending] = await Promise.all([
    banners(6).catch(() => [] as Anime[]),
    genres().catch(() => [] as string[]),
    browse({ perPage: 14, sort: "TRENDING" })
      .then((p) => p.items)
      .catch(() => [] as Anime[]),
  ]);

  const rails = await Promise.all(
    RAILS.map(async (g) => ({
      genre: g,
      items: await browse({ genre: g, perPage: 14 })
        .then((p) => p.items)
        .catch(() => [] as Anime[]),
    }))
  );

  return (
    <HomeView
      reel={reel}
      genres={genreList}
      trending={trending}
      rails={rails.filter((r) => r.items.length > 0)}
    />
  );
}
