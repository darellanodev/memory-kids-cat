// Experience of the player (old C_Jugador: getnivelexp, getpuntosexpnext, getbarraexp).
// Pure functions: they do not draw or save anything.
// The experience points are the sum of the scores of the games that were completed.

const FACTOR = 0.04; // level = 0.04 * sqrt(points)

// Level of the player (a whole number, 0 at the start). 625 points -> level 1, 2500 -> level 2.
export function levelOf(points) {
  // The small number avoids float errors, for example sqrt(625) * 0.04 = 0.9999999.
  return Math.floor(FACTOR * Math.sqrt(points) + 1e-9);
}

// Points needed to reach the next level.
export function nextLevelAt(points) {
  return Math.round(Math.pow((levelOf(points) + 1) / FACTOR, 2));
}

// How full the bar is, from 0 to 1. (As in the old game, it counts from 0 points, not from the start of the level.)
export function barFill(points) {
  return Math.min(1, Math.max(0, points / nextLevelAt(points)));
}
