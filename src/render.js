// Draws the "make pairs" game on the canvas. It does not change the game state.
import { CARD_SIZE, W, H } from "./config.js";
import { drawBanner, drawMenuButton, drawParticles, drawTimeBar } from "./render-common.js";
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

  return {
    draw(g) {
      ctx.drawImage(img(`fondo_${g.theme.key}`), 0, 0, W, H);
      g.cards.forEach((card) => drawCard(card, g.theme));
      if (g.showLookText)
        drawText(ctx, "LOOK AT THE PICTURES", 35, 16, { size: 38 });
      if (g.showHud) {
        drawText(ctx, formatScore(g.score), 20, 10, { size: 50 });
        drawTimeBar(ctx, img, g.timeLeft);
      }
      drawMenuButton(ctx);
      drawBanner(ctx, img, g);
      drawParticles(ctx, img, g.particles);
    },
  };
}
