// Movement of the banner (the old "cartel"): it comes up, stays, and goes away.
// Shared by all the games. A banner is { title, subtitle, start } where start is a game time (ms).
import {
  BANNER_END_Y,
  BANNER_HOLD,
  BANNER_IN,
  BANNER_OUT,
  BANNER_SHOW_Y,
  BANNER_START_Y,
} from "./config.js";
import { quadIn, quadOut, tween } from "./tween.js";

// Time that the banner is on the screen (ms).
export const BANNER_TOTAL = BANNER_IN + BANNER_HOLD + BANNER_OUT;

// Height of the banner after `elapsed` ms.
export function bannerY(elapsed) {
  if (elapsed < BANNER_IN)
    return tween(BANNER_START_Y, BANNER_SHOW_Y, elapsed, BANNER_IN, quadOut);
  if (elapsed < BANNER_IN + BANNER_HOLD) return BANNER_SHOW_Y;
  return tween(
    BANNER_SHOW_Y,
    BANNER_END_Y,
    elapsed - BANNER_IN - BANNER_HOLD,
    BANNER_OUT,
    quadIn,
  );
}
