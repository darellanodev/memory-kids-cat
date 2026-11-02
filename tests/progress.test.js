import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const KEY = "memorykidscat-progress";

// A fake localStorage in memory.
function fakeStorage(initial) {
  const data = initial === undefined ? {} : { [KEY]: initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
  };
}

// progress.js reads the storage when it is loaded, so every test loads it again.
async function loadProgress(storage) {
  vi.resetModules();
  if (storage) vi.stubGlobal("localStorage", storage);
  return import("../src/progress.js");
}

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.unstubAllGlobals());

describe("saved progress", () => {
  it("starts with the sound on, no score and no experience", async () => {
    const p = await loadProgress(fakeStorage());
    expect(p.isSoundOn()).toBe(true);
    expect(p.getBestScore()).toBe(0);
    expect(p.getXp()).toBe(0);
  });

  it("saves the sound option", async () => {
    const storage = fakeStorage();
    const p = await loadProgress(storage);
    p.setSound(false);
    expect(p.isSoundOn()).toBe(false);
    expect(JSON.parse(storage.data[KEY]).sound).toBe(false);
    const again = await loadProgress(storage);
    expect(again.isSoundOn()).toBe(false);
  });

  it("only keeps a score if it is the best one", async () => {
    const p = await loadProgress(fakeStorage());
    p.saveScore(100);
    p.saveScore(40);
    expect(p.getBestScore()).toBe(100);
    p.saveScore(250);
    expect(p.getBestScore()).toBe(250);
  });

  it("adds experience and keeps it", async () => {
    const storage = fakeStorage();
    const p = await loadProgress(storage);
    p.addXp(300);
    p.addXp(125.9); // whole points only
    p.addXp(-50); // it never goes down
    expect(p.getXp()).toBe(425);
    expect((await loadProgress(storage)).getXp()).toBe(425);
  });

  it("loads data saved by an old version that had no experience", async () => {
    const p = await loadProgress(fakeStorage(JSON.stringify({ sound: false, bestScore: 40 })));
    expect(p.isSoundOn()).toBe(false);
    expect(p.getBestScore()).toBe(40);
    expect(p.getXp()).toBe(0);
  });

  it("uses the default values when the saved data is not valid", async () => {
    const p = await loadProgress(fakeStorage("this is not json"));
    expect(p.isSoundOn()).toBe(true);
    expect(p.getBestScore()).toBe(0);
    const q = await loadProgress(fakeStorage(JSON.stringify({ bestScore: "abc", xp: -5 })));
    expect(q.getBestScore()).toBe(0);
    expect(q.getXp()).toBe(0);
  });

  it("works without storage (the data is kept until the page is closed)", async () => {
    const p = await loadProgress(); // there is no localStorage in Node
    p.addXp(10);
    p.saveScore(5);
    p.setSound(false);
    expect(p.getXp()).toBe(10);
    expect(p.getBestScore()).toBe(5);
    expect(p.isSoundOn()).toBe(false);
  });

  it("works when the storage fails to save", async () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error("full"); } };
    const p = await loadProgress(storage);
    expect(() => p.addXp(10)).not.toThrow();
    expect(p.getXp()).toBe(10);
  });
});
