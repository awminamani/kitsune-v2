// GET /api/genres — the genre vocabulary for the filter sheet.
// Cached hard at the edge because it changes roughly never.

import { NextResponse } from "next/server";
import { genres } from "@/lib/anilist";

export const revalidate = 604800;

export async function GET() {
  try {
    const list = await genres();
    return NextResponse.json(
      { genres: list },
      { headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" } }
    );
  } catch {
    return NextResponse.json({ genres: [] }, { status: 200 });
  }
}
