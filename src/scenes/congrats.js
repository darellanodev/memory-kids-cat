// "Congratulations" screen: all the levels of the game were completed.
import { img } from "../assets.js";
import { play } from "../audio.js";
import { BTN_CONGRATS_BACK, W } from "../config.js";
import { drawText, formatScore, inside } from "../ui.js";

export function createCongratsScene({ ctx, goTo }) {
  let score = 0;
  return {
    hint: "",
    enter(params = {}) {
      score = params.score || 0;
    },
    update() {},
    draw() {
      ctx.drawImage(img("congratulations"), 0, 0, W, 800);
      drawText(ctx, "SCORE", 240, 240, { size: 45, align: "center" });
      drawText(ctx, formatScore(score), 240, 300, { size: 60, align: "center" });
    },
    pointerDown(p) {
      if (inside(p, BTN_CONGRATS_BACK)) {
        play("button");
        goTo("title");
      }
    },
  };
}
