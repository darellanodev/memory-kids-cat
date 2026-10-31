// "Equals" game: the rules of one level. This file does not draw or read the pointer.
//
// 12 cards come in face up: 6 of one picture and 6 of another one. The player looks at them,
// they are turned face down, and then the player has to find the 6 cards that are like the
// model card (the one in the speech bubble of the cat). Like the old C_NivelEquals:
//   - every right card gives points and the full time again
//   - a wrong card takes points and a life, and it stays face up. With no lives left, the game is lost
// Phases: dealing -> observing -> covering -> playing -> complete (result "complete")
//         playing -> lost / timeup (result "lost" / "timeup", after the banner)
import { BANNER_TOTAL, bannerY } from "./banner.js";
import {
  CARD_SIZE,
  COMPLETE_DELAY,
  COVER_DELAY,
  DEAL_DELAY,
  DEAL_DURATION,
  DEAL_START,
  BOARD_X,
  EQ_COLS,
  EQ_FAIL_ICON_TIME,
  EQ_LIVES,
  EQ_ROWS,
  EQ_TARGETS,
  EQ_Y,
  LOOK_TEXT_DELAY,
  OBSERVE_TIME,
  PARTICLES_EQUALS,
  POINTS_MATCH,
  POINTS_MISS,
  TIME_BAR_MAX,
  TIME_BAR_STEP,
} from "./config.js";
import { ParticleSystem } from "./particles.js";
import { shuffle } from "./random.js";
import { linear, tween } from "./tween.js";

const CARD_COUNT = EQ_COLS * EQ_ROWS;

export class EqualsGame {
  // theme: one of THEMES. levelNumber: 1, 2, 3... (for the banner).
  // score and lives come from the previous levels. sfx(name) plays a sound.
  constructor({ theme, levelNumber, score = 0, lives = EQ_LIVES, sfx = () => {}, random = Math.random }) {
    this.theme = theme;
    this.levelNumber = levelNumber;
    this.score = score;
    this.lives = lives;
    this.sfx = sfx;

    this.clock = 0; // ms of game time
    this.lastUpdate = null;
    this.started = false;
    this.phase = "dealing";
    this.phaseStart = 0;
    this.result = null; // null while playing, then "complete", "lost" or "timeup"

    this.found = 0; // cards like the model that the player found
    this.timeStart = 0;
    this.failedCard = null; // the last wrong card (it gets the red cross)
    this.failAt = -Infinity;
    this.particles = new ParticleSystem(random);

    // The model is picture 0 or 1 of the theme. Half of the cards are like it.
    this.model = Math.floor(random() * 2);
    const ids = shuffle(Array.from({ length: CARD_COUNT }, (_, i) => i % 2), random);
    this.cards = ids.map((id, i) => ({
      id,
      state: "up", // "up" (face up) or "down" (face down)
      fx: BOARD_X + (i % EQ_COLS) * CARD_SIZE,
      fy: EQ_Y + Math.floor(i / EQ_COLS) * CARD_SIZE,
      x: DEAL_START.x,
      y: DEAL_START.y,
    }));

    this.banner = { title: `LEVEL ${levelNumber}`, subtitle: theme.title, start: 0 };
  }

  setPhase(phase) {
    this.phase = phase;
    this.phaseStart = this.clock;
  }

  // Call once per frame. `now` is the time in ms.
  update(now) {
    // Time since the previous frame, limited to avoid big jumps (for example a hidden tab).
    const dt = this.lastUpdate === null ? 0 : Math.min(now - this.lastUpdate, 100);
    this.lastUpdate = now;
    this.clock += dt;

    if (!this.started) {
      this.started = true;
      this.sfx("completed"); // the old game played this sound when a level starts
    }

    this.cards.forEach((card, i) => {
      const elapsed = this.clock - i * DEAL_DELAY;
      card.x = tween(DEAL_START.x, card.fx, elapsed, DEAL_DURATION, linear);
      card.y = tween(DEAL_START.y, card.fy, elapsed, DEAL_DURATION, linear);
    });
    this.particles.update(dt);
    if (this.banner && this.clock - this.banner.start >= BANNER_TOTAL) this.banner = null;

    const inPhase = this.clock - this.phaseStart;
    switch (this.phase) {
      case "dealing":
        if (inPhase >= CARD_COUNT * DEAL_DELAY) this.setPhase("observing");
        break;

      case "observing":
        if (inPhase >= OBSERVE_TIME) {
          this.sfx("tapartodos");
          this.setPhase("covering");
        }
        break;

      case "covering":
        this.cards.forEach((card, i) => {
          if (inPhase >= i * COVER_DELAY) card.state = "down";
        });
        if (inPhase >= CARD_COUNT * COVER_DELAY) {
          this.timeStart = this.clock;
          this.setPhase("playing");
        }
        break;

      case "playing":
        if (this.timeLeft <= 0) this.finish("timeup", "TIME IS UP", "");
        break;

      case "complete":
        if (inPhase >= COMPLETE_DELAY) this.result = "complete";
        break;

      case "lost":
      case "timeup":
        if (!this.banner) this.result = this.phase;
        break;
    }
  }

  // The game is lost: sound, banner, and the result when the banner ends.
  finish(phase, title, subtitle) {
    this.sfx("endgame");
    this.banner = { title, subtitle, start: this.clock };
    this.setPhase(phase);
  }

  // The player taps at p (game coordinates). Returns true if a card was turned.
  tap(p) {
    if (this.phase !== "playing") return false;
    const card = this.cards.find(
      (c) =>
        c.state === "down" &&
        p.x >= c.x &&
        p.x < c.x + CARD_SIZE &&
        p.y >= c.y &&
        p.y < c.y + CARD_SIZE,
    );
    if (!card) return false;

    card.state = "up"; // it stays face up, right or wrong
    if (card.id === this.model) {
      this.sfx("match");
      this.score += POINTS_MATCH;
      this.timeStart = this.clock; // every right card gives the full time again
      this.found++;
      this.particles.explosion(p.x, p.y, PARTICLES_EQUALS);
      if (this.found === EQ_TARGETS) this.setPhase("complete");
    } else {
      this.sfx("select"); // the old game made no sound here
      this.score = Math.max(0, this.score - POINTS_MISS);
      this.failedCard = card;
      this.failAt = this.clock;
      this.lives--;
      if (this.lives < 0) this.finish("lost", "YOU LOST", "ALL YOUR LIVES");
    }
    return true;
  }

  // Width of the red time bar in px (TIME_BAR_MAX when it is full).
  get timeLeft() {
    if (this.phase === "dealing" || this.phase === "observing" || this.phase === "covering" || this.phase === "complete")
      return TIME_BAR_MAX;
    const used = Math.floor((this.clock - this.timeStart) / TIME_BAR_STEP);
    return Math.max(0, TIME_BAR_MAX - used);
  }

  // Show the text "LOOK AT THE PICTURES"?
  get showLookText() {
    return this.phase === "observing" && this.clock - this.phaseStart >= LOOK_TEXT_DELAY;
  }

  // Show the cat with the model card?
  get showModel() {
    return this.phase === "playing" || this.phase === "complete";
  }

  // Show the score, the lives and the time bar?
  get showHud() {
    return ["playing", "complete", "lost", "timeup"].includes(this.phase);
  }

  // Show the red cross on the last wrong card?
  get showFailIcon() {
    return this.failedCard !== null && this.clock - this.failAt < EQ_FAIL_ICON_TIME;
  }

  // Is the game lost? (the scene shows the banner and goes back to the title)
  get over() {
    return this.phase === "lost" || this.phase === "timeup";
  }

  // Vertical position of the banner, or null when there is no banner.
  get bannerY() {
    return this.banner ? bannerY(this.clock - this.banner.start) : null;
  }
}
