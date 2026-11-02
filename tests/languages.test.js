import { beforeEach, describe, expect, it } from "vitest";
import {
  EQ_LIVES,
  LANG_BOARD,
  LANG_CARDS,
  POINTS_MATCH,
  POINTS_MISS,
  THEMES,
  TIME_BAR_MAX,
} from "../src/config.js";
import { LanguagesGame } from "../src/languages.js";
import { centerOf, createRunner, seeded, soundLog } from "./helpers.js";

const THEME = { ...THEMES[2], num: 2 };

function newGame(options = {}) {
  const sfx = soundLog();
  const game = new LanguagesGame({ theme: THEME, levelNumber: 3, language: "es", sfx, random: seeded(3), ...options });
  const time = createRunner(game);
  const toPlaying = () => time.until(() => game.phase === "playing");
  const byId = (id) => game.cards.find((c) => c.id === id);
  const tapId = (id) => game.tap(centerOf(byId(id)));
  return { game, time, sfx, toPlaying, byId, tapId };
}

describe("Languages: the start", () => {
  it("has 6 pictures in 2 rows of 3, and each one has its own number", () => {
    const { game } = newGame();
    expect(game.cards).toHaveLength(LANG_CARDS);
    expect(game.cards.map((c) => c.id).sort()).toEqual([0, 1, 2, 3, 4, 5]);
    const places = game.cards.map((c) => `${c.fx},${c.fy}`).sort();
    const expected = [0, 1].flatMap((row) =>
      [0, 1, 2].map((col) => `${LANG_BOARD.x + col * LANG_BOARD.stepX},${LANG_BOARD.y + row * LANG_BOARD.stepY}`),
    ).sort();
    expect(places).toEqual(expected);
  });

  it("keeps the language and has no banner at the start", () => {
    const { game } = newGame({ language: "fr" });
    expect(game.language).toBe("fr");
    expect(game.banner).toBe(null);
  });

  it("shows the words while observing, hides them while playing", () => {
    const { game, time, toPlaying } = newGame();
    time.until(() => game.phase === "observing");
    expect(game.cards.every((c) => game.wordVisible(c))).toBe(true);
    expect(game.showCatWord).toBe(false);
    toPlaying();
    expect(game.cards.every((c) => !game.wordVisible(c))).toBe(true);
    expect(game.showCatWord).toBe(true);
  });

  it("the pictures are never turned face down: the sound of covering plays but nothing changes", () => {
    const { game, time, sfx } = newGame();
    time.until(() => game.phase === "playing");
    expect(sfx.log).toEqual(["completed", "tapartodos"]);
    expect(game.cards.every((c) => c.x === c.fx && c.y === c.fy)).toBe(true);
  });
});

describe("Languages: playing", () => {
  let t;
  beforeEach(() => {
    t = newGame();
    t.toPlaying();
  });

  it("the words come in order, starting with word 0", () => {
    expect(t.game.found).toBe(0);
    t.tapId(0);
    expect(t.game.found).toBe(1);
  });

  it("a right picture gives points and the full time, shows its word, and throws stars", () => {
    t.time.step(4000);
    t.tapId(0);
    expect(t.game.score).toBe(POINTS_MATCH);
    expect(t.game.timeLeft).toBeGreaterThanOrEqual(TIME_BAR_MAX - 1);
    expect(t.game.wordVisible(t.byId(0))).toBe(true);
    expect(t.game.wordVisible(t.byId(1))).toBe(false);
    expect(t.game.particles.list.length).toBeGreaterThan(0);
    expect(t.sfx.log).toContain("match");
  });

  it("a wrong picture takes a life and points, and gets a red cross", () => {
    t.tapId(0);
    t.tapId(4);
    expect(t.game.lives).toBe(EQ_LIVES - 1);
    expect(t.game.score).toBe(POINTS_MATCH - POINTS_MISS);
    expect(t.game.failedCard).toBe(t.byId(4));
    expect(t.game.showFailIcon).toBe(true);
    expect(t.game.found).toBe(1);
  });

  it("the score never goes below 0", () => {
    t.tapId(3);
    expect(t.game.score).toBe(0);
  });

  it("a picture that was already found does nothing (it costs no life)", () => {
    t.tapId(0);
    expect(t.tapId(0)).toBe(false);
    expect(t.game.lives).toBe(EQ_LIVES);
    expect(t.game.score).toBe(POINTS_MATCH);
  });

  it("three mistakes are allowed, the fourth loses the game", () => {
    for (let i = 0; i < 3; i++) t.tapId(5);
    expect(t.game.lives).toBe(0);
    t.tapId(5);
    expect(t.game.phase).toBe("lost");
    expect(t.game.banner.title).toBe("YOU LOST");
    expect(t.game.over).toBe(true);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("lost");
  });

  it("finding the 6 pictures in order completes the level and shows all the words", () => {
    for (let id = 0; id < LANG_CARDS; id++) t.tapId(id);
    expect(t.game.phase).toBe("complete");
    expect(t.game.score).toBe(LANG_CARDS * POINTS_MATCH);
    expect(t.game.showCatWord).toBe(false);
    expect(t.game.cards.every((c) => t.game.wordVisible(c))).toBe(true);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("complete");
  });

  it("the time runs out", () => {
    t.time.until(() => t.game.phase === "timeup");
    expect(t.game.banner.title).toBe("TIME IS UP");
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("timeup");
  });

  it("a tap outside the pictures does nothing", () => {
    expect(t.game.tap({ x: 2, y: 790 })).toBe(false);
    expect(t.game.lives).toBe(EQ_LIVES);
  });
});
