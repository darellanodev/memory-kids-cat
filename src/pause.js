import { H, W } from "./config.js";
import { drawText } from "./ui.js";

// Pause of the game when the page is hidden (the player changes app, locks the phone...).
// While it is paused the scenes do not get time, so nothing moves and no time bar runs.

// A clock that does not count the time paused. Give it the real time (the `now` of
// requestAnimationFrame, in ms) and it gives the game time back.
export class PauseClock {
  constructor() {
    this.paused = false;
    this.pausedSince = 0; // real time when the pause started
    this.offset = 0; // total time paused before (ms)
  }

  pause(realNow) {
    if (this.paused) return;
    this.paused = true;
    this.pausedSince = realNow;
  }

  resume(realNow) {
    if (!this.paused) return;
    this.paused = false;
    this.offset += Math.max(0, realNow - this.pausedSince);
  }

  // Game time: the real time without the time paused.
  time(realNow) {
    return realNow - this.offset;
  }
}

// Dark layer with the text "PAUSED". Draw it over the last picture of the game.
export function drawPauseOverlay(ctx) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, W, H);
  drawText(ctx, "PAUSED", W / 2, 300, { size: 90, align: "center" });
  drawText(ctx, "TAP TO CONTINUE", W / 2, 420, { size: 38, align: "center" });
}
