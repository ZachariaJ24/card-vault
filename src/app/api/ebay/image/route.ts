import { NextRequest, NextResponse } from "next/server";
import { findCardImage } from "@/lib/ebay";

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  const set = req.nextUrl.searchParams.get("set") ?? "";
  const grade = req.nextUrl.searchParams.get("grade") ?? "PSA 10";

  if (!player) {
    return NextResponse.json({ error: "Missing ?player= parameter" }, { status: 400 });
  }

  try {
    const imageUrl = await findCardImage(player, set, grade);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
