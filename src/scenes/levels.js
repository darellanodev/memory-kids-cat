// Screen for the games that are played theme after theme (10 levels in random order):
// "make pairs" and "equals". The rules and the drawing are given by each game.
//   A session: level 1 -> map -> level 2 -> map ... -> map -> congratulations.
//   The session ends early with "time is up", "you lost" or the exit dialog.
import { img } from "../assets.js";
import { play } from "../audio.js";
import { BTN_EXIT_NO, BTN_EXIT_YES, BTN_PLAY_MENU, MAP_POS, THEMES, W } from "../config.js";
import { addXp, saveScore } from "../progress.js";
import { shuffle } from "../random.js";
import { inside } from "../ui.js";

// name: name of the scene. createGame(options) makes the rules of one level (it gets
// theme, levelNumber, score, lives, sfx and the `extra` of the session). createRenderer(ctx, img)
// makes the drawing.
// getLevels(): the levels of a new session in the order to play (default: the 10 themes, shuffled).
// map: { image, positions } of the map shown between levels (default: the map of the themes).
export function createLevelsScene({
  ctx,
  goTo,
  name,
  hint,
  createGame,
  createRenderer,
  getLevels = () => shuffle(THEMES),
  map = { image: "mapa", positions: MAP_POS },
}) {
  const renderer = createRenderer(ctx, img);
  let order = []; // levels in the order to play
  let level = 0; // index in `order`
  let extra = {}; // settings of the session that the game needs (for example the language)
  let game = null;
  let confirmExit = false; // is the dialog "do you really want to exit?" open?

  function startLevel(score, lives) {
    game = createGame({
      theme: order[level],
      levelNumber: level + 1,
      score,
      lives,
      sfx: play,
      ...extra,
    });
  }

  function leave() {
    saveScore(game.score);
    goTo("title");
  }

  return {
    hint,
    pausable: true, // main.js pauses it when the page is hidden
    // New session: no params (or params.extra with the settings of the session).
    // Next level after the map: params { order, level, score, lives, extra }.
    enter(params = {}) {
      order = params.order || getLevels();
      level = params.level || 0;
      extra = params.extra || {};
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
          ...map,
          level: finishedLevel,
          done: () => {
            if (finishedLevel < order.length - 1) {
              goTo(name, { order, level: finishedLevel + 1, score, lives, extra });
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
