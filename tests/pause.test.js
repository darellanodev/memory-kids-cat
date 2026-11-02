import { describe, expect, it } from "vitest";
import { PauseClock } from "../src/pause.js";

describe("PauseClock", () => {
  it("is the real time when it was never paused", () => {
    const clock = new PauseClock();
    expect(clock.paused).toBe(false);
    expect(clock.time(1234)).toBe(1234);
  });

  it("does not count the time paused", () => {
    const clock = new PauseClock();
    clock.pause(2000);
    expect(clock.paused).toBe(true);
    clock.resume(12000); // 10 s paused
    expect(clock.paused).toBe(false);
    expect(clock.time(12016)).toBe(2016);
  });

  it("adds up several pauses", () => {
    const clock = new PauseClock();
    clock.pause(1000);
    clock.resume(2000);
    clock.pause(5000);
    clock.resume(5500);
    expect(clock.time(6000)).toBe(6000 - 1000 - 500);
  });

  it("ignores a second pause or a second resume", () => {
    const clock = new PauseClock();
    clock.pause(1000);
    clock.pause(3000); // does not move the start of the pause
    clock.resume(4000);
    clock.resume(9000); // there is nothing to resume
    expect(clock.time(4000)).toBe(1000);
  });

  it("never gives a negative pause", () => {
    const clock = new PauseClock();
    clock.pause(5000);
    clock.resume(4000);
    expect(clock.time(6000)).toBe(6000);
  });
});
