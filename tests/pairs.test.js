import { beforeEach, describe, expect, it } from "vitest";
import { BOARD_X, BOARD_Y, CARD_SIZE, PAIRS, POINTS_MATCH, POINTS_MISS, THEMES, TIME_BAR_MAX } from "../src/config.js";
import { PairsGame } from "../src/pairs.js";
import { centerOf, createRunner, seeded, soundLog } from "./helpers.js";

function newGame(options = {}) {
  const sfx = soundLog();
  const game = new PairsGame({ theme: THEMES[0], levelNumber: 1, sfx, random: seeded(5), ...options });
  const time = createRunner(game);
  const toPlaying = () => time.until(() => game.phase === "playing");
  const pairOf = (id) => game.cards.filter((c) => c.id === id);
  const tap = (card) => game.tap(centerOf(card));
  return { game, time, sfx, toPlaying, pairOf, tap };
}

describe("Make pairs: the start of a level", () => {
  it("has 20 cards, two of each of the 10 pictures", () => {
    const { game } = newGame();
    expect(game.cards).toHaveLength(20);
    for (let id = 0; id < PAIRS; id++) expect(game.cards.filter((c) => c.id === id)).toHaveLength(2);
  });

  it("puts the cards in a grid of 4 x 5", () => {
    const { game } = newGame();
    expect(game.cards[0]).toMatchObject({ fx: BOARD_X, fy: BOARD_Y });
    expect(game.cards[19]).toMatchObject({ fx: BOARD_X + 3 * CARD_SIZE, fy: BOARD_Y + 4 * CARD_SIZE });
  });

  it("shows the banner of the level and plays the start sound", () => {
    const { game, sfx } = newGame({ levelNumber: 3, theme: THEMES[3] });
    expect(game.banner).toMatchObject({ title: "LEVEL 3", subtitle: THEMES[3].title });
    game.update(16);
    expect(sfx.log).toEqual(["completed"]);
  });

  it("goes through dealing, observing and covering before it can be played", () => {
    const { game, time, sfx } = newGame();
    expect(game.phase).toBe("dealing");
    time.until(() => game.phase === "observing");
    expect(game.cards.every((c) => c.state === "up")).toBe(true);
    time.until(() => game.phase === "covering");
    time.until(() => game.phase === "playing");
    expect(game.cards.every((c) => c.state === "down")).toBe(true);
    expect(game.cards.every((c) => c.x === c.fx && c.y === c.fy)).toBe(true);
    expect(sfx.log).toEqual(["completed", "tapartodos"]);
  });

  it("shows the text LOOK AT THE PICTURES only while observing, after a moment", () => {
    const { game, time } = newGame();
    expect(game.showLookText).toBe(false);
    time.until(() => game.phase === "observing");
    expect(game.showLookText).toBe(false);
    time.step(2000);
    expect(game.showLookText).toBe(true);
    time.until(() => game.phase === "playing");
    expect(game.showLookText).toBe(false);
  });

  it("ignores taps before the game starts", () => {
    const { game, time, tap } = newGame();
    time.until(() => game.phase === "observing");
    expect(tap(game.cards[0])).toBe(false);
    expect(game.score).toBe(0);
  });

  it("does not jump when a frame takes very long (hidden tab)", () => {
    const { game } = newGame();
    game.update(0);
    game.update(60000);
    expect(game.clock).toBeLessThanOrEqual(100);
  });
});

describe("Make pairs: playing", () => {
  let t;
  beforeEach(() => {
    t = newGame();
    t.toPlaying();
  });

  it("a pair gives points, fixes the cards, plays a sound and throws stars", () => {
    const [a, b] = t.pairOf(0);
    t.tap(a);
    expect(a.state).toBe("up");
    t.tap(b);
    expect([a.state, b.state]).toEqual(["fixed", "fixed"]);
    expect(t.game.score).toBe(POINTS_MATCH);
    expect(t.game.matched).toBe(1);
    expect(t.sfx.log).toContain("match");
    expect(t.game.particles.list).toHaveLength(10);
  });

  it("a pair gives the full time again", () => {
    t.time.step(5000);
    expect(t.game.timeLeft).toBeLessThan(TIME_BAR_MAX);
    const [a, b] = t.pairOf(1);
    t.tap(a);
    t.tap(b);
    expect(t.game.timeLeft).toBeGreaterThanOrEqual(TIME_BAR_MAX - 1);
  });

  it("two different cards take points but the score never goes below 0", () => {
    const a = t.pairOf(0)[0];
    const b = t.pairOf(1)[0];
    t.tap(a);
    t.tap(b);
    expect(t.game.score).toBe(0);
    expect(t.game.selected).toHaveLength(2);
    expect(t.game.particles.list).toHaveLength(0);
  });

  it("takes points from a score that is high enough", () => {
    const [a, b] = t.pairOf(0);
    t.tap(a);
    t.tap(b);
    t.tap(t.pairOf(1)[0]);
    t.tap(t.pairOf(2)[0]);
    expect(t.game.score).toBe(POINTS_MATCH - POINTS_MISS);
  });

  it("covers two cards that are not a pair after a while", () => {
    const a = t.pairOf(0)[0];
    const b = t.pairOf(1)[0];
    t.tap(a);
    t.tap(b);
    t.time.step(1000);
    expect(a.state).toBe("up");
    t.time.step(900);
    expect([a.state, b.state]).toEqual(["down", "down"]);
    expect(t.game.selected).toHaveLength(0);
  });

  it("tapping another card covers the two cards at once", () => {
    const a = t.pairOf(0)[0];
    const b = t.pairOf(1)[0];
    const c = t.pairOf(2)[0];
    t.tap(a);
    t.tap(b);
    t.tap(c);
    expect([a.state, b.state, c.state]).toEqual(["down", "down", "up"]);
    expect(t.game.selected).toHaveLength(1);
  });

  it("a card that is face up or fixed cannot be tapped again", () => {
    const [a, b] = t.pairOf(0);
    t.tap(a);
    expect(t.tap(a)).toBe(false);
    t.tap(b);
    expect(t.tap(a)).toBe(false);
  });

  it("a tap outside the cards does nothing", () => {
    expect(t.game.tap({ x: 2, y: 790 })).toBe(false);
  });

  it("finding all the pairs completes the level", () => {
    for (let id = 0; id < PAIRS; id++) {
      const [a, b] = t.pairOf(id);
      t.tap(a);
      t.tap(b);
    }
    expect(t.game.phase).toBe("complete");
    expect(t.game.score).toBe(PAIRS * POINTS_MATCH);
    expect(t.game.result).toBe(null);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("complete");
  });

  it("the time bar runs out: TIME IS UP, then the result", () => {
    t.time.until(() => t.game.phase === "timeup");
    expect(t.game.banner.title).toBe("TIME IS UP");
    expect(t.game.over).toBe(true);
    expect(t.sfx.log).toContain("endgame");
    expect(t.game.result).toBe(null);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("timeup");
  });

  it("no taps are accepted after the time is up", () => {
    t.time.until(() => t.game.phase === "timeup");
    expect(t.tap(t.game.cards.find((c) => c.state === "down"))).toBe(false);
  });
});
