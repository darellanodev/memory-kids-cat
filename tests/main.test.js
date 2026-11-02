// Runs the real main.js with a fake browser (canvas, events, clock), to test how the game reacts
// when the page is hidden: pause, PAUSED layer, resume with a tap, and the time of the game.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/assets.js", () => ({ img: (name) => ({ name }), loadAssets: async () => {} }));
vi.mock("../src/audio.js", () => ({
  play: vi.fn(),
  stopAll: vi.fn(),
  unlockAudio: vi.fn(),
  loadSounds: vi.fn(),
}));

import { BTN_PLAY, BTN_PLAY_MENU, GAME_PAIRS } from "../src/config.js";

const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

let browser;

// A drawing context that accepts any call and remembers it.
function fakeContext() {
  const store = {};
  return new Proxy(store, {
    get: (target, key) => (key in target ? target[key] : (target[key] = vi.fn())),
    set: (target, key, value) => ((target[key] = value), true),
  });
}

async function startGame() {
  vi.resetModules();
  const listeners = { canvas: {}, document: {}, window: {} };
  let now = 0;
  let frame = null;
  const ctx = fakeContext();
  const canvas = {
    getContext: () => ctx,
    addEventListener: (type, fn) => (listeners.canvas[type] = fn),
    setPointerCapture: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 500, height: 800 }),
  };
  const document = {
    hidden: false,
    getElementById: (id) => (id === "game" ? canvas : { textContent: "" }),
    addEventListener: (type, fn) => (listeners.document[type] = fn),
  };
  vi.stubGlobal("document", document);
  vi.stubGlobal("window", {
    devicePixelRatio: 1,
    addEventListener: (type, fn) => (listeners.window[type] = fn),
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} });
  vi.stubGlobal("requestAnimationFrame", (fn) => { frame = fn; });
  vi.spyOn(performance, "now").mockImplementation(() => now);

  await import("../src/main.js");
  await new Promise((resolve) => setTimeout(resolve, 0)); // start() waits for the assets
  const audio = await import("../src/audio.js");
  const { PairsGame } = await import("../src/pairs.js");
  const updates = []; // the time that the game receives in every update
  const original = PairsGame.prototype.update;
  vi.spyOn(PairsGame.prototype, "update").mockImplementation(function (time) {
    updates.push(time);
    browser.game = this;
    return original.call(this, time);
  });

  browser = {
    ctx,
    audio,
    document,
    listeners,
    updates,
    game: null,
    // The screen draws about 60 times per second.
    tick(ms) {
      const end = now + ms;
      while (now < end) {
        now += 16;
        const next = frame;
        frame = null;
        next(now);
      }
    },
    // The page was hidden for `ms` (the browser does not call the loop at that time).
    hideFor(ms) {
      document.hidden = true;
      listeners.document.visibilitychange();
      now += ms;
      document.hidden = false;
    },
    tap: (p) => listeners.canvas.pointerdown({ pointerId: 1, clientX: p.x, clientY: p.y }),
    // Is the PAUSED layer drawn in the next frame?
    paused() {
      ctx.fillText.mockClear();
      browser.tick(16);
      return ctx.fillText.mock.calls.some((c) => c[0] === "PAUSED");
    },
  };
}

// Go to a game of Make pairs and wait for the moment that it can be played.
function startPairs() {
  browser.tick(100);
  browser.tap(center(BTN_PLAY));
  browser.tap(center(GAME_PAIRS));
  browser.tick(9000);
  expect(browser.game.phase).toBe("playing");
}

beforeEach(startGame);
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("main loop and pause", () => {
  it("starts on the title and the loop runs", () => {
    browser.tick(200);
    expect(browser.ctx.drawImage).toHaveBeenCalled();
    expect(browser.paused()).toBe(false);
  });

  it("hiding the page pauses a game: it stops, the sounds stop, and PAUSED is drawn", () => {
    startPairs();
    const clock = browser.game.clock;
    browser.document.hidden = true;
    browser.listeners.document.visibilitychange();
    expect(browser.audio.stopAll).toHaveBeenCalled();
    browser.tick(5000);
    expect(browser.game.clock).toBe(clock);
    expect(browser.paused()).toBe(true);
  });

  it("the game goes on from where it was after a long pause, without a jump in its time", () => {
    startPairs();
    browser.tick(1000);
    const before = browser.updates.at(-1);
    browser.hideFor(60000); // one minute
    browser.tick(32);
    browser.tap({ x: 250, y: 400 }); // a tap to continue
    browser.tick(64);
    const after = browser.updates.at(-1);
    expect(after - before).toBeGreaterThan(0);
    expect(after - before).toBeLessThan(500); // not 60000
  });

  it("the tap that resumes is not used by the game (the MENU button does not open the dialog)", () => {
    startPairs();
    browser.hideFor(1000);
    browser.tick(32);
    const calls = browser.updates.length;
    browser.tap(center(BTN_PLAY_MENU));
    browser.tick(160);
    expect(browser.paused()).toBe(false);
    expect(browser.updates.length).toBeGreaterThan(calls + 5); // the game runs: there is no dialog
  });

  it("a key also resumes, and the Escape key is not used for the game", () => {
    startPairs();
    browser.hideFor(1000);
    browser.tick(32);
    browser.listeners.window.keydown({ key: "Escape" });
    browser.tick(160);
    const calls = browser.updates.length;
    browser.tick(160);
    expect(browser.updates.length).toBeGreaterThan(calls); // no exit dialog
  });

  it("the event pagehide also pauses", () => {
    startPairs();
    browser.listeners.window.pagehide();
    browser.tick(32);
    expect(browser.paused()).toBe(true);
  });

  it("the title is not paused (it has no time)", () => {
    browser.tick(100);
    browser.hideFor(1000);
    browser.tick(32);
    expect(browser.paused()).toBe(false);
    expect(browser.audio.stopAll).not.toHaveBeenCalled();
  });

  it("pausing twice in a row does not lose time", () => {
    startPairs();
    browser.listeners.window.pagehide();
    browser.hideFor(2000);
    browser.tick(32);
    browser.tap({ x: 250, y: 400 });
    browser.tick(64);
    expect(browser.paused()).toBe(false);
    const times = browser.updates.slice(-4);
    expect(times.at(-1) - times[0]).toBeLessThan(200);
  });
});
