// "Equals" screen. The level loop is in levels.js.
import { EqualsGame } from "../equals.js";
import { createEqualsRenderer } from "../render-equals.js";
import { createLevelsScene } from "./levels.js";

export function createEqualsScene({ ctx, goTo }) {
  return createLevelsScene({
    ctx,
    goTo,
    name: "equals",
    hint: "Find all the cards that are like the one of the cat.",
    createGame: (options) => new EqualsGame(options),
    createRenderer: createEqualsRenderer,
  });
}
