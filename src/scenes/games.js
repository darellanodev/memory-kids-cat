// Menu to choose the game. Only "make pairs" is ported so far: the others say "SOON".
import { img } from "../assets.js";
import { play } from "../audio.js";
import {
  BTN_BACK,
  GAME_EQUALS,
  GAME_LANGUAGES,
  GAME_PAIRS,
  GAME_SEQUENCE,
  W,
} from "../config.js";
import { drawText, inside } from "../ui.js";

const SOON = [GAME_SEQUENCE, GAME_LANGUAGES, GAME_EQUALS];

export function createGamesScene({ ctx, goTo }) {
  return {
    hint: "Choose a game.",
    update() {},
    draw() {
      ctx.drawImage(img("menugames"), 0, 0, W, 800);
      // Cover the games that are not ported yet.
      for (const r of SOON) {
        ctx.fillStyle = "rgba(230, 230, 230, 0.93)";
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 12);
        ctx.fill();
        drawText(ctx, "SOON", r.x + r.w / 2, r.y + r.h / 2 - 30, {
          size: 44,
          gray: 130,
          effect: "none",
          align: "center",
        });
      }
    },
    pointerDown(p) {
      if (inside(p, GAME_PAIRS)) {
        play("button");
        goTo("pairs");
      } else if (inside(p, BTN_BACK)) {
        goTo("title");
      }
    },
  };
}
