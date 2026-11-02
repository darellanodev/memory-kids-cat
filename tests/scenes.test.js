// Tests of the screens and of the flow between them, as the player would use them.
// The images and the sounds are replaced by simple fakes: no browser is needed.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/assets.js", () => ({ img: (name) => ({ name }) }));
vi.mock("../src/audio.js", () => ({
  play: vi.fn(),
  stopAll: vi.fn(),
  unlockAudio: vi.fn(),
  loadSounds: vi.fn(),
}));

import { play } from "../src/audio.js";
import {
  BTN_BACK,
  BTN_CONGRATS_BACK,
  BTN_CREDITS,
  BTN_CREDITS_BACK,
  BTN_EXIT_NO,
  BTN_EXIT_YES,
  BTN_LANG_BACK,
  BTN_PLAY,
  BTN_PLAY_MENU,
  BTN_SOUND,
  GAME_EQUALS,
  GAME_LANGUAGES,
  GAME_PAIRS,
  GAME_SEQUENCE,
  LANG_LEVELS,
  LANGUAGES,
  MAP_LANG_POS,
  MAP_POS,
  MAP_WALK_TIME,
  POINTS_MATCH,
  SEQ_WIN_XP,
  THEMES,
} from "../src/config.js";
import { EqualsGame } from "../src/equals.js";
import { LanguagesGame } from "../src/languages.js";
import { PairsGame } from "../src/pairs.js";
import { getBestScore, getXp, isSoundOn } from "../src/progress.js";
import { SequenceGame } from "../src/sequence.js";
import { createCongratsScene } from "../src/scenes/congrats.js";
import { createCreditsScene } from "../src/scenes/credits.js";
import { createEqualsScene } from "../src/scenes/equals.js";
import { createGamesScene } from "../src/scenes/games.js";
import { createLanguageMenuScene } from "../src/scenes/language-menu.js";
import { createLanguagesScene } from "../src/scenes/languages.js";
import { createMapScene } from "../src/scenes/map.js";
import { createPairsScene } from "../src/scenes/pairs.js";
import { createSequenceScene } from "../src/scenes/sequence.js";
import { createTitleScene } from "../src/scenes/title.js";
import { centerOf } from "./helpers.js";

const center = (rect) => ({ x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 });

// A small version of main.js: it keeps the current scene, changes it with goTo() and moves the time.
function createApp() {
  const ctx = { drawImage: vi.fn() };
  const visited = []; // names of the scenes, in order
  const params = {}; // params that each scene received
  const scenes = {};
  let current = null;
  let now = 0;
  const goTo = (name, p) => {
    visited.push(name);
    (params[name] ??= []).push(p);
    current = scenes[name];
    if (current.enter) current.enter(p);
  };
  Object.assign(scenes, {
    title: createTitleScene({ ctx, goTo }),
    games: createGamesScene({ ctx, goTo }),
    credits: createCreditsScene({ ctx, goTo }),
    congrats: createCongratsScene({ ctx, goTo }),
    map: createMapScene({ ctx }),
    pairs: createPairsScene({ ctx, goTo }),
    equals: createEqualsScene({ ctx, goTo }),
    languageMenu: createLanguageMenuScene({ ctx, goTo }),
    languages: createLanguagesScene({ ctx, goTo }),
    sequence: createSequenceScene({ ctx, goTo }),
  });
  const app = {
    ctx,
    scenes,
    visited,
    params,
    goTo,
    get current() {
      return current;
    },
    tap: (p) => current.pointerDown(p),
    step(ms) {
      for (let t = 0; t < ms; t += 16) {
        now += 16;
        current.update(now);
      }
    },
    until(condition, limit = 200000) {
      let spent = 0;
      while (!condition()) {
        if (spent >= limit) throw new Error("The condition was not true after " + limit + " ms");
        now += 16;
        spent += 16;
        current.update(now);
      }
    },
  };
  return app;
}

// The game that the current scene is running (it is read when the scene updates it).
let live = null;
const spies = [];
beforeEach(() => {
  live = null;
  for (const Game of [PairsGame, EqualsGame, LanguagesGame, SequenceGame]) {
    const original = Game.prototype.update;
    spies.push(
      vi.spyOn(Game.prototype, "update").mockImplementation(function (now) {
        live = this;
        return original.call(this, now);
      }),
    );
  }
});
afterEach(() => {
  spies.splice(0).forEach((s) => s.mockRestore());
  vi.clearAllMocks();
});

describe("menus", () => {
  it("title: play goes to the games menu, the paw to the credits", () => {
    const app = createApp();
    app.goTo("title", { silent: true });
    app.tap(center(BTN_PLAY));
    app.goTo("title");
    app.tap(center(BTN_CREDITS));
    expect(app.visited).toEqual(["title", "games", "title", "credits"]);
  });

  it("title: the sound button turns the sound off and on", () => {
    const app = createApp();
    app.goTo("title", { silent: true });
    const before = isSoundOn();
    app.tap(center(BTN_SOUND));
    expect(isSoundOn()).toBe(!before);
    app.tap(center(BTN_SOUND));
    expect(isSoundOn()).toBe(before);
  });

  it("title: the start sound plays when coming back, but not when the game starts", () => {
    const app = createApp();
    app.goTo("title", { silent: true });
    expect(play).not.toHaveBeenCalledWith("startgame");
    app.goTo("title");
    expect(play).toHaveBeenCalledWith("startgame");
  });

  it("title: a tap in an empty place does nothing", () => {
    const app = createApp();
    app.goTo("title", { silent: true });
    app.tap({ x: 250, y: 100 });
    expect(app.visited).toEqual(["title"]);
  });

  it.each([
    ["pairs", GAME_PAIRS],
    ["sequence", GAME_SEQUENCE],
    ["equals", GAME_EQUALS],
    ["languageMenu", GAME_LANGUAGES],
  ])("games menu: the button of %s opens it", (name, button) => {
    const app = createApp();
    app.goTo("games");
    app.tap(center(button));
    expect(app.visited.at(-1)).toBe(name);
  });

  it("games menu: the back arrow goes to the title", () => {
    const app = createApp();
    app.goTo("games");
    app.tap(center(BTN_BACK));
    expect(app.visited).toEqual(["games", "title"]);
  });

  it("credits and congratulations go back to the title", () => {
    const app = createApp();
    app.goTo("credits");
    app.tap(center(BTN_CREDITS_BACK));
    app.goTo("congrats", { score: 100 });
    app.tap(center(BTN_CONGRATS_BACK));
    expect(app.visited).toEqual(["credits", "title", "congrats", "title"]);
  });

  it.each(LANGUAGES.map((l) => [l.code, l.rect]))("language menu: %s starts the game in that language", (code, rect) => {
    const app = createApp();
    app.goTo("languageMenu");
    app.tap(center(rect));
    expect(app.visited).toEqual(["languageMenu", "languages"]);
    expect(app.params.languages[0]).toEqual({ extra: { language: code } });
  });

  it("language menu: a slot that says COMING SOON does nothing and the back arrow goes to the games", () => {
    const app = createApp();
    app.goTo("languageMenu");
    app.tap({ x: 250, y: 400 });
    expect(app.visited).toEqual(["languageMenu"]);
    app.tap(center(BTN_LANG_BACK));
    expect(app.visited).toEqual(["languageMenu", "games"]);
  });

  it("only the screens with time can be paused", () => {
    const app = createApp();
    const pausable = Object.entries(app.scenes).filter(([, s]) => s.pausable).map(([n]) => n).sort();
    expect(pausable).toEqual(["equals", "languages", "map", "pairs", "sequence"]);
  });
});

// Plays a whole level well, for each game.
const perfect = {
  pairs: (g, tap) => {
    for (let id = 0; id < 10; id++) g.cards.filter((c) => c.id === id).forEach(tap);
  },
  equals: (g, tap) => g.cards.filter((c) => c.id === g.model).forEach(tap),
  languages: (g, tap) => {
    for (let id = 0; id < 6; id++) tap(g.cards.find((c) => c.id === id));
  },
};

// Plays `levels` levels of a game, with the map between them, until the last map.
function playSession(app, name, levels, { beforeTaps } = {}) {
  const tap = (card) => app.tap(centerOf(card));
  const games = [];
  for (let level = 1; level <= levels; level++) {
    app.until(() => app.current === app.scenes[name] && live?.levelNumber === level && live.phase === "playing");
    games.push({ ...live }); // a picture of the game when the level starts (the game goes on changing)
    if (beforeTaps) beforeTaps(level, live, tap);
    perfect[name](live, tap);
    app.until(() => app.current === app.scenes.map);
    app.tap({ x: 5, y: 5 }); // skip the walk of the cat
  }
  return games;
}

describe("Make pairs: a whole game", () => {
  it("10 levels of different themes, with the map between them, and the experience at the end", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("pairs");
    const games = playSession(app, "pairs", 10);
    expect(app.visited.filter((n) => n === "map")).toHaveLength(10);
    expect(app.visited.slice(0, 5)).toEqual(["pairs", "map", "pairs", "map", "pairs"]);
    expect(app.visited.at(-1)).toBe("congrats");
    expect(new Set(games.map((g) => g.theme.key)).size).toBe(10);
    expect(games.map((g) => g.levelNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(app.params.congrats[0].score).toBe(10 * 10 * POINTS_MATCH);
    expect(getXp() - xp).toBe(10 * 10 * POINTS_MATCH);
    expect(getBestScore()).toBeGreaterThanOrEqual(10 * 10 * POINTS_MATCH);
  });

  it("the score of a level goes on to the next one", () => {
    const app = createApp();
    app.goTo("pairs");
    const games = playSession(app, "pairs", 3);
    expect(games.map((g) => g.score)).toEqual([0, 250, 500]); // the score at the start of each level
  });

  it("the map shows the place of the level that was finished", () => {
    const app = createApp();
    app.goTo("pairs");
    playSession(app, "pairs", 2);
    expect(app.params.map.map((p) => p.level)).toEqual([0, 1]);
    expect(app.params.map[0]).toMatchObject({ image: "mapa", positions: MAP_POS });
  });

  it("when the time is up the game goes back to the title and gives no experience", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("pairs");
    app.until(() => live?.phase === "playing");
    app.until(() => app.current === app.scenes.title);
    expect(app.visited).toEqual(["pairs", "title"]);
    expect(getXp()).toBe(xp);
  });

  it("a tap skips the TIME IS UP banner", () => {
    const app = createApp();
    app.goTo("pairs");
    app.until(() => live?.phase === "timeup");
    app.tap({ x: 250, y: 400 });
    expect(app.visited).toEqual(["pairs", "title"]);
  });

  describe("the exit dialog", () => {
    it("the MENU button stops the game, NO goes on with it", () => {
      const app = createApp();
      app.goTo("pairs");
      app.until(() => live?.phase === "playing");
      app.tap(center(BTN_PLAY_MENU));
      const clock = live.clock;
      app.step(3000);
      expect(live.clock).toBe(clock); // the game does not run behind the dialog
      app.tap(center(BTN_EXIT_NO));
      app.step(500);
      expect(live.clock).toBeGreaterThan(clock);
      expect(app.visited).toEqual(["pairs"]);
    });

    it("YES goes to the title without experience", () => {
      const app = createApp();
      const xp = getXp();
      app.goTo("pairs");
      app.until(() => live?.phase === "playing");
      app.tap(center(BTN_PLAY_MENU));
      app.tap(center(BTN_EXIT_YES));
      expect(app.visited).toEqual(["pairs", "title"]);
      expect(getXp()).toBe(xp);
    });

    it("the Escape key opens and closes the dialog", () => {
      const app = createApp();
      app.goTo("pairs");
      app.until(() => live?.phase === "playing");
      app.current.keyDown({ key: "Escape" });
      const clock = live.clock;
      app.step(500);
      expect(live.clock).toBe(clock);
      app.current.keyDown({ key: "Escape" });
      app.step(500);
      expect(live.clock).toBeGreaterThan(clock);
      app.current.keyDown({ key: "a" }); // other keys do nothing
      app.step(100);
      expect(app.visited).toEqual(["pairs"]);
    });

    it("the taps on the cards are not used while the dialog is open", () => {
      const app = createApp();
      app.goTo("pairs");
      app.until(() => live?.phase === "playing");
      app.tap(center(BTN_PLAY_MENU));
      app.tap(centerOf(live.cards[0]));
      expect(live.cards[0].state).toBe("down");
    });
  });
});

describe("Equals: a whole game", () => {
  it("10 levels, and the lives and the score go on from one level to the next", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("equals");
    const games = playSession(app, "equals", 10, {
      // a mistake in the first level
      beforeTaps: (level, g, tap) => level === 1 && tap(g.cards.find((c) => c.id !== g.model)),
    });
    expect(games[0].lives).toBe(3); // at the start of the first level
    expect(games[1].lives).toBe(2); // one mistake in the first level
    expect(games[9].lives).toBe(2);
    expect(games[1].score).toBe(6 * POINTS_MATCH); // the mistake cost nothing: the score was 0
    expect(app.visited.at(-1)).toBe("congrats");
    expect(getXp() - xp).toBe(10 * 6 * POINTS_MATCH);
  });

  it("losing all the lives goes back to the title without experience", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("equals");
    app.until(() => live?.phase === "playing");
    const wrong = live.cards.filter((c) => c.id !== live.model);
    for (let i = 0; i < 4; i++) app.tap(centerOf(wrong[i]));
    expect(live.phase).toBe("lost");
    app.until(() => app.current === app.scenes.title);
    expect(app.visited).toEqual(["equals", "title"]);
    expect(getXp()).toBe(xp);
  });
});

describe("Languages: a whole game", () => {
  it("4 levels with its own map, always in the language that was chosen", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("languageMenu");
    app.tap(center(LANGUAGES[1].rect)); // Spanish
    const games = playSession(app, "languages", LANG_LEVELS);
    expect(games.every((g) => g.language === "es")).toBe(true);
    expect(games.map((g) => g.theme.num).sort()).toEqual([0, 1, 2, 3]);
    expect(app.params.map).toHaveLength(LANG_LEVELS);
    expect(app.params.map.every((p) => p.image === "mapa_idiomas" && p.positions === MAP_LANG_POS)).toBe(true);
    expect(app.visited.at(-1)).toBe("congrats");
    expect(getXp() - xp).toBe(LANG_LEVELS * 6 * POINTS_MATCH);
  });

  it("uses the themes of the first 4 levels", () => {
    const app = createApp();
    app.goTo("languages", { extra: { language: "en" } });
    app.until(() => live?.phase === "playing");
    expect(THEMES.slice(0, LANG_LEVELS).map((t) => t.key)).toContain(live.theme.key);
  });
});

describe("Sequence: a whole game", () => {
  const repeat = (app) => {
    for (let i = 0, n = live.length; i < n; i++) app.tap(centerOf(live.cards[live.sequence[i]]));
  };

  it("winning gives 1000 experience points, once", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("sequence");
    while (live?.phase !== "win") {
      app.until(() => live?.phase === "playing" || live?.phase === "win");
      if (live.phase === "playing") repeat(app);
    }
    app.step(32); // the scene gives the experience in the next frame
    expect(getXp() - xp).toBe(SEQ_WIN_XP);
    app.until(() => app.current === app.scenes.title);
    expect(getXp() - xp).toBe(SEQ_WIN_XP);
  });

  it("a tap on the YOU WIN banner skips it and still gives the experience", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("sequence");
    while (live?.phase !== "win") {
      app.until(() => live?.phase === "playing" || live?.phase === "win");
      if (live.phase === "playing") repeat(app);
    }
    app.tap({ x: 250, y: 400 });
    expect(app.visited).toEqual(["sequence", "title"]);
    expect(getXp() - xp).toBe(SEQ_WIN_XP);
  });

  it("a mistake goes back to the title without experience", () => {
    const app = createApp();
    const xp = getXp();
    app.goTo("sequence");
    app.until(() => live?.phase === "playing");
    app.tap(centerOf(live.cards[(live.sequence[0] + 1) % 6]));
    expect(live.phase).toBe("fail");
    app.until(() => app.current === app.scenes.title);
    expect(getXp()).toBe(xp);
  });

  it("the exit dialog works here too", () => {
    const app = createApp();
    app.goTo("sequence");
    app.until(() => live?.phase === "playing");
    app.tap(center(BTN_PLAY_MENU));
    app.tap(center(BTN_EXIT_YES));
    expect(app.visited).toEqual(["sequence", "title"]);
  });
});

describe("map", () => {
  function createMap(params) {
    const ctx = { drawImage: vi.fn() };
    const map = createMapScene({ ctx });
    const done = vi.fn();
    map.enter({ level: 0, ...params, done });
    let now = 0;
    return {
      ctx,
      map,
      done,
      step(ms) {
        for (let t = 0; t < ms; t += 16) map.update((now += 16));
      },
    };
  }

  it("the cat walks for 3 seconds and then the game goes on, once", () => {
    const m = createMap();
    m.step(MAP_WALK_TIME - 200);
    expect(m.done).not.toHaveBeenCalled();
    m.step(1500);
    expect(m.done).toHaveBeenCalledTimes(1);
    m.step(3000);
    expect(m.done).toHaveBeenCalledTimes(1);
  });

  it("a tap skips the walk, once", () => {
    const m = createMap();
    m.step(500);
    m.map.pointerDown();
    m.map.pointerDown();
    expect(m.done).toHaveBeenCalledTimes(1);
  });

  it("draws the map that it is given, with the cat between two places", () => {
    const m = createMap({ level: 1, image: "mapa_idiomas", positions: MAP_LANG_POS });
    m.step(16);
    m.map.draw();
    expect(m.ctx.drawImage.mock.calls[0][0]).toEqual({ name: "mapa_idiomas" });
    const [image, x, y] = m.ctx.drawImage.mock.calls[1];
    expect(image).toEqual({ name: "mapa_gato" });
    expect(x + 20).toBeGreaterThanOrEqual(MAP_LANG_POS[1].x - 1);
    expect(x + 20).toBeLessThanOrEqual(MAP_LANG_POS[2].x + 1);
    expect(y).toBeGreaterThan(0);
  });

  it("uses the map of the themes by default", () => {
    const m = createMap();
    m.step(16);
    m.map.draw();
    expect(m.ctx.drawImage.mock.calls[0][0]).toEqual({ name: "mapa" });
  });
});
