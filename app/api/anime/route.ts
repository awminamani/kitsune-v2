// GET /api/anime — the single browse endpoint.
//
// Replaces the old split of /api/browse + /api/search, which duplicated the
// fetch, paging and error handling. Search is now just a browse with `q` set.

import { NextResponse } from "next/server";
import { browse } from "@/lib/anilist";
import { parseQuery } from "@/lib/query";

export const revalidate = 600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = parseQuery(searchParams);

  try {
    const page = await browse(query);
    return NextResponse.json(
      page,
      // Catalogue data is safe to hold briefly at the edge.
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        items: [],
        page: query.page ?? 1,
        hasNext: false,
        total: null,
        error: err instanceof Error ? err.message : "Upstream unavailable",
      },
      { status: 502 }
    );
  }
}
