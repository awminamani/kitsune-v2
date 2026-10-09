import { notFound } from "next/navigation";
import { byId, browse } from "@/lib/anilist";
import type { Anime } from "@/lib/types";
import DetailView from "@/components/DetailView";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anime = await byId(Number(id)).catch(() => null);
  if (!anime) return { title: "Not found — Kitsune" };
  return {
    title: `${anime.title.display} — Kitsune`,
    description: anime.synopsis.slice(0, 155) || undefined,
  };
}

export default async function AnimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();

  const anime = await byId(n).catch(() => null);
  if (!anime) notFound();

  // "More like this" — the first genre, minus the title being viewed.
  const related = anime.genres.length
    ? await browse({ genre: anime.genres[0], perPage: 12 })
        .then((p) => p.items.filter((x) => x.id !== anime.id).slice(0, 6))
        .catch(() => [] as Anime[])
    : [];

  return <DetailView anime={anime} related={related} />;
}
