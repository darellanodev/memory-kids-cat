// Small helpers shared by the tests.

// Random numbers from 0 to 1 that are always the same for the same seed.
export function seeded(seed = 1) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// Sound function for a game that remembers the names of the sounds it was asked to play.
export function soundLog() {
  const log = [];
  const sfx = (name) => log.push(name);
  sfx.log = log;
  return sfx;
}

// Moves the time of a game (or a scene) in steps of 16 ms, like a screen of about 60 Hz.
export function createRunner(target) {
  let now = 0;
  target.update(0);
  return {
    get now() {
      return now;
    },
    // Advance `ms` milliseconds.
    step(ms) {
      for (let t = 0; t < ms; t += 16) {
        now += 16;
        target.update(now);
      }
    },
    // Advance until condition() is true (it fails after `limit` ms, so a test never waits forever).
    until(condition, limit = 120000) {
      let spent = 0;
      while (!condition()) {
        if (spent >= limit) throw new Error("The condition was not true after " + limit + " ms");
        now += 16;
        spent += 16;
        target.update(now);
      }
    },
  };
}

// A tap in the middle of a card. `size` is the size of the card.
export function centerOf(card, size = 119) {
  return { x: card.x + size / 2, y: card.y + size / 2 };
}
