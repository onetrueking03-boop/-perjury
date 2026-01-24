import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!botToken || !guildId) {
    return NextResponse.json(
      { ok: false, error: "Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID" },
      { status: 500 }
    );
  }

  const r = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    cache: "no-store",
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { ok: false, error: "Discord guild fetch failed", details: text },
      { status: 500 }
    );
  }

  const g = await r.json();

  const iconUrl =
    g.icon
      ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`
      : null;

  return NextResponse.json({
    ok: true,
    id: g.id,
    name: g.name,
    iconUrl,
  });
}
