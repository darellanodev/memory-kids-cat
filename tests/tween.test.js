import { describe, expect, it } from "vitest";
import { linear, quadIn, quadInOut, quadOut, tween } from "../src/tween.js";

describe("easing functions", () => {
  it.each([
    ["linear", linear],
    ["quadIn", quadIn],
    ["quadOut", quadOut],
    ["quadInOut", quadInOut],
  ])("%s starts at 0 and ends at 1", (_, fn) => {
    expect(fn(0)).toBeCloseTo(0);
    expect(fn(1)).toBeCloseTo(1);
  });

  it("quadIn is slow at the start and quadOut is slow at the end", () => {
    expect(quadIn(0.5)).toBeLessThan(0.5);
    expect(quadOut(0.5)).toBeGreaterThan(0.5);
  });

  it("quadInOut is symmetric", () => {
    expect(quadInOut(0.5)).toBeCloseTo(0.5);
    expect(quadInOut(0.25) + quadInOut(0.75)).toBeCloseTo(1);
  });
});

describe("tween()", () => {
  it("moves a value in time", () => {
    expect(tween(0, 100, 0, 1000)).toBe(0);
    expect(tween(0, 100, 500, 1000)).toBe(50);
    expect(tween(0, 100, 1000, 1000)).toBe(100);
  });

  it("does not go outside the two values", () => {
    expect(tween(10, 20, -500, 1000)).toBe(10);
    expect(tween(10, 20, 99999, 1000)).toBe(20);
  });

  it("works downwards and with an easing", () => {
    expect(tween(100, 0, 500, 1000)).toBe(50);
    expect(tween(0, 100, 500, 1000, quadIn)).toBe(25);
  });
});
