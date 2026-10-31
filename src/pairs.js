// "Make pairs" game: the rules of one level. This file does not draw or read the pointer.
//
// A level goes through these phases (like the old C_NivelParejas):
//   dealing   -> the cards come in one by one, face up (the banner "LEVEL n" shows)
//   observing -> the player looks at the pictures
//   covering  -> the cards are turned face down one by one
//   playing   -> the player taps two cards at a time to find the pairs
//   complete  -> all the pairs were found (result = "complete")
//   timeup    -> the time bar is empty (result = "timeup", after the banner)
//
// The game has its own clock that grows with the time given to update(), so it
// does not jump when the tab was hidden.
import {
  BOARD_X,
  BOARD_Y,
  CARD_SIZE,
  COLS,
  COMPLETE_DELAY,
  COVER_DELAY,
  DEAL_DELAY,
  DEAL_DURATION,
  DEAL_START,
  LOOK_TEXT_DELAY,
  MISS_COVER_DELAY,
  OBSERVE_TIME,
  PAIRS,
  PARTICLES_PER_CARD,
  PARTICLE_OFFSET,
  POINTS_MATCH,
  POINTS_MISS,
  ROWS,
  TIME_BAR_MAX,
  TIME_BAR_STEP,
} from "./config.js";
import { BANNER_TOTAL, bannerY } from "./banner.js";
import { ParticleSystem } from "./particles.js";
import { shuffle } from "./random.js";
import { linear, tween } from "./tween.js";

const CARD_COUNT = COLS * ROWS;

export class PairsGame {
  // theme: one of THEMES. levelNumber: 1, 2, 3... (for the banner).
  // score: points from the previous levels. sfx(name): called to play a sound.
  constructor({ theme, levelNumber, score = 0, sfx = () => {}, random = Math.random }) {
    this.theme = theme;
    this.levelNumber = levelNumber;
    this.score = score;
    this.sfx = sfx;

    this.clock = 0; // ms of game time
    this.lastUpdate = null; // time of the previous frame
    this.started = false;
    this.phase = "dealing";
    this.phaseStart = 0;
    this.result = null; // null while playing, then "complete" or "timeup"

    this.matched = 0; // pairs found
    this.selected = []; // indexes of the face up cards that are not fixed
    this.coverAt = null; // when the two cards that are not a pair are covered
    this.timeStart = 0; // the time bar starts to lose width from here
    this.particles = new ParticleSystem(random);

    // Two cards of every picture, in random places.
    const ids = shuffle(Array.from({ length: CARD_COUNT }, (_, i) => i % PAIRS), random);
    this.cards = ids.map((id, i) => ({
      id,
      state: "up", // "up" (face up), "down" (face down) or "fixed" (found)
      // Final place on the board.
      fx: BOARD_X + (i % COLS) * CARD_SIZE,
      fy: BOARD_Y + Math.floor(i / COLS) * CARD_SIZE,
      x: DEAL_START.x,
      y: DEAL_START.y,
    }));

    this.banner = { title: `LEVEL ${levelNumber}`, subtitle: theme.title, start: 0 };
  }

  // Call once per frame. `now` is the time in ms.
  update(now) {
    // Time since the previous frame. The limit avoids big jumps (for example
    // when the tab was hidden).
    const dt = this.lastUpdate === null ? 0 : Math.min(now - this.lastUpdate, 100);
    this.lastUpdate = now;
    this.clock += dt;

    if (!this.started) {
      this.started = true;
      this.sfx("completed"); // the old game played this sound when a level starts
    }

    this.moveCards();
    this.particles.update(dt);

    if (this.banner && this.clock - this.banner.start >= BANNER_TOTAL)
      this.banner = null;

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
        // Two cards that are not a pair are covered after a while.
        if (this.coverAt !== null && this.clock >= this.coverAt) this.coverSelected();
        if (this.timeLeft <= 0) {
          this.sfx("endgame");
          this.banner = { title: "TIME IS UP", subtitle: "", start: this.clock };
          this.setPhase("timeup");
        }
        break;

      case "complete":
        if (inPhase >= COMPLETE_DELAY) this.result = "complete";
        break;

      case "timeup":
        if (!this.banner) this.result = "timeup";
        break;
    }
  }

  setPhase(phase) {
    this.phase = phase;
    this.phaseStart = this.clock;
  }

  // Cards come from outside the screen to their place (linear movement, 2 s).
  moveCards() {
    this.cards.forEach((card, i) => {
      const elapsed = this.clock - i * DEAL_DELAY;
      card.x = tween(DEAL_START.x, card.fx, elapsed, DEAL_DURATION, linear);
      card.y = tween(DEAL_START.y, card.fy, elapsed, DEAL_DURATION, linear);
    });
  }

  // The player taps at p (game coordinates). Returns true if a card was turned.
  tap(p) {
    if (this.phase !== "playing") return false;
    const i = this.cards.findIndex(
      (c) =>
        c.state === "down" &&
        p.x >= c.x &&
        p.x < c.x + CARD_SIZE &&
        p.y >= c.y &&
        p.y < c.y + CARD_SIZE,
    );
    if (i < 0) return false;

    this.sfx("select");
    // Tapping again before the cards are covered covers the two old ones now.
    if (this.selected.length === 2) this.coverSelected();
    this.cards[i].state = "up";
    this.selected.push(i);

    if (this.selected.length === 2) this.checkPair();
    return true;
  }

  checkPair() {
    const [a, b] = this.selected.map((i) => this.cards[i]);
    if (a.id === b.id) {
      a.state = "fixed";
      b.state = "fixed";
      this.selected = [];
      this.sfx("match");
      for (const card of [a, b])
        this.particles.explosion(
          card.x + PARTICLE_OFFSET,
          card.y + PARTICLE_OFFSET,
          PARTICLES_PER_CARD,
        );
      this.score += POINTS_MATCH;
      this.timeStart = this.clock; // every pair gives the full time again
      this.matched++;
      if (this.matched === PAIRS) this.setPhase("complete");
    } else {
      this.coverAt = this.clock + MISS_COVER_DELAY;
      this.score = Math.max(0, this.score - POINTS_MISS);
    }
  }

  coverSelected() {
    this.selected.forEach((i) => (this.cards[i].state = "down"));
    this.selected = [];
    this.coverAt = null;
  }

  // Width of the red time bar in px (TIME_BAR_MAX when it is full).
  get timeLeft() {
    if (this.phase === "dealing" || this.phase === "observing" || this.phase === "covering")
      return TIME_BAR_MAX;
    if (this.phase === "complete") return TIME_BAR_MAX;
    const used = Math.floor((this.clock - this.timeStart) / TIME_BAR_STEP);
    return Math.max(0, TIME_BAR_MAX - used);
  }

  // Show the text "LOOK AT THE PICTURES"?
  get showLookText() {
    return this.phase === "observing" && this.clock - this.phaseStart >= LOOK_TEXT_DELAY;
  }

  // Is the game lost? (the scene shows the banner and goes back to the title)
  get over() {
    return this.phase === "timeup";
  }

  // Show the score and the time bar?
  get showHud() {
    return this.phase === "playing" || this.phase === "complete" || this.phase === "timeup";
  }

  // Vertical position of the banner, or null when there is no banner.
  get bannerY() {
    return this.banner ? bannerY(this.clock - this.banner.start) : null;
  }
}
