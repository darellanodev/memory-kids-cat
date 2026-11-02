import { beforeEach, describe, expect, it } from "vitest";
import {
  EQ_LIVES,
  EQ_TARGETS,
  EQ_Y,
  BOARD_X,
  CARD_SIZE,
  PARTICLES_EQUALS,
  POINTS_MATCH,
  POINTS_MISS,
  THEMES,
  TIME_BAR_MAX,
} from "../src/config.js";
import { EqualsGame } from "../src/equals.js";
import { centerOf, createRunner, seeded, soundLog } from "./helpers.js";

function newGame(options = {}) {
  const sfx = soundLog();
  const game = new EqualsGame({ theme: THEMES[3], levelNumber: 2, sfx, random: seeded(11), ...options });
  const time = createRunner(game);
  const toPlaying = () => time.until(() => game.phase === "playing");
  const right = () => game.cards.filter((c) => c.id === game.model);
  const wrong = () => game.cards.filter((c) => c.id !== game.model);
  const tap = (card) => game.tap(centerOf(card));
  return { game, time, sfx, toPlaying, right, wrong, tap };
}

describe("Equals: the start", () => {
  it("has 12 cards: 6 of each of two pictures, in a grid of 4 x 3", () => {
    const { game } = newGame();
    expect(game.cards).toHaveLength(12);
    expect(game.cards.filter((c) => c.id === 0)).toHaveLength(6);
    expect(game.cards.filter((c) => c.id === 1)).toHaveLength(6);
    expect(game.cards[0]).toMatchObject({ fx: BOARD_X, fy: EQ_Y });
    expect(game.cards[11]).toMatchObject({ fx: BOARD_X + 3 * CARD_SIZE, fy: EQ_Y + 2 * CARD_SIZE });
  });

  it("the model is one of the two pictures", () => {
    for (const seed of [1, 2, 3, 4, 5, 6])
      expect([0, 1]).toContain(newGame({ random: seeded(seed) }).game.model);
  });

  it("starts with 3 lives and no score, or with the ones of the previous level", () => {
    expect(newGame().game).toMatchObject({ lives: EQ_LIVES, score: 0 });
    expect(newGame({ lives: 1, score: 200 }).game).toMatchObject({ lives: 1, score: 200 });
  });

  it("shows the banner, then the pictures, then turns the cards face down", () => {
    const { game, time, sfx } = newGame();
    expect(game.banner).toMatchObject({ title: "LEVEL 2", subtitle: THEMES[3].title });
    time.until(() => game.phase === "observing");
    expect(game.cards.every((c) => c.state === "up")).toBe(true);
    expect(game.showModel).toBe(false);
    time.until(() => game.phase === "playing");
    expect(game.cards.every((c) => c.state === "down")).toBe(true);
    expect(game.showModel).toBe(true);
    expect(sfx.log).toEqual(["completed", "tapartodos"]);
  });
});

describe("Equals: playing", () => {
  let t;
  beforeEach(() => {
    t = newGame();
    t.toPlaying();
  });

  it("a card like the model gives points, full time, a sound and three stars", () => {
    t.time.step(4000);
    const card = t.right()[0];
    t.tap(card);
    expect(card.state).toBe("up");
    expect(t.game.score).toBe(POINTS_MATCH);
    expect(t.game.found).toBe(1);
    expect(t.game.timeLeft).toBeGreaterThanOrEqual(TIME_BAR_MAX - 1);
    expect(t.sfx.log).toContain("match");
    expect(t.game.particles.list).toHaveLength(PARTICLES_EQUALS);
  });

  it("a wrong card takes a life and points, stays face up and gets a red cross", () => {
    t.tap(t.right()[0]);
    const card = t.wrong()[0];
    t.tap(card);
    expect(t.game.lives).toBe(EQ_LIVES - 1);
    expect(t.game.score).toBe(POINTS_MATCH - POINTS_MISS);
    expect(card.state).toBe("up");
    expect(t.game.failedCard).toBe(card);
    expect(t.game.showFailIcon).toBe(true);
    t.time.step(2000);
    expect(t.game.showFailIcon).toBe(false);
  });

  it("the score never goes below 0", () => {
    t.tap(t.wrong()[0]);
    expect(t.game.score).toBe(0);
  });

  it("a face up card is not tapped again", () => {
    const card = t.wrong()[0];
    t.tap(card);
    expect(t.tap(card)).toBe(false);
    expect(t.game.lives).toBe(EQ_LIVES - 1);
  });

  it("three mistakes are allowed, the fourth loses the game", () => {
    const w = t.wrong();
    for (let i = 0; i < 3; i++) t.tap(w[i]);
    expect(t.game.lives).toBe(0);
    expect(t.game.phase).toBe("playing");
    t.tap(w[3]);
    expect(t.game.phase).toBe("lost");
    expect(t.game.banner).toMatchObject({ title: "YOU LOST", subtitle: "ALL YOUR LIVES" });
    expect(t.game.over).toBe(true);
    expect(t.sfx.log).toContain("endgame");
    expect(t.tap(w[4])).toBe(false);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("lost");
  });

  it("finding the 6 cards completes the level", () => {
    for (const card of t.right()) t.tap(card);
    expect(t.game.found).toBe(EQ_TARGETS);
    expect(t.game.phase).toBe("complete");
    expect(t.game.score).toBe(EQ_TARGETS * POINTS_MATCH);
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("complete");
  });

  it("the time runs out", () => {
    t.time.until(() => t.game.phase === "timeup");
    expect(t.game.banner.title).toBe("TIME IS UP");
    t.time.until(() => t.game.result !== null);
    expect(t.game.result).toBe("timeup");
  });

  it("the lives and the score go on to the next level through the game object", () => {
    t.tap(t.wrong()[0]);
    for (const card of t.right()) t.tap(card);
    const next = newGame({ lives: t.game.lives, score: t.game.score }).game;
    expect(next.lives).toBe(EQ_LIVES - 1);
    expect(next.score).toBe(EQ_TARGETS * POINTS_MATCH);
  });
});
