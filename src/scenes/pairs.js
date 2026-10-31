// "Make pairs" screen. The level loop is in levels.js.
import { PairsGame } from "../pairs.js";
import { createPairsRenderer } from "../render.js";
import { createLevelsScene } from "./levels.js";

export function createPairsScene({ ctx, goTo }) {
  return createLevelsScene({
    ctx,
    goTo,
    name: "pairs",
    hint: "Find the pairs before the time runs out.",
    createGame: (options) => new PairsGame(options),
    createRenderer: createPairsRenderer,
  });
}
