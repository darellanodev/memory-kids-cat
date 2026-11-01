// Map between levels: the cat walks from the place of the finished level to the next one.
// Tap to skip the walk. When it ends, params.done() is called.
import { img } from "../assets.js";
import { MAP_END_WAIT, MAP_POS, MAP_WALK_TIME, W } from "../config.js";
import { quadInOut, tween } from "../tween.js";

export function createMapScene({ ctx }) {
  let image = "mapa";
  let from = MAP_POS[0];
  let to = MAP_POS[1];
  let done = () => {};
  let start = null; // time of the first frame of the walk
  let finished = false;

  function elapsed(now) {
    return start === null ? 0 : now - start;
  }
  let lastNow = 0;

  function finish() {
    if (finished) return;
    finished = true;
    done();
  }

  return {
    hint: "Tap to skip.",
    pausable: true, // main.js pauses it when the page is hidden
    // params.level: index of the level that was just completed.
    // params.image and params.positions: the map of the game (the map of the themes by default).
    enter(params = {}) {
      const level = params.level ?? 0;
      const positions = params.positions || MAP_POS;
      image = params.image || "mapa";
      from = positions[level];
      to = positions[level + 1];
      done = params.done || (() => {});
      start = null;
      finished = false;
    },
    update(now) {
      lastNow = now;
      if (start === null) start = now;
      if (elapsed(now) >= MAP_WALK_TIME + MAP_END_WAIT) finish();
    },
    draw() {
      const e = elapsed(lastNow);
      const x = tween(from.x, to.x, e, MAP_WALK_TIME, quadInOut);
      const y = tween(from.y, to.y, e, MAP_WALK_TIME, quadInOut);
      ctx.drawImage(img(image), 0, 0, W, 800);
      ctx.drawImage(img("mapa_gato"), x - 20, y - 15, 41, 38);
    },
    pointerDown() {
      finish();
    },
  };
}
