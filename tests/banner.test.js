import { describe, expect, it } from "vitest";
import { BANNER_TOTAL, bannerY } from "../src/banner.js";
import {
  BANNER_END_Y,
  BANNER_HOLD,
  BANNER_IN,
  BANNER_OUT,
  BANNER_SHOW_Y,
  BANNER_START_Y,
} from "../src/config.js";

describe("banner movement", () => {
  it("lasts the time of coming, staying and going", () => {
    expect(BANNER_TOTAL).toBe(BANNER_IN + BANNER_HOLD + BANNER_OUT);
  });

  it("comes up from below to its place", () => {
    expect(bannerY(0)).toBe(BANNER_START_Y);
    expect(bannerY(BANNER_IN)).toBe(BANNER_SHOW_Y);
    expect(bannerY(BANNER_IN / 2)).toBeLessThan(BANNER_START_Y);
    expect(bannerY(BANNER_IN / 2)).toBeGreaterThan(BANNER_SHOW_Y);
  });

  it("stays in its place", () => {
    expect(bannerY(BANNER_IN + 1)).toBe(BANNER_SHOW_Y);
    expect(bannerY(BANNER_IN + BANNER_HOLD - 1)).toBe(BANNER_SHOW_Y);
  });

  it("goes away to the top", () => {
    expect(bannerY(BANNER_TOTAL)).toBe(BANNER_END_Y);
    expect(bannerY(BANNER_IN + BANNER_HOLD + BANNER_OUT / 2)).toBeLessThan(BANNER_SHOW_Y);
  });
});
