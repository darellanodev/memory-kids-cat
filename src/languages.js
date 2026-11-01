// "Languages" game: the rules of one level. This file does not draw or read the pointer.
//
// 6 pictures come in, with their word in the chosen language under each one. After a few
// seconds the words disappear and the cat shows a word at the top. The player taps the picture
// of that word. The words come in the order 0, 1, 2... 5 (like the old C_NivelIdiomas):
//   - a right picture gives points and the full time again, and its word stays under it
//   - a wrong picture takes points and a life. With no lives left, the game is lost
// Phases: dealing -> observing -> waiting -> playing -> complete (result "complete")
//         playing -> lost / timeup (result "lost" / "timeup", after the banner)
// There is no banner at the start of a level in this game. The pictures are never turned face down.
import { BANNER_TOTAL, bannerY } from "./banner.js";
import {
  CARD_SIZE,
  COMPLETE_DELAY,
  DEAL_DELAY,
  DEAL_DURATION,
  DEAL_START,
  EQ_FAIL_ICON_TIME,
  EQ_LIVES,
  LANG_BOARD,
  LANG_CARDS,
  LANG_COLS,
  LANG_COVER_WAIT,
  LANG_DEAL_TICKS,
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

export class LanguagesGame {
  // theme: { key, title, num }. `num` (0 to 3) says which pictures and words the level uses.
  // language: "en", "es", "fr" or "ge". score and lives come from the previous levels.
  constructor({ theme, levelNumber, language, score = 0, lives = EQ_LIVES, sfx = () => {}, random = Math.random }) {
    this.theme = theme;
    this.levelNumber = levelNumber;
    this.language = language;
    this.score = score;
    this.lives = lives;
    this.sfx = sfx;

    this.clock = 0; // ms of game time
    this.lastUpdate = null;
    this.started = false;
    this.phase = "dealing";
    this.phaseStart = 0;
    this.result = null; // null while playing, then "complete", "lost" or "timeup"

    this.found = 0; // pictures found. It is also the number of the word to find now
    this.timeStart = 0;
    this.failedCard = null; // the last wrong card (it gets the red cross)
    this.failAt = -Infinity;
    this.particles = new ParticleSystem(random);
    this.banner = null; // only used when the game ends

    // The 6 pictures in random places, 3 per row.
    const ids = shuffle(Array.from({ length: LANG_CARDS }, (_, i) => i), random);
    this.cards = ids.map((id, i) => ({
      id,
      fx: LANG_BOARD.x + (i % LANG_COLS) * LANG_BOARD.stepX,
      fy: LANG_BOARD.y + Math.floor(i / LANG_COLS) * LANG_BOARD.stepY,
      x: DEAL_START.x,
      y: DEAL_START.y,
    }));
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
        if (inPhase >= LANG_DEAL_TICKS * DEAL_DELAY) this.setPhase("observing");
        break;

      case "observing":
        if (inPhase >= OBSERVE_TIME) {
          this.sfx("tapartodos"); // the old game made this sound here, but did not turn the cards
          this.setPhase("waiting");
        }
        break;

      case "waiting":
        if (inPhase >= LANG_COVER_WAIT) {
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

  // The player taps at p (game coordinates). Returns true if a picture was tapped.
  tap(p) {
    if (this.phase !== "playing") return false;
    const card = this.cards.find(
      (c) => p.x >= c.x && p.x < c.x + CARD_SIZE && p.y >= c.y && p.y < c.y + CARD_SIZE,
    );
    // A picture that was already found does nothing (the old game took a life for it).
    if (!card || card.id < this.found) return false;

    if (card.id === this.found) {
      this.sfx("match");
      this.score += POINTS_MATCH;
      this.timeStart = this.clock; // every right picture gives the full time again
      this.found++;
      this.particles.explosion(p.x, p.y, PARTICLES_EQUALS);
      if (this.found === LANG_CARDS) this.setPhase("complete");
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
    if (this.phase === "dealing" || this.phase === "observing" || this.phase === "waiting" || this.phase === "complete")
      return TIME_BAR_MAX;
    const used = Math.floor((this.clock - this.timeStart) / TIME_BAR_STEP);
    return Math.max(0, TIME_BAR_MAX - used);
  }

  // Show the text "LOOK AT THE PICTURES"?
  get showLookText() {
    return this.phase === "observing" && this.clock - this.phaseStart >= LOOK_TEXT_DELAY;
  }

  // Is the word of this picture shown under it? (Before the game, at the end, and when it was found.)
  wordVisible(card) {
    return this.phase !== "playing" || card.id < this.found;
  }

  // Show the cat with the word to find?
  get showCatWord() {
    return this.phase === "playing" && this.found < LANG_CARDS;
  }

  // Show the score, the lives and the time bar?
  get showHud() {
    return ["playing", "complete", "lost", "timeup"].includes(this.phase);
  }

  // Show the red cross on the last wrong picture?
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
