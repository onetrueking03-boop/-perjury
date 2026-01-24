import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = Number(searchParams.get("limit") || "24");

  const key = process.env.GIPHY_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Missing GIPHY_API_KEY" }, { status: 500 });
  }

  const url = q
    ? `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(q)}&limit=${limit}&rating=pg-13`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${key}&limit=${limit}&rating=pg-13`;

  const r = await fetch(url);
  const data = await r.json();
  return NextResponse.json(data);
}
