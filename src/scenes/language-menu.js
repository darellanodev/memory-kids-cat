// Menu to choose the language of the Languages game. The other slots of the image say "COMING SOON".
import { img } from "../assets.js";
import { play } from "../audio.js";
import { BTN_LANG_BACK, LANGUAGES, W } from "../config.js";
import { inside } from "../ui.js";

export function createLanguageMenuScene({ ctx, goTo }) {
  return {
    hint: "Choose a language.",
    update() {},
    draw() {
      ctx.drawImage(img("menuidiomas"), 0, 0, W, 800);
    },
    pointerDown(p) {
      const language = LANGUAGES.find((l) => inside(p, l.rect));
      if (language) {
        play("button");
        goTo("languages", { extra: { language: language.code } });
      } else if (inside(p, BTN_LANG_BACK)) {
        play("startgame");
        goTo("games");
      }
    },
  };
}
