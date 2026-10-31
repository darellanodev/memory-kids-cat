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

// Particles (stars that fly out of the cards when a pair is found).
export const PARTICLES_PER_CARD = 5;
export const PARTICLE_OFFSET = 39; // from the top left corner of the card (as in the old game)
export const PARTICLE_STEP = 1000 / 60; // ms: the old game moved particles once per frame at 60 fps
export const PARTICLE_LIFE = 100; // starts at this value and loses PARTICLE_FADE every step
export const PARTICLE_FADE = 0.5;
export const PARTICLE_SPEED = 2; // each speed starts between -2 and 2 px per step
export const PARTICLE_SIZE = { w: 48, h: 45 }; // size of the star at the start

// Banner (the old "cartel"): it comes up, stays, and goes away.
export const BANNER_START_Y = 1000;
export const BANNER_SHOW_Y = 200;
export const BANNER_END_Y = -600;
export const BANNER_IN = 2000;
export const BANNER_HOLD = 1500;
export const BANNER_OUT = 2000;

// Fix for the height of the texts: the old game moved all texts down 13 px on Android.
export const TEXT_DY = 13;

// --- Sequence game ---
// The 6 animals use the theme "animales" (background and sprite sheet). The ids are the
// pictures of the sprite sheet of that theme, and the sound of each animal is in src/assets/sounds.
export const SEQ_THEME = "animales";
export const SEQ_CARD_IDS = [1, 2, 3, 5, 6, 7]; // pig, elephant, cat, sheep, dog, cow
export const SEQ_SOUNDS = ["cerdo", "elefante", "gato", "oveja", "perro", "vaca"];
// Final place of the 6 cards (top left corner), as in the old game.
export const SEQ_CARD_POS = [
  { x: BOARD_X + 1 * CARD_SIZE - 30, y: 110 },
  { x: BOARD_X + 2 * CARD_SIZE + 30, y: 110 },
  { x: BOARD_X + 0 * CARD_SIZE, y: 150 + CARD_SIZE },
  { x: BOARD_X + 3 * CARD_SIZE, y: 150 + CARD_SIZE },
  { x: BOARD_X + 1 * CARD_SIZE - 30, y: 190 + 2 * CARD_SIZE },
  { x: BOARD_X + 2 * CARD_SIZE + 30, y: 190 + 2 * CARD_SIZE },
];
export const SEQ_TOTAL = 12; // the game is won when a sequence of 11 is repeated: lengths 3 to 11
export const SEQ_START_LENGTH = 3;
// A new stage starts when the sequence reaches this length. The title is shown in the banner.
export const SEQ_STAGES = [
  { title: "EASY", from: 3 },
  { title: "HARD", from: 6 },
  { title: "EXPERT", from: 9 },
];
export const SEQ_DEAL_TICKS = 7; // the old game waited one more step after the 6 cards
export const SEQ_ZOOM_STEP = 1066.7; // ms between the animals of the sequence (64 frames)
export const SEQ_FIRST_WAIT = 5000; // ms before the first animal, at the start of a stage
export const SEQ_NEXT_WAIT = 3333; // ms before the first animal, after a repeated sequence
export const SEQ_TEXT_LEAD = 1667; // "WATCH THE SEQUENCE" appears this time before the first animal
export const SEQ_ZOOM_SIZE = 180; // size of a card that was just played, it shrinks to CARD_SIZE
export const SEQ_ZOOM_SPEED = 0.18; // px per ms (3 px per frame in the old game)
export const SEQ_FAIL_ICON_TIME = 1667; // ms that the red cross stays on the wrong card
export const SEQ_WIN_XP = 1000; // experience points for winning

// --- Equals game ---
// Find all the cards that are like the model card (the cat shows it in his speech bubble).
export const EQ_COLS = 4;
export const EQ_ROWS = 3;
export const EQ_Y = 300; // top of the first row of cards
export const EQ_TARGETS = 6; // cards like the model to find (the other 6 are the other picture)
export const EQ_LIVES = 3; // the game is lost with one more mistake after the last life
export const EQ_MODEL_POS = { x: 215, y: 117 }; // the model card, inside the speech bubble
export const EQ_CAT = { x: 100, y: 110, w: 250, h: 133 };
export const EQ_FAIL_ICON_TIME = 1667; // ms that the red cross stays on a wrong card
export const EQ_HEART = { x: 250, y: 25, w: 35, h: 33 }; // lives: the number is at the left of it
export const EQ_LIVES_TEXT = { x: 245, y: 10 };
export const PARTICLES_EQUALS = 3; // stars when the player finds a card

// --- Map between levels ---
// Place of the cat on the map before each level (index 0) and after the last one (index 10).
export const MAP_POS = [
  { x: 61, y: 101 },
  { x: 208, y: 85 },
  { x: 342, y: 140 },
  { x: 435, y: 251 },
  { x: 459, y: 404 },
  { x: 435, y: 565 },
  { x: 315, y: 674 },
  { x: 153, y: 661 },
  { x: 52, y: 539 },
  { x: 77, y: 394 },
  { x: 257, y: 315 },
];
export const MAP_WALK_TIME = 3000; // ms that the cat needs to go to the next place
export const MAP_END_WAIT = 400; // ms to wait when the cat arrives

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
