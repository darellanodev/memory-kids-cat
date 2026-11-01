// "Sequence" screen: one game with 3 stages (EASY, HARD and EXPERT).
import { img } from "../assets.js";
import { play } from "../audio.js";
import {
  BTN_EXIT_NO,
  BTN_EXIT_YES,
  BTN_PLAY_MENU,
  SEQ_WIN_XP,
  W,
} from "../config.js";
import { addXp } from "../progress.js";
import { createSequenceRenderer } from "../render-sequence.js";
import { SequenceGame } from "../sequence.js";
import { inside } from "../ui.js";

export function createSequenceScene({ ctx, goTo }) {
  const renderer = createSequenceRenderer(ctx, img);
  let game = null;
  let confirmExit = false; // is the dialog "do you really want to exit?" open?
  let rewarded = false; // the experience of the win was already given

  function leave() {
    play("startgame");
    goTo("title");
  }

  return {
    hint: "Watch the animals and repeat the sequence.",
    pausable: true, // main.js pauses it when the page is hidden
    enter() {
      game = new SequenceGame({ sfx: play });
      confirmExit = false;
      rewarded = false;
    },
    update(now) {
      // The game stops while the dialog is open.
      if (confirmExit) return;
      game.update(now);

      // The win gives experience (only a completed game does, as in the old game).
      if (game.phase === "win" && !rewarded) {
        rewarded = true;
        addXp(SEQ_WIN_XP);
      }
      if (game.result) leave();
    },
    draw() {
      if (confirmExit) {
        ctx.drawImage(img("exit"), 0, 0, W, 800);
      } else {
        renderer.draw(game);
      }
    },
    pointerDown(p) {
      if (confirmExit) {
        if (inside(p, BTN_EXIT_YES)) leave();
        else if (inside(p, BTN_EXIT_NO)) {
          play("button");
          confirmExit = false;
        }
        return;
      }
      if (inside(p, BTN_PLAY_MENU)) {
        play("button");
        confirmExit = true;
      } else if (["fail", "timeup", "win"].includes(game.phase)) {
        // Tap to skip the final banner. The win still gives its experience.
        if (game.phase === "win" && !rewarded) {
          rewarded = true;
          addXp(SEQ_WIN_XP);
        }
        leave();
      } else {
        game.tap(p);
      }
    },
    // The Escape key (or the back key) opens the dialog, like the back key of Android did.
    keyDown(e) {
      if (e.key === "Escape") confirmExit = !confirmExit;
    },
  };
}
