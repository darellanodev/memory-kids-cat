// Draws the "Equals" game on the canvas. It does not change the game state.
import { CARD_SIZE, EQ_CAT, EQ_HEART, EQ_LIVES_TEXT, EQ_MODEL_POS, W, H } from "./config.js";
import { drawBanner, drawMenuButton, drawParticles, drawTimeBar } from "./render-common.js";
import { drawText, formatScore } from "./ui.js";

// `img(name)` returns a loaded image (see assets.js).
export function createEqualsRenderer(ctx, img) {
  // One picture of the sprite sheet of the theme (10 pictures one under another).
  function drawPicture(theme, id, x, y) {
    ctx.drawImage(img(`cartas_${theme.key}`), 0, id * CARD_SIZE, CARD_SIZE, CARD_SIZE, x, y, CARD_SIZE, CARD_SIZE);
  }

  return {
    draw(g) {
      ctx.drawImage(img(`fondo_${g.theme.key}`), 0, 0, W, H);
      for (const card of g.cards) {
        if (card.state === "down") ctx.drawImage(img("carta_tapada"), card.x, card.y, CARD_SIZE, CARD_SIZE);
        else drawPicture(g.theme, card.id, card.x, card.y);
      }
      if (g.showLookText) drawText(ctx, "LOOK AT THE PICTURES", 35, 16, { size: 38 });

      // The cat, with the model card in the speech bubble.
      if (g.showModel) {
        ctx.drawImage(img("gato_equals"), EQ_CAT.x, EQ_CAT.y, EQ_CAT.w, EQ_CAT.h);
        drawPicture(g.theme, g.model, EQ_MODEL_POS.x, EQ_MODEL_POS.y);
      }
      if (g.showFailIcon) ctx.drawImage(img("incorrecto"), g.failedCard.x, g.failedCard.y, 112, 112);

      if (g.showHud) {
        drawTimeBar(ctx, img, g.timeLeft);
        ctx.drawImage(img("corazon"), EQ_HEART.x, EQ_HEART.y, EQ_HEART.w, EQ_HEART.h);
        drawText(ctx, String(Math.max(0, g.lives)), EQ_LIVES_TEXT.x, EQ_LIVES_TEXT.y, { size: 50, align: "right" });
        drawText(ctx, formatScore(g.score), 20, 10, { size: 50 });
      }
      drawMenuButton(ctx);
      drawBanner(ctx, img, g);
      drawParticles(ctx, img, g.particles);
    },
  };
}
