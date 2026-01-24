import { NextResponse } from "next/server";

export const runtime = "nodejs";

type DiscordMessage = {
  id: string;
  attachments: Array<{
    url: string;
    content_type?: string;
    filename: string;
    width?: number;
    height?: number;
  }>;
  embeds?: Array<{ thumbnail?: { url: string }, image?: { url: string } }>;
  timestamp: string;
};

function isImage(contentType?: string, filename?: string) {
  if (contentType?.startsWith("image/")) return true;
  const f = (filename || "").toLowerCase();
  return f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp") || f.endsWith(".gif");
}

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN!;
  const channelId = process.env.DISCORD_MEDIA_CHANNEL_ID!;

  if (!token || !channelId) {
    return NextResponse.json({ error: "Missing Discord env vars" }, { status: 500 });
  }

  // fetch latest messages
  const r = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages?limit=50`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json({ error: "Discord fetch failed", details: text }, { status: 500 });
  }

  const msgs = (await r.json()) as DiscordMessage[];

  // Extract images from attachments + embeds
  const images: string[] = [];

  for (const m of msgs) {
    for (const a of m.attachments || []) {
      if (isImage(a.content_type, a.filename)) images.push(a.url);
    }
    for (const e of m.embeds || []) {
      const u = e.image?.url || e.thumbnail?.url;
      if (u) images.push(u);
    }
  }

  // de-dupe, newest first
  const unique = Array.from(new Set(images)).slice(0, 24);

  return NextResponse.json({ images: unique });
}
