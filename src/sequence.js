// "Sequence" game: the rules. This file does not draw or read the pointer.
//
// The game shows a sequence of animals (each one makes its sound and grows a little) and the
// player repeats it. The sequence starts with 3 animals and grows by one every time it is
// repeated, in 3 stages (like the old C_NivelSecuencia):
//   EASY: 3, 4, 5 animals.  HARD: 6, 7, 8.  EXPERT: 9, 10, 11. After that, the player wins.
//
// Phases:
//   dealing   -> the cards come in one by one (the banner "LEVEL n / EASY" shows)
//   observing -> the animals of the sequence play one by one
//   playing   -> the player taps the animals in the same order (there is a time bar)
//   fail / timeup / win -> a banner shows, and then result is set
import { BANNER_TOTAL, bannerY } from "./banner.js";
import {
  CARD_SIZE,
  DEAL_DELAY,
  DEAL_DURATION,
  DEAL_START,
  SEQ_CARD_IDS,
  SEQ_CARD_POS,
  SEQ_DEAL_TICKS,
  SEQ_FAIL_ICON_TIME,
  SEQ_FIRST_WAIT,
  SEQ_NEXT_WAIT,
  SEQ_SOUNDS,
  SEQ_STAGES,
  SEQ_START_LENGTH,
  SEQ_TEXT_LEAD,
  SEQ_TOTAL,
  SEQ_ZOOM_SIZE,
  SEQ_ZOOM_SPEED,
  SEQ_ZOOM_STEP,
  TIME_BAR_MAX,
  TIME_BAR_STEP,
} from "./config.js";
import { ParticleSystem } from "./particles.js";
import { linear, tween } from "./tween.js";

export class SequenceGame {
  // sfx(name): called to play a sound. random: function from 0 to 1 (can be changed in tests).
  constructor({ sfx = () => {}, random = Math.random } = {}) {
    this.sfx = sfx;
    this.clock = 0; // ms of game time
    this.lastUpdate = null;
    this.started = false;
    this.phase = "dealing";
    this.phaseStart = 0;
    this.result = null; // null while playing, then "win", "fail" or "timeup"

    // The whole sequence is chosen at the start. Every number is the index of a card (0 to 5).
    this.sequence = Array.from({ length: SEQ_TOTAL }, () => Math.floor(random() * SEQ_CARD_IDS.length));
    this.length = SEQ_START_LENGTH; // how many animals the player has to repeat now
    this.pointer = 0; // observing: animals already played. playing: animals already repeated
    this.waitBeforeFirst = SEQ_FIRST_WAIT;
    this.timeStart = 0;

    this.dealBase = 0; // the cards come in from here (changed to skip the movement in later stages)
    this.cards = SEQ_CARD_IDS.map((id, i) => ({
      index: i,
      id,
      fx: SEQ_CARD_POS[i].x,
      fy: SEQ_CARD_POS[i].y,
      x: DEAL_START.x,
      y: DEAL_START.y,
      zoomAt: -Infinity, // game time when it was played (for the zoom)
    }));

    this.failedCard = null; // card where the player was wrong
    this.failAt = 0;
    this.particles = new ParticleSystem(random);
    this.banner = this.stageBanner(0);
  }

  // Number of the stage (0 EASY, 1 HARD, 2 EXPERT) for the current length.
  get stage() {
    let stage = 0;
    SEQ_STAGES.forEach((s, i) => {
      if (this.length >= s.from) stage = i;
    });
    return stage;
  }

  stageBanner(stage) {
    return {
      title: `LEVEL ${stage + 1}`,
      subtitle: SEQ_STAGES[stage].title,
      start: this.clock,
    };
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

    this.moveCards();
    this.particles.update(dt);
    if (this.banner && this.clock - this.banner.start >= BANNER_TOTAL) this.banner = null;

    const inPhase = this.clock - this.phaseStart;
    switch (this.phase) {
      case "dealing":
        if (inPhase >= SEQ_DEAL_TICKS * DEAL_DELAY) this.startObserving(SEQ_FIRST_WAIT);
        break;

      case "observing":
        // Play the next animal of the sequence when its time comes.
        while (
          this.pointer < this.length &&
          inPhase >= this.waitBeforeFirst + this.pointer * SEQ_ZOOM_STEP
        ) {
          this.playCard(this.cards[this.sequence[this.pointer]]);
          this.pointer++;
        }
        if (inPhase >= this.waitBeforeFirst + this.length * SEQ_ZOOM_STEP) {
          this.pointer = 0;
          this.timeStart = this.clock;
          this.setPhase("playing");
        }
        break;

      case "playing":
        if (this.timeLeft <= 0) {
          this.sfx("endgame");
          this.banner = { title: "TIME IS UP", subtitle: "", start: this.clock };
          this.setPhase("timeup");
        }
        break;

      case "fail":
      case "timeup":
      case "win":
        if (!this.banner) this.result = this.phase;
        break;
    }
  }

  startObserving(wait) {
    this.pointer = 0;
    this.waitBeforeFirst = wait;
    this.setPhase("observing");
  }

  // The cards come in from outside the screen (linear movement), one after another.
  moveCards() {
    this.cards.forEach((card, i) => {
      const elapsed = this.clock - this.dealBase - i * DEAL_DELAY;
      card.x = tween(DEAL_START.x, card.fx, elapsed, DEAL_DURATION, linear);
      card.y = tween(DEAL_START.y, card.fy, elapsed, DEAL_DURATION, linear);
    });
  }

  // The animal makes its sound and its card grows for a moment.
  playCard(card) {
    this.sfx(SEQ_SOUNDS[card.index]);
    card.zoomAt = this.clock;
  }

  // Size of a card on the screen: it starts big when it was just played and shrinks.
  cardSize(card) {
    return Math.max(CARD_SIZE, SEQ_ZOOM_SIZE - (this.clock - card.zoomAt) * SEQ_ZOOM_SPEED);
  }

  // The player taps at p (game coordinates). Returns true if a card was tapped.
  tap(p) {
    if (this.phase !== "playing") return false;
    const card = this.cards.find(
      (c) => p.x >= c.x && p.x < c.x + CARD_SIZE && p.y >= c.y && p.y < c.y + CARD_SIZE,
    );
    if (!card) return false;

    this.playCard(card);

    if (card.index !== this.sequence[this.pointer]) {
      // Wrong animal: game over.
      this.sfx("endgame");
      this.failedCard = card;
      this.failAt = this.clock;
      this.banner = { title: "FAIL!", subtitle: "", start: this.clock };
      this.setPhase("fail");
      return true;
    }

    this.particles.explosion(p.x, p.y, 2);
    if (this.pointer < this.length - 1) {
      this.pointer++; // right, but the sequence is not finished
      return true;
    }

    // The whole sequence was repeated.
    const before = this.stage;
    this.length++;
    this.pointer = 0;
    this.timeStart = this.clock;
    if (this.length === SEQ_TOTAL) {
      this.sfx("completed");
      this.banner = { title: "YOU WIN!", subtitle: "1.000 POINTS", start: this.clock };
      this.setPhase("win");
    } else if (this.stage !== before) {
      // New stage: banner and a new start (the cards are already in their places).
      this.banner = this.stageBanner(this.stage);
      this.sfx("completed");
      this.dealBase = -1e9;
      this.setPhase("dealing");
    } else {
      this.startObserving(SEQ_NEXT_WAIT);
    }
    return true;
  }

  // Width of the red time bar in px (TIME_BAR_MAX when it is full).
  get timeLeft() {
    if (this.phase !== "playing") return TIME_BAR_MAX;
    const used = Math.floor((this.clock - this.timeStart) / TIME_BAR_STEP);
    return Math.max(0, TIME_BAR_MAX - used);
  }

  // Text for the top of the screen while the sequence plays (or null).
  get observeText() {
    if (this.phase !== "observing") return null;
    const inPhase = this.clock - this.phaseStart;
    if (inPhase >= this.waitBeforeFirst - SEQ_TEXT_LEAD) return "WATCH THE SEQUENCE";
    if (this.length > SEQ_START_LENGTH) return "GOOD!";
    return null;
  }

  // Show the red cross on the card where the player was wrong?
  get showFailIcon() {
    return this.phase === "fail" && this.clock - this.failAt < SEQ_FAIL_ICON_TIME;
  }

  // Vertical position of the banner, or null when there is no banner.
  get bannerY() {
    return this.banner ? bannerY(this.clock - this.banner.start) : null;
  }
}
