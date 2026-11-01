// "Languages" screen. The level loop is in levels.js.
// It needs params.extra = { language } when it is started from the menu of languages.
import { LANG_LEVELS, MAP_LANG_POS, THEMES } from "../config.js";
import { LanguagesGame } from "../languages.js";
import { shuffle } from "../random.js";
import { createLanguagesRenderer } from "../render-languages.js";
import { createLevelsScene } from "./levels.js";

export function createLanguagesScene({ ctx, goTo }) {
  return createLevelsScene({
    ctx,
    goTo,
    name: "languages",
    hint: "Find the picture of the word.",
    createGame: (options) => new LanguagesGame(options),
    createRenderer: createLanguagesRenderer,
    // The first 4 themes, in random order. `num` says which pictures and words a level uses.
    getLevels: () => shuffle(THEMES.slice(0, LANG_LEVELS).map((theme, num) => ({ ...theme, num }))),
    map: { image: "mapa_idiomas", positions: MAP_LANG_POS },
  });
}
