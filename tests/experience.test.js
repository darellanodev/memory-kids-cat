import { describe, expect, it } from "vitest";
import { barFill, levelOf, nextLevelAt } from "../src/experience.js";

describe("experience", () => {
  it("starts at level 0 and needs 625 points for level 1", () => {
    expect(levelOf(0)).toBe(0);
    expect(nextLevelAt(0)).toBe(625);
  });

  it("reaches level 1 exactly at 625 points and level 2 at 2500", () => {
    expect(levelOf(624)).toBe(0);
    expect(levelOf(625)).toBe(1);
    expect(levelOf(2499)).toBe(1);
    expect(levelOf(2500)).toBe(2);
    expect(levelOf(5625)).toBe(3);
  });

  it("the next level is always above the points (the old game had a bug at the limits)", () => {
    for (const points of [0, 1, 624, 625, 626, 2499, 2500, 5625, 10000]) {
      expect(nextLevelAt(points)).toBeGreaterThan(points);
      expect(levelOf(nextLevelAt(points))).toBe(levelOf(points) + 1);
    }
  });

  it("the bar is full at the next level and never goes out of 0 to 1", () => {
    expect(barFill(0)).toBe(0);
    expect(barFill(1250)).toBeCloseTo(0.5);
    expect(barFill(624)).toBeLessThan(1);
    for (const points of [0, 100, 625, 5000]) {
      expect(barFill(points)).toBeGreaterThanOrEqual(0);
      expect(barFill(points)).toBeLessThanOrEqual(1);
    }
  });
});
