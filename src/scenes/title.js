// Title screen: "TRAIN ME NOW!", sound on/off and credits (the paw).
import { img } from "../assets.js";
import { play, unlockAudio } from "../audio.js";
import { BTN_CREDITS, BTN_PLAY, BTN_SOUND, W } from "../config.js";
import { barFill, levelOf, nextLevelAt } from "../experience.js";
import { getBestScore, getXp, isSoundOn, setSound } from "../progress.js";
import { drawText, formatScore, inside } from "../ui.js";

export function createTitleScene({ ctx, goTo }) {
  // Level, experience points and the bar (the image has a transparent hole to see the bar).
  function drawExperience() {
    const xp = getXp();
    ctx.fillStyle = "rgb(233, 175, 175)";
    ctx.fillRect(175, 510, Math.floor(270 * barFill(xp)), 60);
    ctx.drawImage(img("barraexp"), 26, 467, 447, 143);
    const gray = { gray: 100, effect: "none", dy: 6 };
    drawText(ctx, String(levelOf(xp)), 90, 524, { size: 28, align: "center", ...gray });
    drawText(ctx, String(xp), 310, 524, { size: 28, align: "center", ...gray });
    drawText(ctx, String(nextLevelAt(xp)), 330, 574, { size: 20, ...gray, dy: 5 });
  }

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
      drawExperience();
      // Best score, only if there is one.
      if (getBestScore() > 0) {
        drawText(ctx, `BEST SCORE  ${formatScore(getBestScore())}`, 250, 630, {
          size: 26,
          gray: 100,
          effect: "none",
          align: "center",
          dy: 6,
        });
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
