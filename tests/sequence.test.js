import { describe, expect, it } from "vitest";
import {
  SEQ_FIRST_WAIT,
  SEQ_NEXT_WAIT,
  SEQ_SOUNDS,
  SEQ_START_LENGTH,
  SEQ_TOTAL,
  SEQ_ZOOM_SIZE,
  SEQ_ZOOM_STEP,
  CARD_SIZE,
  TIME_BAR_MAX,
} from "../src/config.js";
import { SequenceGame } from "../src/sequence.js";
import { centerOf, createRunner, seeded, soundLog } from "./helpers.js";

function newGame() {
  const sfx = soundLog();
  const game = new SequenceGame({ sfx, random: seeded(5) });
  const time = createRunner(game);
  const toPlaying = () => time.until(() => game.phase === "playing");
  const tapIndex = (index) => game.tap(centerOf(game.cards[index]));
  // Repeat the sequence that the game shows now.
  const repeat = () => {
    for (let i = 0, n = game.length; i < n; i++) tapIndex(game.sequence[i]);
  };
  return { game, time, sfx, toPlaying, tapIndex, repeat };
}

describe("Sequence: the start", () => {
  it("has 6 animals and a sequence of 12 that is always the same in a game", () => {
    const { game } = newGame();
    expect(game.cards).toHaveLength(6);
    expect(game.sequence).toHaveLength(SEQ_TOTAL);
    expect(game.sequence.every((n) => Number.isInteger(n) && n >= 0 && n < 6)).toBe(true);
    expect(game.length).toBe(SEQ_START_LENGTH);
  });

  it("starts with the banner LEVEL 1 / EASY", () => {
    const { game } = newGame();
    expect(game.banner).toMatchObject({ title: "LEVEL 1", subtitle: "EASY" });
  });

  it("plays the animals one by one, with the time of the old game", () => {
    const { game, time, sfx } = newGame();
    time.until(() => game.phase === "observing");
    const start = game.phaseStart;
    time.step(SEQ_FIRST_WAIT - 100);
    expect(game.pointer).toBe(0);
    time.step(200);
    expect(game.pointer).toBe(1);
    time.step(SEQ_ZOOM_STEP);
    expect(game.pointer).toBe(2);
    time.until(() => game.phase === "playing");
    expect(game.clock - start).toBeGreaterThanOrEqual(SEQ_FIRST_WAIT + 3 * SEQ_ZOOM_STEP);
    // each animal made its own sound
    const animals = sfx.log.filter((n) => SEQ_SOUNDS.includes(n));
    expect(animals).toEqual(game.sequence.slice(0, 3).map((i) => SEQ_SOUNDS[i]));
  });

  it("an animal that was just played is big and gets smaller", () => {
    const { game, time } = newGame();
    time.until(() => game.pointer === 1);
    const card = game.cards[game.sequence[0]];
    expect(game.cardSize(card)).toBeGreaterThan(CARD_SIZE);
    expect(game.cardSize(card)).toBeLessThanOrEqual(SEQ_ZOOM_SIZE);
    time.step(1000);
    expect(game.cardSize(card)).toBe(CARD_SIZE);
  });

  it("shows WATCH THE SEQUENCE before the first animal, and GOOD! after a repeated sequence", () => {
    const { game, time, toPlaying, repeat } = newGame();
    time.until(() => game.phase === "observing");
    expect(game.observeText).toBe(null); // the first time, nothing at the start
    time.step(SEQ_FIRST_WAIT - 1000);
    expect(game.observeText).toBe("WATCH THE SEQUENCE");
    toPlaying();
    repeat();
    expect(game.phase).toBe("observing");
    expect(game.observeText).toBe("GOOD!");
    time.step(SEQ_NEXT_WAIT - 1000);
    expect(game.observeText).toBe("WATCH THE SEQUENCE");
  });

  it("does not accept taps while the animals are playing", () => {
    const { game, time, tapIndex } = newGame();
    time.until(() => game.phase === "observing");
    expect(tapIndex(0)).toBe(false);
  });
});

describe("Sequence: repeating", () => {
  it("a right animal makes its sound and two stars, and the next one is expected", () => {
    const { game, toPlaying, tapIndex, sfx } = newGame();
    toPlaying();
    tapIndex(game.sequence[0]);
    expect(game.pointer).toBe(1);
    expect(game.particles.list).toHaveLength(2);
    expect(sfx.log.at(-1)).toBe(SEQ_SOUNDS[game.sequence[0]]);
  });

  it("repeating the whole sequence makes it one animal longer", () => {
    const { game, toPlaying, repeat } = newGame();
    toPlaying();
    const before = game.sequence.slice(0, SEQ_START_LENGTH);
    repeat();
    expect(game.length).toBe(SEQ_START_LENGTH + 1);
    expect(game.phase).toBe("observing");
    toPlaying();
    expect(game.pointer).toBe(0);
    // the longer sequence starts with the same animals as the short one
    expect(game.sequence.slice(0, SEQ_START_LENGTH)).toEqual(before);
  });

  it("a wrong animal ends the game with FAIL! and a red cross", () => {
    const { game, time, toPlaying, tapIndex, sfx } = newGame();
    toPlaying();
    const wrong = (game.sequence[0] + 1) % 6;
    tapIndex(wrong);
    expect(game.phase).toBe("fail");
    expect(game.banner.title).toBe("FAIL!");
    expect(game.failedCard).toBe(game.cards[wrong]);
    expect(game.showFailIcon).toBe(true);
    expect(sfx.log).toContain("endgame");
    time.step(2000);
    expect(game.showFailIcon).toBe(false);
    expect(tapIndex(0)).toBe(false);
    time.until(() => game.result !== null);
    expect(game.result).toBe("fail");
  });

  it("a wrong animal in the middle of a sequence also fails", () => {
    const { game, toPlaying, tapIndex } = newGame();
    toPlaying();
    tapIndex(game.sequence[0]);
    tapIndex((game.sequence[1] + 2) % 6);
    expect(game.phase).toBe("fail");
  });

  it("the time bar is full at the start, goes down, and TIME IS UP ends the game", () => {
    const { game, time, toPlaying } = newGame();
    toPlaying();
    expect(game.timeLeft).toBe(TIME_BAR_MAX);
    time.step(5000);
    expect(game.timeLeft).toBeLessThan(TIME_BAR_MAX);
    time.until(() => game.phase === "timeup");
    expect(game.banner.title).toBe("TIME IS UP");
    time.until(() => game.result !== null);
    expect(game.result).toBe("timeup");
  });

  it("every repeated sequence gives the time back", () => {
    const { game, time, toPlaying, repeat } = newGame();
    toPlaying();
    time.step(8000);
    repeat();
    toPlaying();
    expect(game.timeLeft).toBeGreaterThan(TIME_BAR_MAX - 10);
  });
});

describe("Sequence: the three stages", () => {
  it("EASY 3-5, HARD 6-8, EXPERT 9-11, and then the player wins", () => {
    const { game, time, sfx, toPlaying, repeat } = newGame();
    const played = [];
    const stages = [];
    while (game.phase !== "win") {
      toPlaying();
      played.push(game.length);
      stages.push(game.stage);
      repeat();
    }
    expect(played).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(stages).toEqual([0, 0, 0, 1, 1, 1, 2, 2, 2]);
    expect(game.length).toBe(SEQ_TOTAL);
    expect(game.banner).toMatchObject({ title: "YOU WIN!", subtitle: "1.000 POINTS" });
    expect(game.result).toBe(null);
    time.until(() => game.result !== null);
    expect(game.result).toBe("win");
    expect(sfx.log.filter((n) => n === "completed").length).toBeGreaterThanOrEqual(4);
  });

  it("a new stage shows its banner and the cards stay in their places", () => {
    const { game, toPlaying, repeat } = newGame();
    for (let i = 0; i < 3; i++) {
      toPlaying();
      repeat();
    }
    expect(game.phase).toBe("dealing");
    expect(game.banner).toMatchObject({ title: "LEVEL 2", subtitle: "HARD" });
    expect(game.cards.every((c) => c.x === c.fx && c.y === c.fy)).toBe(true);
    toPlaying();
    expect(game.length).toBe(6);
  });
});
