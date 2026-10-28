// Game settings. Change gameplay values here.
// Times are in milliseconds. The old game counted frames at 60 fps.

// Logical size of the game. All coordinates use this space (the same as the old game).
export const W = 500;
export const H = 800;

// Themes of the "make pairs" game: title shown in the banner and name of the images.
// The images are in src/assets/images: cartas_<key>.png (cards) and fondo_<key>.jpg (background).
export const THEMES = [
  { title: "THE FOREST", key: "animales" },
  { title: "SWEET HOME", key: "cocina" },
  { title: "SPORTS", key: "deportes" },
  { title: "THE BEACH", key: "playa" },
  { title: "SCARY", key: "miedo" },
  { title: "TRANSPORT", key: "transporte" },
  { title: "THE SPACE", key: "espacio" },
  { title: "NATURE", key: "naturaleza" },
  { title: "MUSIC", key: "musica" },
  { title: "SCIENCE", key: "ciencia" },
];

// --- Make pairs ---
export const CARD_SIZE = 119;
export const COLS = 4;
export const ROWS = 5;
export const BOARD_X = 12; // top left corner of the first card
export const BOARD_Y = 80;
export const PAIRS = (COLS * ROWS) / 2;

export const POINTS_MATCH = 25;
export const POINTS_MISS = 5;

export const DEAL_START = { x: 250, y: -200 }; // cards come from outside the screen
export const DEAL_DELAY = 100; // ms between cards that come in
export const DEAL_DURATION = 2000; // ms that a card needs to reach its place
export const OBSERVE_TIME = 5000; // ms to look at the pictures
export const LOOK_TEXT_DELAY = 1667; // "LOOK AT THE PICTURES" appears after this time
export const COVER_DELAY = 50; // ms between cards that are turned face down
export const MISS_COVER_DELAY = 1700; // ms before two cards that are not a pair are covered
export const TIME_BAR_MAX = 148; // width of the time bar (px)
export const TIME_BAR_STEP = 133; // ms for the bar to lose 1 px (about 19.7 s in total)
export const COMPLETE_DELAY = 800; // ms to wait after the last pair

// Banner (the old "cartel"): it comes up, stays, and goes away.
export const BANNER_START_Y = 1000;
export const BANNER_SHOW_Y = 200;
export const BANNER_END_Y = -600;
export const BANNER_IN = 2000;
export const BANNER_HOLD = 1500;
export const BANNER_OUT = 2000;

// Fix for the height of the texts: the old game moved all texts down 13 px on Android.
export const TEXT_DY = 13;

// --- Buttons (rectangles { x, y, w, h } on the images of the old game) ---
export const BTN_PLAY = { x: 93, y: 287, w: 323, h: 65 }; // "TRAIN ME NOW!" on the title
export const BTN_CREDITS = { x: 369, y: 690, w: 129, h: 107 }; // paw on the title
export const BTN_SOUND = { x: 0, y: 690, w: 131, h: 110 }; // sound on/off on the title
export const BTN_BACK = { x: 369, y: 690, w: 131, h: 110 }; // back arrow of the games menu
export const BTN_CREDITS_BACK = { x: 89, y: 501, w: 323, h: 65 };
export const BTN_CONGRATS_BACK = { x: 90, y: 534, w: 323, h: 65 };
export const BTN_EXIT_YES = { x: 56, y: 449, w: 160, h: 65 };
export const BTN_EXIT_NO = { x: 284, y: 449, w: 160, h: 65 };
// Game buttons of the games menu.
export const GAME_PAIRS = { x: 26, y: 126, w: 209, h: 228 };
export const GAME_SEQUENCE = { x: 263, y: 126, w: 209, h: 228 };
export const GAME_LANGUAGES = { x: 26, y: 380, w: 209, h: 228 };
export const GAME_EQUALS = { x: 263, y: 380, w: 209, h: 228 };
// Small "MENU" button under the cards (new: the old game used the back key of Android).
export const BTN_PLAY_MENU = { x: 175, y: 705, w: 150, h: 56 };
