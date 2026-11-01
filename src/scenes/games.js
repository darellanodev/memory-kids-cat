// Menu to choose the game.
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
import { inside } from "../ui.js";

export function createGamesScene({ ctx, goTo }) {
  return {
    hint: "Choose a game.",
    update() {},
    draw() {
      ctx.drawImage(img("menugames"), 0, 0, W, 800);
    },
    pointerDown(p) {
      if (inside(p, GAME_PAIRS)) {
        play("button");
        goTo("pairs");
      } else if (inside(p, GAME_SEQUENCE)) {
        play("button");
        goTo("sequence");
      } else if (inside(p, GAME_EQUALS)) {
        play("button");
        goTo("equals");
      } else if (inside(p, GAME_LANGUAGES)) {
        play("button");
        goTo("languageMenu");
      } else if (inside(p, BTN_BACK)) {
        goTo("title");
      }
    },
  };
}
