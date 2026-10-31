// Draws the "make pairs" game on the canvas. It does not change the game state.
import { CARD_SIZE, BTN_PLAY_MENU, PARTICLE_SIZE, W, H } from "./config.js";
import { ParticleSystem } from "./particles.js";
import { drawText, formatScore } from "./ui.js";

// `img(name)` returns a loaded image (see assets.js).
export function createPairsRenderer(ctx, img) {
  function drawCard(card, theme) {
    if (card.state === "down") {
      ctx.drawImage(img("carta_tapada"), card.x, card.y, CARD_SIZE, CARD_SIZE);
    } else {
      // The picture is one slice of the sprite sheet of the theme: 10 pictures one under another.
      ctx.drawImage(
        img(`cartas_${theme.key}`),
        0,
        card.id * CARD_SIZE,
        CARD_SIZE,
        CARD_SIZE,
        card.x,
        card.y,
        CARD_SIZE,
        CARD_SIZE,
      );
    }
  }

  function drawBanner(g) {
    const y = g.bannerY;
    if (y === null) return;
    ctx.drawImage(img("cartel"), 0, y, 490, 260);
    const { title, subtitle } = g.banner;
    if (subtitle === "") {
      drawText(ctx, title, 245, y + 135, { size: 50, gray: 40, effect: "glow", align: "center", baseline: "alphabetic" });
    } else {
      drawText(ctx, title, 245, y + 105, { size: 50, gray: 40, effect: "glow", align: "center", baseline: "alphabetic" });
      drawText(ctx, subtitle, 245, y + 165, { size: 30, gray: 40, effect: "glow", align: "center", baseline: "alphabetic" });
    }
  }

  function drawHud(g) {
    drawText(ctx, formatScore(g.score), 20, 10, { size: 50 });
    // The red bar goes behind the image, which has a transparent hole.
    ctx.fillStyle = "#f00";
    ctx.fillRect(322, 29, g.timeLeft, 26);
    ctx.drawImage(img("time"), 320, 25, 157, 34);
  }

  // Stars that shrink while they fly away. Their position is the top left corner (as in the old game).
  function drawParticles(g) {
    const star = img("star");
    for (const p of g.particles.list) {
      const s = ParticleSystem.scale(p);
      ctx.drawImage(star, p.x, p.y, PARTICLE_SIZE.w * s, PARTICLE_SIZE.h * s);
    }
  }

  function drawMenuButton() {
    const { x, y, w, h } = BTN_PLAY_MENU;
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    drawText(ctx, "MENU", x + w / 2, y + 2, { size: 34, effect: "none", align: "center" });
  }

  return {
    draw(g) {
      ctx.drawImage(img(`fondo_${g.theme.key}`), 0, 0, W, H);
      g.cards.forEach((card) => drawCard(card, g.theme));
      if (g.showLookText)
        drawText(ctx, "LOOK AT THE PICTURES", 35, 16, { size: 38 });
      if (g.showHud) drawHud(g);
      drawMenuButton();
      drawBanner(g);
      drawParticles(g);
    },
  };
}
