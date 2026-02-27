import { NextResponse } from "next/server";

function normalizeImgur(url: string) {
  // Convert imgur page URLs to i.imgur direct URLs when possible
  // https://imgur.com/abcd123 -> https://i.imgur.com/abcd123.gif (best guess)
  // Also convert .gifv -> .gif
  try {
    const u = new URL(url);

    // gifv -> gif
    if (u.hostname === "i.imgur.com" && u.pathname.endsWith(".gifv")) {
      u.pathname = u.pathname.replace(/\.gifv$/i, ".gif");
      return u.toString();
    }

    // imgur.com/<id> -> i.imgur.com/<id>.gif (fallback)
    if ((u.hostname === "imgur.com" || u.hostname === "m.imgur.com") && u.pathname.length > 1) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && id !== "a" && id !== "gallery") {
        return `https://i.imgur.com/${id}.gif`;
      }
    }

    return url;
  } catch {
    return url;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");

  if (!raw) return new NextResponse("Missing url", { status: 400 });

  const url = normalizeImgur(raw);

  // Allowlist (keep tight)
  if (!url.startsWith("https://i.imgur.com/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const res = await fetch(url, {
    // These headers help a LOT with CDNs that block “botty” requests
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Accept:
        "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://imgur.com/",
      Origin: "https://imgur.com",
    },
    // Some platforms cache aggressively; you can toggle this later
    cache: "no-store",
  });

  if (!res.ok) {
    return new NextResponse(`Failed to fetch overlay: ${res.status}`, {
      status: res.status,
    });
  }

  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/octet-stream",
      // Cache for a day
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
