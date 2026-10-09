// GET /api/anime/[id] — one title, for the detail route.

import { NextResponse } from "next/server";
import { byId } from "@/lib/anilist";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const anime = await byId(n);
    if (!anime) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(anime, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upstream unavailable" },
      { status: 502 }
    );
  }
}
