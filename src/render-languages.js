// Draws the "Languages" game on the canvas. It does not change the game state.
import {
  CARD_SIZE,
  LANG_CAT,
  LANG_WORD_BIG,
  LANG_WORD_SMALL,
  W,
  H,
} from "./config.js";
import { drawBanner, drawLivesHud, drawMenuButton, drawParticles } from "./render-common.js";
import { drawText } from "./ui.js";

const WORD_W = 460; // size of one word in the sprite sheet of the words
const WORD_H = 113;

// `img(name)` returns a loaded image (see assets.js).
export function createLanguagesRenderer(ctx, img) {
  return {
    draw(g) {
      const { num, key } = g.theme;
      const pictures = img(`cartas_language${num}`); // 6 pictures one under another
      const words = img(`cartas_lang_${g.language}${num}`); // 6 words one under another
      const word = (id, x, y, w, h) =>
        ctx.drawImage(words, 0, id * WORD_H, WORD_W, WORD_H, x, y, w, h);

      ctx.drawImage(img(`fondo_${key}`), 0, 0, W, H);
      for (const card of g.cards) {
        ctx.drawImage(pictures, 0, card.id * CARD_SIZE, CARD_SIZE, CARD_SIZE, card.x, card.y, CARD_SIZE, CARD_SIZE);
        if (g.wordVisible(card))
          word(card.id, card.x + LANG_WORD_SMALL.dx, card.y + LANG_WORD_SMALL.dy, LANG_WORD_SMALL.w, LANG_WORD_SMALL.h);
      }
      if (g.showLookText) drawText(ctx, "LOOK AT THE PICTURES", 35, 16, { size: 38 });

      // The word to find, and the cat on top of it.
      if (g.showCatWord) {
        word(g.found, LANG_WORD_BIG.x, LANG_WORD_BIG.y, LANG_WORD_BIG.w, LANG_WORD_BIG.h);
        ctx.drawImage(img("gato_idioma"), LANG_CAT.x, LANG_CAT.y, LANG_CAT.w, LANG_CAT.h);
      }
      if (g.showFailIcon) ctx.drawImage(img("incorrecto"), g.failedCard.x, g.failedCard.y, 112, 112);

      if (g.showHud) drawLivesHud(ctx, img, g);
      drawMenuButton(ctx);
      drawBanner(ctx, img, g);
      drawParticles(ctx, img, g.particles);
    },
  };
}
