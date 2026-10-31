// Stars that fly out of the cards when a pair is found (old C_ParticleSystem and C_Particle).
// It does not draw. The movement uses fixed steps of 1/60 s, like the old game, so it looks
// the same on screens with 60, 90 or 120 Hz.
import {
  PARTICLE_FADE,
  PARTICLE_LIFE,
  PARTICLE_SPEED,
  PARTICLE_STEP,
} from "./config.js";

export class ParticleSystem {
  // random: function that returns a number from 0 to 1 (can be changed in tests).
  constructor(random = Math.random) {
    this.random = random;
    this.list = [];
    this.pending = 0; // ms that are not used yet by a step
  }

  // `count` particles that start at (x, y).
  explosion(x, y, count) {
    for (let i = 0; i < count; i++) {
      const vx = (this.random() * 2 - 1) * PARTICLE_SPEED;
      const vy = (this.random() * 2 - 1) * PARTICLE_SPEED;
      // The acceleration is 10 % of the speed, so the speed grows 10 % every step.
      this.list.push({ x, y, vx, vy, ax: vx / 10, ay: vy / 10, timer: PARTICLE_LIFE });
    }
  }

  // Move the particles. dt: ms since the last call.
  update(dt) {
    this.pending += dt;
    while (this.pending >= PARTICLE_STEP) {
      this.pending -= PARTICLE_STEP;
      for (const p of this.list) {
        p.vx += p.ax;
        p.vy += p.ay;
        p.x += p.vx;
        p.y += p.vy;
        p.timer -= PARTICLE_FADE;
      }
      this.list = this.list.filter((p) => p.timer > 0);
    }
  }

  // Scale of the particle: 1 when it is born, 0 when it dies.
  static scale(p) {
    return p.timer / PARTICLE_LIFE;
  }
}
