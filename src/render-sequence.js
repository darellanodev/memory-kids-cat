// Draws the "Sequence" game on the canvas. It does not change the game state.
import { CARD_SIZE, SEQ_THEME, W, H } from "./config.js";
import { drawBanner, drawMenuButton, drawParticles, drawTimeBar } from "./render-common.js";
import { drawText } from "./ui.js";

// `img(name)` returns a loaded image (see assets.js).
export function createSequenceRenderer(ctx, img) {
  // Cards that were just played are bigger and keep their center.
  function drawCard(g, card) {
    const size = g.cardSize(card);
    const offset = (size - CARD_SIZE) / 2;
    ctx.drawImage(
      img(`cartas_${SEQ_THEME}`),
      0,
      card.id * CARD_SIZE,
      CARD_SIZE,
      CARD_SIZE,
      card.x - offset,
      card.y - offset,
      size,
      size,
    );
  }

  return {
    draw(g) {
      ctx.drawImage(img(`fondo_${SEQ_THEME}`), 0, 0, W, H);
      g.cards.forEach((card) => drawCard(g, card));

      const text = g.observeText;
      if (text) drawText(ctx, text, 35, 16, { size: 38 });
      // Number of animals played so far, in the center of the screen.
      if (g.phase === "observing" && g.pointer > 0)
        drawText(ctx, String(g.pointer), 250, 270, { size: 100, gray: 90, effect: "glow", align: "center" });

      if (g.phase === "playing") {
        drawTimeBar(ctx, img, g.timeLeft);
        drawText(ctx, "REPEAT IT!", 20, 15, { size: 38 });
      }
      if (g.showFailIcon) ctx.drawImage(img("incorrecto"), g.failedCard.x, g.failedCard.y, 112, 112);

      drawMenuButton(ctx);
      drawBanner(ctx, img, g);
      drawParticles(ctx, img, g.particles);
    },
  };
}
