// Checks that the settings and the files of src/assets agree. A missing image or a wrong
// size would only show up when the player reaches that screen, so it is checked here.
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BTN_BACK,
  BTN_CONGRATS_BACK,
  BTN_CREDITS,
  BTN_CREDITS_BACK,
  BTN_EXIT_NO,
  BTN_EXIT_YES,
  BTN_LANG_BACK,
  BTN_PLAY,
  BTN_PLAY_MENU,
  BTN_SOUND,
  CARD_SIZE,
  COLS,
  GAME_EQUALS,
  GAME_LANGUAGES,
  GAME_PAIRS,
  GAME_SEQUENCE,
  H,
  LANG_CARDS,
  LANG_LEVELS,
  LANGUAGES,
  MAP_LANG_POS,
  MAP_POS,
  PAIRS,
  ROWS,
  SEQ_CARD_IDS,
  SEQ_CARD_POS,
  SEQ_SOUNDS,
  SEQ_THEME,
  THEMES,
  W,
} from "../src/config.js";

const images = new URL("../src/assets/images/", import.meta.url);
const sounds = new URL("../src/assets/sounds/", import.meta.url);
const imageFile = (name) => new URL(name, images);

// Width and height of a PNG or JPG file, read from the file itself.
function sizeOf(name) {
  const bytes = fs.readFileSync(imageFile(name));
  if (name.endsWith(".png")) return { w: bytes.readUInt32BE(16), h: bytes.readUInt32BE(20) };
  let i = 2; // JPG: look for the "start of frame" block
  while (i < bytes.length) {
    const marker = bytes[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return { w: bytes.readUInt16BE(i + 7), h: bytes.readUInt16BE(i + 5) };
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  throw new Error("Cannot read the size of " + name);
}

describe("themes", () => {
  it("are 10, with a title and a different key each", () => {
    expect(THEMES).toHaveLength(10);
    expect(new Set(THEMES.map((t) => t.key)).size).toBe(10);
    expect(THEMES.every((t) => t.title.length > 0)).toBe(true);
  });

  it.each(THEMES.map((t) => [t.key]))("%s has its background and its sprite sheet", (key) => {
    expect(sizeOf(`fondo_${key}.jpg`)).toEqual({ w: W, h: H });
    // 10 pictures one under another
    expect(sizeOf(`cartas_${key}.png`)).toEqual({ w: CARD_SIZE, h: CARD_SIZE * 10 });
  });

  it("the board has a pair for each picture", () => {
    expect(COLS * ROWS).toBe(PAIRS * 2);
    expect(PAIRS).toBeLessThanOrEqual(10);
  });
});

describe("maps", () => {
  it("have one place for each level and one more for the end", () => {
    expect(MAP_POS).toHaveLength(THEMES.length + 1);
    expect(MAP_LANG_POS).toHaveLength(LANG_LEVELS + 1);
  });

  it("have their image and every place is inside the screen", () => {
    expect(sizeOf("mapa.jpg")).toEqual({ w: W, h: H });
    expect(sizeOf("mapa_idiomas.jpg")).toEqual({ w: W, h: H });
    for (const p of [...MAP_POS, ...MAP_LANG_POS]) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(W);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(H);
    }
  });
});

describe("full screen images", () => {
  it.each(["menu.jpg", "menugames.jpg", "menuidiomas.jpg", "creditos.jpg", "exit.jpg", "congratulations.jpg"])(
    "%s is 500 x 800",
    (name) => expect(sizeOf(name)).toEqual({ w: W, h: H }),
  );
});

describe("buttons", () => {
  const buttons = {
    BTN_PLAY, BTN_CREDITS, BTN_SOUND, BTN_BACK, BTN_CREDITS_BACK, BTN_CONGRATS_BACK,
    BTN_EXIT_YES, BTN_EXIT_NO, BTN_LANG_BACK, BTN_PLAY_MENU,
    GAME_PAIRS, GAME_SEQUENCE, GAME_LANGUAGES, GAME_EQUALS,
    ...Object.fromEntries(LANGUAGES.map((l) => ["LANGUAGE_" + l.code, l.rect])),
  };

  it.each(Object.entries(buttons))("%s is inside the screen", (_, r) => {
    expect(r.w).toBeGreaterThan(0);
    expect(r.h).toBeGreaterThan(0);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(W);
    expect(r.y + r.h).toBeLessThanOrEqual(H);
  });

  it("the buttons of the games menu do not overlap", () => {
    const games = [GAME_PAIRS, GAME_SEQUENCE, GAME_LANGUAGES, GAME_EQUALS];
    for (const a of games)
      for (const b of games) {
        if (a === b) continue;
        const apart = a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;
        expect(apart).toBe(true);
      }
  });
});

describe("Sequence game", () => {
  it("has 6 animals with a place, a picture and a sound", () => {
    expect(SEQ_CARD_IDS).toHaveLength(6);
    expect(SEQ_CARD_POS).toHaveLength(6);
    expect(SEQ_SOUNDS).toHaveLength(6);
    for (const id of SEQ_CARD_IDS) expect(id).toBeLessThan(10);
    for (const name of SEQ_SOUNDS) expect(fs.existsSync(new URL(`${name}.mp3`, sounds))).toBe(true);
    expect(THEMES.map((t) => t.key)).toContain(SEQ_THEME);
  });

  it("the animals are inside the screen", () => {
    for (const p of SEQ_CARD_POS) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + CARD_SIZE).toBeLessThanOrEqual(W);
      expect(p.y + CARD_SIZE).toBeLessThanOrEqual(H);
    }
  });
});

describe("Languages game", () => {
  it("has the pictures of every level", () => {
    for (let n = 0; n < LANG_LEVELS; n++)
      expect(sizeOf(`cartas_language${n}.png`)).toEqual({ w: CARD_SIZE, h: CARD_SIZE * LANG_CARDS });
  });

  it("has the words of every language in every level", () => {
    for (const { code } of LANGUAGES)
      for (let n = 0; n < LANG_LEVELS; n++)
        expect(sizeOf(`cartas_lang_${code}${n}.png`), `${code} level ${n}`).toEqual({ w: 460, h: 113 * LANG_CARDS });
  });

  it("uses themes that exist for its levels", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(LANG_LEVELS);
  });
});

describe("shared images and sounds", () => {
  it.each([
    "carta_tapada.png", "cartel.png", "time.png", "star.png", "incorrecto.png", "corazon.png",
    "gato_equals.png", "gato_idioma.png", "mapa_gato.png", "barraexp.png", "btnsonidoon.png", "btnsonidooff.png",
  ])("%s exists", (name) => expect(fs.existsSync(imageFile(name))).toBe(true));

  it.each(["button", "completed", "endgame", "match", "select", "startgame", "tapartodos"])(
    "sound %s exists",
    (name) => expect(fs.existsSync(new URL(`${name}.mp3`, sounds))).toBe(true),
  );
});
