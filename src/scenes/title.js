// Title screen: "TRAIN ME NOW!", sound on/off and credits (the paw).
import { img } from "../assets.js";
import { play, unlockAudio } from "../audio.js";
import { BTN_CREDITS, BTN_PLAY, BTN_SOUND, W } from "../config.js";
import { getBestScore, isSoundOn, setSound } from "../progress.js";
import { drawText, formatScore, inside } from "../ui.js";

export function createTitleScene({ ctx, goTo }) {
  return {
    hint: "",
    // params.silent: do not play the start sound (the browser would not allow it yet).
    enter(params = {}) {
      if (!params.silent) play("startgame");
    },
    update() {},
    draw() {
      ctx.drawImage(img("menu"), 0, 0, W, 800);
      const sound = img(isSoundOn() ? "btnsonidoon" : "btnsonidooff");
      ctx.drawImage(sound, BTN_SOUND.x, BTN_SOUND.y, BTN_SOUND.w, BTN_SOUND.h);
      // Best score, only if there is one.
      if (getBestScore() > 0) {
        drawText(ctx, "BEST SCORE", 250, 440, { size: 30, gray: 120, effect: "none", align: "center" });
        drawText(ctx, formatScore(getBestScore()), 250, 480, { size: 50, gray: 0, effect: "glow", align: "center" });
      }
    },
    pointerDown(p) {
      unlockAudio();
      if (inside(p, BTN_PLAY)) {
        play("button");
        goTo("games");
      } else if (inside(p, BTN_CREDITS)) {
        play("button");
        goTo("credits");
      } else if (inside(p, BTN_SOUND)) {
        // The sound changes first, so the "on" tap makes the sound and the "off" tap does not.
        setSound(!isSoundOn());
        play("button");
      }
    },
  };
}
