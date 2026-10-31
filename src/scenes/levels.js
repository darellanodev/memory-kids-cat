// Screen for the games that are played theme after theme (10 levels in random order):
// "make pairs" and "equals". The rules and the drawing are given by each game.
//   A session: level 1 -> map -> level 2 -> map ... -> map -> congratulations.
//   The session ends early with "time is up", "you lost" or the exit dialog.
import { img } from "../assets.js";
import { play } from "../audio.js";
import { BTN_EXIT_NO, BTN_EXIT_YES, BTN_PLAY_MENU, THEMES, W } from "../config.js";
import { addXp, saveScore } from "../progress.js";
import { shuffle } from "../random.js";
import { inside } from "../ui.js";

// name: name of the scene. createGame(options) makes the rules of one level (it gets
// theme, levelNumber, score, lives and sfx). createRenderer(ctx, img) makes the drawing.
export function createLevelsScene({ ctx, goTo, name, hint, createGame, createRenderer }) {
  const renderer = createRenderer(ctx, img);
  let order = []; // themes in random order
  let level = 0; // index in `order`
  let game = null;
  let confirmExit = false; // is the dialog "do you really want to exit?" open?

  function startLevel(score, lives) {
    game = createGame({
      theme: order[level],
      levelNumber: level + 1,
      score,
      lives,
      sfx: play,
    });
  }

  function leave() {
    saveScore(game.score);
    goTo("title");
  }

  return {
    hint,
    // No params: new session. With params { order, level, score, lives }: next level after the map.
    enter(params = {}) {
      order = params.order || shuffle(THEMES);
      level = params.level || 0;
      confirmExit = false;
      startLevel(params.score || 0, params.lives); // undefined lives: the game uses its own
    },
    update(now) {
      // The game stops while the dialog is open.
      if (confirmExit) return;
      game.update(now);

      if (game.result === "complete") {
        // Show the map, and then go to the next level (or to the end of the game).
        const { score, lives } = game;
        const finishedLevel = level;
        goTo("map", {
          level: finishedLevel,
          done: () => {
            if (finishedLevel < order.length - 1) {
              goTo(name, { order, level: finishedLevel + 1, score, lives });
            } else {
              saveScore(score);
              addXp(score); // only a completed game gives experience (as in the old game)
              goTo("congrats", { score });
            }
          },
        });
      } else if (game.result) {
        leave(); // "timeup" or "lost"
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
      } else if (game.over) {
        leave(); // tap to skip the final banner
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
