import { NextRequest, NextResponse } from "next/server";
import { searchEbay } from "@/lib/ebay";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing ?q= parameter" }, { status: 400 });
  }

  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20");
    const sort = req.nextUrl.searchParams.get("sort") ?? undefined;
    const result = await searchEbay(q, { limit, sort });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "eBay search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
