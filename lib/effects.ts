export type EffectType =
  | "aura"
  | "ring"
  | "sparkles"
  | "nitro_sheen"
  | "booster_pulse"
  | "holo_scan"
  | "electric_outline"
  | "orbit_badges"
  | "starfield"
  | "glassy"
  | "confetti"
  | "prism_ring"
  | "plasma_arcs"
  // NEW:
  | "void_rift"
  | "crown_glow"
  | "ember_halo"
  | "nebula_swirl"
  | "pixel_glitch"
  | "diamond_dust"
  | "snowfall"
  | "fireflies"
  | "heart_bloom"
  | "comic_speedlines"
  | "matrix_rain"
  | "rainbow_wave"
  | "vhs"
  | "shatter_glass";

export const EFFECT_LABELS: Record<EffectType, string> = {
  aura: "Neon Aura",
  ring: "Gradient Ring",
  sparkles: "Sparkle Orbit",
  nitro_sheen: "Nitro Sheen",
  booster_pulse: "Booster Pulse",
  holo_scan: "Holo Scanlines",
  electric_outline: "Electric Outline",
  orbit_badges: "Orbit Badges",
  starfield: "Starfield",
  glassy: "Glassy",
  confetti: "Confetti",
  prism_ring: "Prism Ring",
  plasma_arcs: "Plasma Arcs",

  void_rift: "Void Rift",
  crown_glow: "Crown Glow",
  ember_halo: "Ember Halo",
  nebula_swirl: "Nebula Swirl",
  pixel_glitch: "Pixel Glitch",
  diamond_dust: "Diamond Dust",
  snowfall: "Snowfall",
  fireflies: "Fireflies",
  heart_bloom: "Heart Bloom",
  comic_speedlines: "Comic Speedlines",
  matrix_rain: "Matrix Rain",
  rainbow_wave: "Rainbow Wave",
  vhs: "VHS",
  shatter_glass: "Shatter Glass",
};

const TAU = Math.PI * 2;

function hash01(n: number) {
  const s = Math.sin(n * 9999.123) * 10000;
  return s - Math.floor(s);
}

export function drawEffect(
  ctx: CanvasRenderingContext2D,
  effect: EffectType,
  t: number,
  size: number
) {
  ctx.save();
  ctx.translate(size / 2, size / 2);

  if (effect === "aura") drawAura(ctx, t, size);
  else if (effect === "ring") drawRing(ctx, t, size);
  else if (effect === "sparkles") drawSparkles(ctx, t, size);
  else if (effect === "nitro_sheen") drawNitroSheen(ctx, t, size);
  else if (effect === "booster_pulse") drawBoosterPulse(ctx, t, size);
  else if (effect === "holo_scan") drawHoloScan(ctx, t, size);
  else if (effect === "electric_outline") drawElectricOutline(ctx, t, size);
  else if (effect === "orbit_badges") drawOrbitBadges(ctx, t, size);
  else if (effect === "starfield") drawStarfield(ctx, t, size);
  else if (effect === "glassy") drawGlassy(ctx, t, size);
  else if (effect === "confetti") drawConfetti(ctx, t, size);
  else if (effect === "prism_ring") drawPrismRing(ctx, t, size);
  else if (effect === "plasma_arcs") drawPlasmaArcs(ctx, t, size);

  // NEW:
  else if (effect === "void_rift") drawVoidRift(ctx, t, size);
  else if (effect === "crown_glow") drawCrownGlow(ctx, t, size);
  else if (effect === "ember_halo") drawEmberHalo(ctx, t, size);
  else if (effect === "nebula_swirl") drawNebulaSwirl(ctx, t, size);
  else if (effect === "pixel_glitch") drawPixelGlitch(ctx, t, size);
  else if (effect === "diamond_dust") drawDiamondDust(ctx, t, size);
  else if (effect === "snowfall") drawSnowfall(ctx, t, size);
  else if (effect === "fireflies") drawFireflies(ctx, t, size);
  else if (effect === "heart_bloom") drawHeartBloom(ctx, t, size);
  else if (effect === "comic_speedlines") drawComicSpeedlines(ctx, t, size);
  else if (effect === "matrix_rain") drawMatrixRain(ctx, t, size);
  else if (effect === "rainbow_wave") drawRainbowWave(ctx, t, size);
  else if (effect === "vhs") drawVhs(ctx, t, size);
  else if (effect === "shatter_glass") drawShatterGlass(ctx, t, size);

  ctx.restore();
}

/* ---------------- AURA ---------------- */

function drawAura(ctx: CanvasRenderingContext2D, t: number, size: number) {
  const pulse = 0.5 + Math.sin(t * 2) * 0.15;
  const r = size * 0.48;

  const g = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r);
  g.addColorStop(0, `rgba(168,85,247,0.0)`);
  g.addColorStop(0.6, `rgba(168,85,247,${0.15 * pulse})`);
  g.addColorStop(1, `rgba(236,72,153,${0.45 * pulse})`);

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
}

/* ---------------- RING ---------------- */

function drawRing(ctx: CanvasRenderingContext2D, t: number, size: number) {
  const r = size * 0.46;
  const rot = t * 0.8;

  ctx.rotate(rot);
  ctx.lineWidth = size * 0.035;

  const g = ctx.createLinearGradient(-r, 0, r, 0);
  g.addColorStop(0, "#ec4899");
  g.addColorStop(0.5, "#a855f7");
  g.addColorStop(1, "#ec4899");

  ctx.strokeStyle = g;
  ctx.shadowBlur = 30;
  ctx.shadowColor = "#a855f7";

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
}

/* ---------------- SPARKLES ---------------- */

function drawSparkles(ctx: CanvasRenderingContext2D, t: number, size: number) {
  const count = 14;
  const r = size * 0.48;

  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + t;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const s = 2 + Math.sin(t * 3 + i) * 1.5;

    ctx.fillStyle = `rgba(236,72,153,0.85)`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ec4899";

    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }
}

/* ---------------- NITRO SHEEN ---------------- */

function drawNitroSheen(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.rotate(-0.6);

  const sweep = ((t * 0.35) % 1) * (size * 1.6) - size * 0.8;
  const band = size * 0.22;

  const g = ctx.createLinearGradient(sweep - band, -size, sweep + band, size);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.48, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,0.33)");
  g.addColorStop(0.52, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");

  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = g;
  ctx.fillRect(-size, -size, size * 2, size * 2);

  ctx.globalCompositeOperation = "lighter";
  ctx.rotate(0.6);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = Math.max(2, size * 0.012);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.49, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

/* ---------------- BOOSTER PULSE ---------------- */

function drawBoosterPulse(ctx: CanvasRenderingContext2D, t: number, size: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  const pulse2 = 0.5 + 0.5 * Math.sin(t * 3.1 + 1.2);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#a855f7";

  ctx.strokeStyle = `rgba(168,85,247,${0.08 + 0.22 * pulse})`;
  ctx.lineWidth = Math.max(2, size * 0.013);
  ctx.beginPath();
  ctx.arc(0, 0, size * (0.49 + 0.02 * pulse2), 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = `rgba(236,72,153,${0.06 + 0.18 * pulse2})`;
  ctx.lineWidth = Math.max(2, size * 0.009);
  ctx.beginPath();
  ctx.arc(0, 0, size * (0.54 + 0.03 * pulse), 0, TAU);
  ctx.stroke();

  ctx.globalCompositeOperation = "lighter";
  const count = 14;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + t * 0.35;
    const r = size * (0.51 + 0.02 * Math.sin(t * 2 + i));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const s = (1 + 2.2 * hash01(i * 7.7)) * (1 + 0.6 * pulse);
    ctx.fillStyle = `rgba(255,255,255,${0.10 + 0.30 * pulse2})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- HOLO SCANLINES ---------------- */

function drawHoloScan(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();

  ctx.globalCompositeOperation = "overlay";
  const lineH = Math.max(2, Math.floor(size * 0.018));
  const offset = Math.floor((t * 40) % (lineH * 2));
  for (let y = -size - offset; y < size + lineH; y += lineH * 2) {
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(-size, y, size * 2, lineH);
  }

  const yy = ((t * 0.55) % 1) * (size * 1.4) - size * 0.7;
  ctx.globalCompositeOperation = "screen";
  const g = ctx.createLinearGradient(0, yy - size * 0.15, 0, yy + size * 0.15);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.5, "rgba(255,255,255,0.20)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(-size, -size, size * 2, size * 2);

  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = Math.max(2, size * 0.010);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.49, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

/* ---------------- ELECTRIC OUTLINE ---------------- */

function drawElectricOutline(ctx: CanvasRenderingContext2D, t: number, size: number) {
  const segments = 140;
  const baseR = size * 0.49;
  const amp = size * 0.010;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowBlur = 16;
  ctx.shadowColor = "#ff0080ff";

  ctx.lineWidth = Math.max(2, size * 0.012);
  ctx.strokeStyle = "rgba(236,72,153,0.22)";
  ctx.beginPath();
  for (let i = 0; i <= segments; i++) {
    const p = i / segments;
    const a = p * TAU;
    const n =
      Math.sin(a * 9 + t * 4) * 0.6 +
      Math.sin(a * 17 - t * 3) * 0.4 +
      Math.sin(a * 29 + t * 2) * 0.2;
    const r = baseR + n * amp;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.lineWidth = Math.max(1.5, size * 0.007);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();

  ctx.restore();
}

/* ---------------- ORBIT BADGES ---------------- */

function drawOrbitBadges(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const orbitR = size * 0.55;
  const badgeR = Math.max(3, size * 0.04);
  const n = 4;

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#a955f7ff";

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * (0.8 - i * 0.12);
    const x = Math.cos(a) * orbitR;
    const y = Math.sin(a) * orbitR;

    ctx.fillStyle = `rgba(168,85,247,${0.08 + 0.10 * (0.5 + 0.5 * Math.sin(t * 2 + i))})`;
    ctx.beginPath();
    ctx.arc(x, y, badgeR * 2.0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(0, 255, 0, 1)";
    ctx.beginPath();
    ctx.arc(x, y, badgeR, 0, TAU);
    ctx.fill();
  }

  ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(70, 70, 70, 0.1)";
  ctx.lineWidth = Math.max(2, size * 0.008);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.52, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

/* ---------------- STARFIELD ---------------- */

function drawStarfield(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const starCount = 80;
  for (let i = 0; i < starCount; i++) {
    const rx = hash01(42 + i * 13.1);
    const ry = hash01(99 + i * 19.7);
    const sp = 0.15 + 0.85 * hash01(7 + i * 7.7);
    const x = ((rx * size * 2 + t * 18 * sp) % (size * 2)) - size;
    const y = ((ry * size * 2 + t * 9 * sp) % (size * 2)) - size;
    const rr = 0.6 + 1.8 * sp;

    ctx.fillStyle = `rgba(255,255,255,${0.04 + 0.18 * sp})`;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- GLASSY ---------------- */

function drawGlassy(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const hx = -size * 0.18 + Math.sin(t * 0.8) * (size * 0.03);
  const hy = -size * 0.22 + Math.cos(t * 0.9) * (size * 0.03);
  const hr = size * 0.32;

  const g = ctx.createRadialGradient(hx, hy, hr * 0.1, hx, hy, hr);
  g.addColorStop(0, "rgba(255,255,255,0.30)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, TAU);
  ctx.fill();

  const y0 = -size * 0.38;
  const g2 = ctx.createLinearGradient(0, y0, 0, y0 + size * 0.8);
  g2.addColorStop(0, "rgba(255,255,255,0)");
  g2.addColorStop(0.42, "rgba(255,255,255,0.16)");
  g2.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g2;
  ctx.fillRect(-size, -size, size * 2, size * 2);

  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = Math.max(2, size * 0.010);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.49, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

/* ---------------- CONFETTI ---------------- */

function drawConfetti(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const pieces = 28;
  const baseR = size * 0.58;

  ctx.shadowBlur = 10;
  ctx.shadowColor = "#ec4899";

  for (let i = 0; i < pieces; i++) {
    const a0 = (i / pieces) * TAU + t * 0.35;
    const wig = Math.sin(t * 2.3 + i) * 0.06;
    const a = a0 + wig;

    const rr = baseR + (hash01(123 + i * 4.2) - 0.5) * (size * 0.02);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;

    const alpha = 0.10 + 0.25 * hash01(222 + i * 8.8);
    const len = size * (0.02 + 0.03 * hash01(333 + i * 3.3));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(-len / 2, -2, len, 4);

    ctx.restore();
  }

  ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = Math.max(2, size * 0.008);
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.52, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

/* ---------------- PRISM RING ---------------- */
function drawPrismRing(ctx: CanvasRenderingContext2D, t: number, size: number) {
  // simple wrapper: reuse ring with stronger rotation/glow look
  ctx.save();
  ctx.rotate(t * 0.6);
  ctx.lineWidth = size * 0.030;
  const r = size * 0.46;

  const g = ctx.createLinearGradient(-r, 0, r, 0);
  g.addColorStop(0, "#ec4899");
  g.addColorStop(0.5, "#a855f7");
  g.addColorStop(1, "#3b82f6");

  ctx.strokeStyle = g;
  ctx.shadowBlur = 24;
  ctx.shadowColor = "rgba(168,85,247,0.7)";

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ---------------- PLASMA ARCS ---------------- */
function drawPlasmaArcs(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const r = size * 0.47;
  const arcs = 4;

  ctx.shadowBlur = 18;
  ctx.shadowColor = "rgba(168,85,247,0.8)";

  for (let i = 0; i < arcs; i++) {
    const base = (i / arcs) * TAU + t * 0.55;
    const span = TAU * (0.10 + 0.06 * (0.5 + 0.5 * Math.sin(t * 1.8 + i)));

    ctx.lineWidth = size * 0.010;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(0, 0, r, base, base + span);
    ctx.stroke();

    ctx.lineWidth = size * 0.022;
    ctx.strokeStyle = "rgba(168,85,247,0.10)";
    ctx.beginPath();
    ctx.arc(0, 0, r, base, base + span);
    ctx.stroke();
  }

  ctx.restore();
}

/* ---------------- NEW EFFECTS ---------------- */

function drawVoidRift(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const wob = 0.5 + 0.5 * Math.sin(t * 1.4);
  const rot = t * 0.35;

  ctx.rotate(rot);

  for (let i = 0; i < 2; i++) {
    const a = (i === 0 ? 0 : Math.PI) + t * 0.25;
    const gx = Math.cos(a) * size * (0.10 + 0.03 * wob);
    const gy = Math.sin(a) * size * (0.10 + 0.03 * wob);

    const g = ctx.createRadialGradient(gx, gy, size * 0.02, gx, gy, size * 0.40);
    g.addColorStop(0.0, "rgba(168,85,247,0.00)");
    g.addColorStop(0.45, "rgba(168,85,247,0.10)");
    g.addColorStop(1.0, "rgba(236,72,153,0.00)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawCrownGlow(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const pulse = 0.5 + 0.5 * Math.sin(t * 2.0);
  const y = -size * 0.36;
  const w = size * 0.28;
  const h = size * 0.18;

  const g = ctx.createRadialGradient(0, y, size * 0.02, 0, y, size * 0.20);
  g.addColorStop(0, `rgba(255,255,255,${0.08 + 0.10 * pulse})`);
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, y, size * 0.22, 0, TAU);
  ctx.fill();

  ctx.shadowBlur = size * 0.03;
  ctx.shadowColor = "rgba(255,255,255,0.55)";
  ctx.fillStyle = `rgba(255,255,255,${0.10 + 0.12 * pulse})`;

  ctx.beginPath();
  ctx.moveTo(-w, y + h * 0.7);
  ctx.lineTo(-w * 0.55, y);
  ctx.lineTo(-w * 0.15, y + h * 0.35);
  ctx.lineTo(0, y - h * 0.2);
  ctx.lineTo(w * 0.15, y + h * 0.35);
  ctx.lineTo(w * 0.55, y);
  ctx.lineTo(w, y + h * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawEmberHalo(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const haloR = size * 0.46;
  const count = 24;

  ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(0, 0, haloR * 0.7, 0, 0, haloR);
  g.addColorStop(0.0, "rgba(236,72,153,0.0)");
  g.addColorStop(1.0, "rgba(236,72,153,0.12)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, haloR, 0, TAU);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU + t * 0.9;
    const wob = 0.04 * Math.sin(t * 3 + i);
    const rr = size * (0.42 + wob);
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;

    const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.4);
    const s = size * (0.003 + 0.006 * tw);

    ctx.shadowBlur = size * 0.03;
    ctx.shadowColor = "rgba(236,72,153,0.85)";
    ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.22 * tw})`;

    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawNebulaSwirl(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 3; i++) {
    const a = t * (0.22 + i * 0.06) + i * 2.1;
    const x = Math.cos(a) * size * 0.08;
    const y = Math.sin(a) * size * 0.08;
    const rr = size * (0.38 - i * 0.06);

    const g = ctx.createRadialGradient(x, y, rr * 0.12, x, y, rr);
    g.addColorStop(0, `rgba(168,85,247,${0.10 - i * 0.02})`);
    g.addColorStop(0.6, `rgba(236,72,153,${0.08 - i * 0.02})`);
    g.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawPixelGlitch(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const rows = 8;
  const maxShift = size * 0.06;

  for (let i = 0; i < rows; i++) {
    const y = -size * 0.48 + (i / rows) * (size * 0.96);
    const h = (size * 0.96) / rows;

    const n = Math.sin(t * 6 + i * 2.2);
    const shift = n * maxShift * (0.15 + 0.85 * hash01(i * 31.7));

    ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.05 * Math.max(0, n)})`;
    ctx.fillRect(-size * 0.48 + shift, y, size * 0.96, h * 0.65);
  }

  ctx.restore();
}

function drawDiamondDust(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const n = 26;
  for (let i = 0; i < n; i++) {
    const a = hash01(100 + i * 9.3) * TAU + t * 0.25;
    const rad = Math.sqrt(hash01(200 + i * 4.7)) * (size * 0.45);
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;

    const tw = 0.5 + 0.5 * Math.sin(t * 4 + i);
    const s = size * (0.006 + 0.004 * tw);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + t);

    ctx.shadowBlur = size * 0.03;
    ctx.shadowColor = "rgba(255,255,255,0.55)";
    ctx.fillStyle = `rgba(255,255,255,${0.06 + 0.18 * tw})`;

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/* ---------------- NEW: SNOWFALL ---------------- */
function drawSnowfall(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const r = size * 0.48;
  const n = 70;

  for (let i = 0; i < n; i++) {
    const seed = i * 9.17;
    const x = (hash01(seed + 1) * 2 - 1) * r;
    const speed = 0.12 + 0.55 * hash01(seed + 2);
    const drift = (hash01(seed + 3) * 2 - 1) * (r * 0.25);

    const y =
      (((hash01(seed + 4) * 2 - 1) * r) + (t * 220 * speed)) % (r * 2) - r;

    const xx = x + Math.sin(t * 0.8 + i) * drift * 0.08;
    const rr = 0.8 + 2.1 * hash01(seed + 5);

    const alpha = 0.04 + 0.18 * hash01(seed + 6);

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(xx, y, rr, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- NEW: FIREFLIES ---------------- */
function drawFireflies(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const r = size * 0.46;
  const n = 18;

  ctx.shadowBlur = size * 0.03;
  ctx.shadowColor = "rgba(168,85,247,0.9)";

  for (let i = 0; i < n; i++) {
    const seed = 100 + i * 7.77;
    const baseA = hash01(seed) * TAU;
    const rad = (0.18 + 0.78 * hash01(seed + 1)) * r;
    const wob = 0.35 + 0.85 * hash01(seed + 2);

    const a = baseA + t * (0.35 + 0.35 * wob);
    const x = Math.cos(a) * rad * (0.85 + 0.12 * Math.sin(t * 0.9 + i));
    const y = Math.sin(a) * rad * (0.85 + 0.12 * Math.cos(t * 1.0 + i));

    const tw = 0.5 + 0.5 * Math.sin(t * (2.0 + 2.5 * wob) + i * 2.1);
    const s = size * (0.004 + 0.006 * tw);

    ctx.fillStyle = `rgba(255,255,255,${0.06 + 0.22 * tw})`;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/* ---------------- NEW: HEART BLOOM ---------------- */
function drawHeartBloom(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const r = size * 0.46;
  const n = 10;

  for (let i = 0; i < n; i++) {
    const seed = 200 + i * 12.3;
    const a = hash01(seed) * TAU + t * 0.25;
    const rad = (0.08 + 0.85 * hash01(seed + 1)) * r;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;

    const life = (t * (0.28 + 0.18 * hash01(seed + 2)) + hash01(seed + 3)) % 1;
    const pop = Math.sin(life * Math.PI); // 0..1..0
    const s = size * (0.010 + 0.020 * pop);

    const alpha = 0.02 + 0.18 * pop;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);

    // heart using bezier-ish shape
    ctx.fillStyle = `rgba(236,72,153,${alpha})`;
    ctx.beginPath();
    const k = s;
    ctx.moveTo(0, k * 0.30);
    ctx.bezierCurveTo(k * 0.65, -k * 0.35, k * 0.95, k * 0.35, 0, k);
    ctx.bezierCurveTo(-k * 0.95, k * 0.35, -k * 0.65, -k * 0.35, 0, k * 0.30);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // soft tint
  const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  g.addColorStop(0, "rgba(236,72,153,0)");
  g.addColorStop(1, "rgba(252, 2, 127, 0.2)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  ctx.restore();
}

/* ---------------- NEW: COMIC SPEEDLINES ---------------- */
function drawComicSpeedlines(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "overlay";

  const r = size * 0.48;
  const spokes = 26;
  const spin = t * 0.35;

  ctx.rotate(spin);
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * TAU;
    const w = (0.006 + 0.012 * hash01(i * 9.9)) * size;
    const len = (0.25 + 0.65 * hash01(i * 7.1)) * r;

    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 + i);
    const alpha = 0.03 + 0.08 * pulse;

    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(r - len, -w / 2, len, w);
    ctx.restore();
  }

  ctx.restore();
}

/* ---------------- NEW: MATRIX RAIN ---------------- */
function drawMatrixRain(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const r = size * 0.48;
  const cols = 14;
  const colW = (r * 2) / cols;

  for (let c = 0; c < cols; c++) {
    const seed = 500 + c * 33.3;
    const x = -r + c * colW + colW * 0.5;

    const speed = 0.25 + 0.75 * hash01(seed + 1);
    const phase = (t * (0.6 + speed) + hash01(seed + 2)) % 1;

    const yHead = -r + phase * (r * 2.2);
    const trail = r * (0.35 + 0.35 * hash01(seed + 3));

    // head
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    ctx.fillRect(x - colW * 0.10, yHead - colW * 0.25, colW * 0.20, colW * 0.50);

    // trail gradient
    const g = ctx.createLinearGradient(0, yHead - trail, 0, yHead + colW);
    g.addColorStop(0, "rgba(34,197,94,0)");
    g.addColorStop(0.7, "rgba(2, 255, 95, 0.57)");
    g.addColorStop(1, "rgba(34,197,94,0.0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - colW * 0.12, yHead - trail, colW * 0.24, trail);
  }

  // subtle dark vignette to look “deep”
  ctx.globalCompositeOperation = "multiply";
  const v = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = v;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  ctx.restore();
}

/* ---------------- NEW: RAINBOW WAVE ---------------- */
function drawRainbowWave(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const r = size * 0.48;

  // moving gradient band
  const yy = Math.sin(t * 0.9) * (r * 0.25);
  const g = ctx.createLinearGradient(-r, yy - r * 0.35, r, yy + r * 0.35);
  g.addColorStop(0.0, "rgba(236,72,153,0.10)");
  g.addColorStop(0.33, "rgba(168,85,247,0.10)");
  g.addColorStop(0.66, "rgba(59,130,246,0.10)");
  g.addColorStop(1.0, "rgba(34,197,94,0.10)");

  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  // wavy highlight lines
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = Math.max(2, size * 0.006);

  const lines = 6;
  for (let i = 0; i < lines; i++) {
    const y0 = -r + (i / (lines - 1)) * (r * 2);
    ctx.beginPath();
    for (let x = -r; x <= r; x += r / 10) {
      const y = y0 + Math.sin(t * 2 + x * 0.02 + i) * (r * 0.03);
      if (x === -r) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/* ---------------- NEW: VHS ---------------- */
function drawVhs(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();

  const r = size * 0.48;

  // scanlines
  ctx.globalCompositeOperation = "overlay";
  const lineH = Math.max(2, Math.floor(size * 0.014));
  const off = Math.floor((t * 55) % (lineH * 2));
  for (let y = -r - off; y < r + lineH; y += lineH * 2) {
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(-r, y, r * 2, lineH);
  }

  // horizontal jitter bands
  ctx.globalCompositeOperation = "screen";
  const bands = 5;
  for (let i = 0; i < bands; i++) {
    const seed = 900 + i * 10.1;
    const y = -r + hash01(seed + Math.floor(t * 4)) * (r * 2);
    const h = r * (0.06 + 0.04 * hash01(seed + 2));
    const shift = (hash01(seed + 3) * 2 - 1) * (r * 0.12);

    ctx.fillStyle = `rgba(255,255,255,${0.03 + 0.03 * hash01(seed + 4)})`;
    ctx.fillRect(-r + shift, y, r * 2, h);
  }

  // subtle RGB tint
  ctx.globalCompositeOperation = "screen";
  const tint = ctx.createLinearGradient(-r, 0, r, 0);
  tint.addColorStop(0, "rgba(255,0,80,0.03)");
  tint.addColorStop(0.5, "rgba(255,255,255,0)");
  tint.addColorStop(1, "rgba(0,140,255,0.03)");
  ctx.fillStyle = tint;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  ctx.restore();
}

/* ---------------- NEW: SHATTER GLASS ---------------- */
function drawShatterGlass(ctx: CanvasRenderingContext2D, t: number, size: number) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const r = size * 0.48;

  // a few “crack” rays
  ctx.lineWidth = Math.max(2, size * 0.004);
  ctx.shadowBlur = size * 0.02;
  ctx.shadowColor = "rgba(255,255,255,0.25)";
  ctx.strokeStyle = "rgba(255,255,255,0.10)";

  const rays = 11;
  const wob = 0.4 + 0.6 * Math.sin(t * 0.8);

  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * TAU + 0.3 * Math.sin(i + t * 0.2);
    const len = r * (0.55 + 0.35 * hash01(1000 + i * 3.3));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    ctx.stroke();
  }

  // shard polygons
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255,255,255,${0.03 + 0.05 * (0.5 + 0.5 * wob)})`;
  const shards = 8;

  for (let i = 0; i < shards; i++) {
    const a0 = (i / shards) * TAU + t * 0.02;
    const a1 = a0 + TAU / shards * (0.45 + 0.15 * hash01(2000 + i));
    const rr0 = r * (0.25 + 0.55 * hash01(3000 + i));
    const rr1 = r * (0.55 + 0.40 * hash01(4000 + i));

    ctx.beginPath();
    ctx.moveTo(Math.cos(a0) * rr0, Math.sin(a0) * rr0);
    ctx.lineTo(Math.cos(a1) * rr1, Math.sin(a1) * rr1);
    ctx.lineTo(Math.cos(a0 + (a1 - a0) * 0.55) * rr1, Math.sin(a0 + (a1 - a0) * 0.55) * rr1);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
