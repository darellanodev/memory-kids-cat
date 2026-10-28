// Start the game, switch between screens (scenes) and run the main loop.
import { loadAssets } from "./assets.js";
import { createCreditsScene } from "./scenes/credits.js";
import { createCongratsScene } from "./scenes/congrats.js";
import { createGamesScene } from "./scenes/games.js";
import { createPairsScene } from "./scenes/pairs.js";
import { createTitleScene } from "./scenes/title.js";
import { W, H } from "./config.js";
import { toGame } from "./ui.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");

// Draw the canvas with the real pixels of the screen, so it is sharp on phones.
// The game does not notice it: everything still uses the logical size W x H.
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  const scale = (rect.width * (window.devicePixelRatio || 1)) / W;
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}
new ResizeObserver(resizeCanvas).observe(canvas);
resizeCanvas();

// Every scene has: update(now), draw(), pointerDown(p), and optionally
// enter(params), exit(), pointerMove(p), pointerUp(p), pointerCancel(), keyDown(e).
const scenes = {};
let current = null;

function goTo(name, params) {
  if (current && current.exit) current.exit();
  current = scenes[name];
  if (current.enter) current.enter(params);
  hint.textContent = current.hint;
}

// Simple screen while the images, sounds and font are loading.
function drawLoading() {
  ctx.fillStyle = "#e6e6e6";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#009be3";
  ctx.font = "40px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("LOADING...", W / 2, H / 2);
}

function frame(now) {
  current.update(now);
  current.draw();
  requestAnimationFrame(frame);
}

async function start() {
  drawLoading();
  await loadAssets();

  Object.assign(scenes, {
    title: createTitleScene({ ctx, goTo }),
    games: createGamesScene({ ctx, goTo }),
    credits: createCreditsScene({ ctx, goTo }),
    congrats: createCongratsScene({ ctx, goTo }),
    pairs: createPairsScene({ ctx, goTo }),
  });

  // Send the pointer events to the current scene.
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId);
    current.pointerDown(toGame(canvas, e));
  });
  canvas.addEventListener("pointermove", (e) => {
    if (current.pointerMove) current.pointerMove(toGame(canvas, e));
  });
  canvas.addEventListener("pointerup", (e) => {
    if (current.pointerUp) current.pointerUp(toGame(canvas, e));
  });
  canvas.addEventListener("pointercancel", () => {
    if (current.pointerCancel) current.pointerCancel();
  });
  window.addEventListener("keydown", (e) => {
    if (current.keyDown) current.keyDown(e);
  });

  goTo("title", { silent: true });
  requestAnimationFrame(frame);
}

start();
