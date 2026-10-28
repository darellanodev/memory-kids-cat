// Credits screen. The text is part of the image.
import { img } from "../assets.js";
import { play } from "../audio.js";
import { BTN_CREDITS_BACK, W } from "../config.js";
import { inside } from "../ui.js";

export function createCreditsScene({ ctx, goTo }) {
  return {
    hint: "",
    update() {},
    draw() {
      ctx.drawImage(img("creditos"), 0, 0, W, 800);
    },
    pointerDown(p) {
      if (inside(p, BTN_CREDITS_BACK)) {
        play("button");
        goTo("title");
      }
    },
  };
}
