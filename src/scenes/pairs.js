// "Make pairs" screen: plays all the themes one after another, in random order.
// A session is: level 1 (first theme), level 2... until the last theme, or "time is up".
import { img } from "../assets.js";
import { play } from "../audio.js";
import {
  BTN_EXIT_NO,
  BTN_EXIT_YES,
  BTN_PLAY_MENU,
  THEMES,
  W,
} from "../config.js";
import { PairsGame, shuffle } from "../pairs.js";
import { saveScore } from "../progress.js";
import { createPairsRenderer } from "../render.js";
import { inside } from "../ui.js";

export function createPairsScene({ ctx, goTo }) {
  const renderer = createPairsRenderer(ctx, img);
  let order = []; // themes in random order
  let level = 0; // index in `order`
  let game = null;
  let confirmExit = false; // is the dialog "do you really want to exit?" open?

  function startLevel(score) {
    game = new PairsGame({
      theme: order[level],
      levelNumber: level + 1,
      score,
      sfx: play,
    });
  }

  function leave() {
    saveScore(game.score);
    goTo("title");
  }

  return {
    hint: "Find the pairs before the time runs out.",
    // No params: new session. With params { order, level, score }: next level after the map.
    enter(params = {}) {
      order = params.order || shuffle(THEMES);
      level = params.level || 0;
      confirmExit = false;
      startLevel(params.score || 0);
    },
    update(now) {
      // The game stops while the dialog is open.
      if (confirmExit) return;
      game.update(now);

      if (game.result === "complete") {
        // Show the map, and then go to the next level (or to the end of the game).
        const { score } = game;
        const finishedLevel = level;
        goTo("map", {
          level: finishedLevel,
          done: () => {
            if (finishedLevel < order.length - 1) {
              goTo("pairs", { order, level: finishedLevel + 1, score });
            } else {
              saveScore(score);
              goTo("congrats", { score });
            }
          },
        });
      } else if (game.result === "timeup") {
        leave();
      }
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
        if (inside(p, BTN_EXIT_YES)) {
          play("startgame");
          leave();
        } else if (inside(p, BTN_EXIT_NO)) {
          play("button");
          confirmExit = false;
        }
        return;
      }
      if (inside(p, BTN_PLAY_MENU)) {
        play("button");
        confirmExit = true;
      } else if (game.phase === "timeup") {
        leave(); // tap to skip the "TIME IS UP" banner
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
