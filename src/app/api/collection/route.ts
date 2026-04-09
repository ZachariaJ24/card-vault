import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/collection
 *
 * Imports cards from a CSV upload. Expects multipart form data with a "file" field.
 * Each row becomes a card in the `cards` table + a portfolio entry for the user.
 *
 * CSV columns (header row required):
 *   player_name, card_name, year, card_set, sport, team, grade, purchase_price, quantity, notes
 *
 * Requires: Authorization header with user's access token, or uses service role for admin.
 */
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Try to get user from auth header
  const authHeader = req.headers.get("authorization");
  const supabase = serviceKey
    ? createClient(supabaseUrl, serviceKey)
    : createClient(supabaseUrl, anonKey);

  // Get user ID from the request body
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("user_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());

  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
  }

  // Parse header
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const REQUIRED = ["player_name", "card_name"];

  for (const col of REQUIRED) {
    if (!header.includes(col)) {
      return NextResponse.json(
        { error: `Missing required column: ${col}. Required columns: ${REQUIRED.join(", ")}` },
        { status: 400 },
      );
    }
  }

  const results: { row: number; player: string; status: string }[] = [];
  let inserted = 0;
  let errors = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: Record<string, string> = {};
    header.forEach((col, idx) => {
      row[col] = (values[idx] ?? "").trim();
    });

    const playerName = row.player_name;
    const cardName = row.card_name;
    if (!playerName && !cardName) {
      results.push({ row: i + 1, player: "", status: "skipped (empty row)" });
      continue;
    }

    // Upsert card into cards table
    const cardPayload = {
      name: cardName || `${playerName} Card`,
      player_name: playerName || null,
      year: row.year ? parseInt(row.year) : null,
      card_set: row.card_set || null,
      sport: row.sport || null,
      team: row.team || null,
    };

    // Check if card exists first
    let cardId: string | null = null;
    const { data: existingCard } = await supabase
      .from("cards")
      .select("id")
      .eq("name", cardPayload.name)
      .eq("player_name", cardPayload.player_name ?? "")
      .single();

    if (existingCard) {
      cardId = existingCard.id;
    } else {
      const { data: newCard, error: cardErr } = await supabase
        .from("cards")
        .insert(cardPayload)
        .select("id")
        .single();

      if (cardErr) {
        results.push({ row: i + 1, player: playerName, status: `card error: ${cardErr.message}` });
        errors++;
        continue;
      }
      cardId = newCard.id;
    }

    // Add to portfolio
    const portfolioPayload = {
      user_id: userId,
      card_id: cardId,
      purchase_price: row.purchase_price ? parseFloat(row.purchase_price) : 0,
      grade: row.grade || null,
      quantity: row.quantity ? parseInt(row.quantity) : 1,
      notes: row.notes || null,
    };

    const { error: portErr } = await supabase.from("portfolio").insert(portfolioPayload);
    if (portErr) {
      results.push({ row: i + 1, player: playerName, status: `portfolio error: ${portErr.message}` });
      errors++;
    } else {
      results.push({ row: i + 1, player: playerName, status: "imported" });
      inserted++;
    }
  }

  return NextResponse.json({
    summary: { total: lines.length - 1, inserted, errors, skipped: lines.length - 1 - inserted - errors },
    results,
  });
}

/** Parse a single CSV line, handling quoted fields with commas inside */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
