import { describe, expect, it } from "vitest";
import { PARTICLE_LIFE, PARTICLE_STEP } from "../src/config.js";
import { ParticleSystem } from "../src/particles.js";
import { seeded } from "./helpers.js";

describe("ParticleSystem", () => {
  it("makes the number of particles that it is asked for, at the same place", () => {
    const system = new ParticleSystem(seeded());
    system.explosion(100, 200, 5);
    expect(system.list).toHaveLength(5);
    expect(system.list.every((p) => p.x === 100 && p.y === 200)).toBe(true);
    expect(ParticleSystem.scale(system.list[0])).toBe(1);
  });

  it("moves them away and makes them smaller", () => {
    const system = new ParticleSystem(seeded());
    system.explosion(100, 100, 3);
    system.update(500);
    for (const p of system.list) {
      expect(Math.hypot(p.x - 100, p.y - 100)).toBeGreaterThan(0);
      expect(ParticleSystem.scale(p)).toBeLessThan(1);
    }
  });

  it("they disappear after about 3.3 seconds", () => {
    const system = new ParticleSystem(seeded());
    system.explosion(0, 0, 5);
    system.update(3300);
    expect(system.list).toHaveLength(5);
    system.update(100);
    expect(system.list).toHaveLength(0);
  });

  it("moves the same on screens of 60 and 144 Hz (fixed steps)", () => {
    const a = new ParticleSystem(seeded(7));
    const b = new ParticleSystem(seeded(7));
    a.explosion(0, 0, 4);
    b.explosion(0, 0, 4);
    for (let t = 0; t < 600; t += 1000 / 60) a.update(1000 / 60);
    for (let t = 0; t < 600; t += 1000 / 144) b.update(1000 / 144);
    a.list.forEach((p, i) => {
      expect(b.list[i].x).toBeCloseTo(p.x, 0);
      expect(b.list[i].y).toBeCloseTo(p.y, 0);
    });
  });

  it("does nothing with a time shorter than a step", () => {
    const system = new ParticleSystem(seeded());
    system.explosion(5, 5, 1);
    system.update(PARTICLE_STEP - 1);
    expect(system.list[0].timer).toBe(PARTICLE_LIFE);
  });
});
