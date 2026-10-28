// Easing functions and a helper to move a value in time (replaces the Ani library of the old game).
// Everything is a pure function of time: no timers, no state.

export const linear = (t) => t;
export const quadIn = (t) => t * t;
export const quadOut = (t) => 1 - (1 - t) * (1 - t);
export const quadInOut = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// Value between `from` and `to` after `elapsed` ms of a movement that lasts `duration` ms.
export function tween(from, to, elapsed, duration, easing = linear) {
  const t = Math.min(1, Math.max(0, elapsed / duration));
  return from + (to - from) * easing(t);
}
