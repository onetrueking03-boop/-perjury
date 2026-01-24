import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authoptions";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false, booster: false }, { status: 401 });

  const token = process.env.DISCORD_BOT_TOKEN!;
  const guildId = process.env.DISCORD_GUILD_ID!;
  const boosterRoleId = process.env.DISCORD_BOOSTER_ROLE_ID!;

  const userId = (session.user as any)?.id; // discord id not always present by default
  // Better: fetch it from /users/@me using access token:
  const accessToken = (session as any).accessToken as string;

  const me = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then(r => r.json());

  const discordUserId = me.id as string;

  // Use BOT token to fetch guild member roles
  const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
    headers: { Authorization: `Bot ${token}` },
  });

  if (!memberRes.ok) return NextResponse.json({ ok: true, booster: false });

  const member = await memberRes.json();
  const roles: string[] = member.roles || [];
  const booster = roles.includes(boosterRoleId);

  return NextResponse.json({ ok: true, booster });
}
