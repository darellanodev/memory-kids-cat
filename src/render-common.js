// Drawing pieces shared by the games. They only draw: they do not change any state.
// `img(name)` returns a loaded image (see assets.js).
import { BTN_PLAY_MENU, EQ_HEART, EQ_LIVES_TEXT, PARTICLE_SIZE } from "./config.js";
import { ParticleSystem } from "./particles.js";
import { drawText, formatScore } from "./ui.js";

const BANNER_TEXT = { gray: 40, effect: "glow", align: "center", baseline: "alphabetic" };

// The banner: "LEVEL 1 / THE FOREST", "TIME IS UP"... g needs `banner` and `bannerY`.
export function drawBanner(ctx, img, g) {
  const y = g.bannerY;
  if (y === null) return;
  ctx.drawImage(img("cartel"), 0, y, 490, 260);
  const { title, subtitle } = g.banner;
  if (subtitle === "") {
    drawText(ctx, title, 245, y + 135, { size: 50, ...BANNER_TEXT });
  } else {
    drawText(ctx, title, 245, y + 105, { size: 50, ...BANNER_TEXT });
    drawText(ctx, subtitle, 245, y + 165, { size: 30, ...BANNER_TEXT });
  }
}

// The red time bar. `width` goes from 0 to TIME_BAR_MAX.
export function drawTimeBar(ctx, img, width) {
  // The red bar goes behind the image, which has a transparent hole.
  ctx.fillStyle = "#f00";
  ctx.fillRect(322, 29, width, 26);
  ctx.drawImage(img("time"), 320, 25, 157, 34);
}

// Score, lives (with the heart) and time bar of the games that have lives (g needs score, lives, timeLeft).
export function drawLivesHud(ctx, img, g) {
  drawTimeBar(ctx, img, g.timeLeft);
  ctx.drawImage(img("corazon"), EQ_HEART.x, EQ_HEART.y, EQ_HEART.w, EQ_HEART.h);
  drawText(ctx, String(Math.max(0, g.lives)), EQ_LIVES_TEXT.x, EQ_LIVES_TEXT.y, { size: 50, align: "right" });
  drawText(ctx, formatScore(g.score), 20, 10, { size: 50 });
}

// Stars that shrink while they fly away. Their position is the top left corner (as in the old game).
export function drawParticles(ctx, img, particles) {
  const star = img("star");
  for (const p of particles.list) {
    const s = ParticleSystem.scale(p);
    ctx.drawImage(star, p.x, p.y, PARTICLE_SIZE.w * s, PARTICLE_SIZE.h * s);
  }
}

// Small "MENU" button under the cards (it opens the exit dialog).
export function drawMenuButton(ctx) {
  const { x, y, w, h } = BTN_PLAY_MENU;
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  drawText(ctx, "MENU", x + w / 2, y + 2, { size: 34, effect: "none", align: "center" });
}
