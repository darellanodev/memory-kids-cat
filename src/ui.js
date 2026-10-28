// Small helpers shared by the screens: pointer position, hit test, text and sprites.
import { W, H, TEXT_DY } from "./config.js";

const FONT = "Helsinki, system-ui, sans-serif";

// Convert a pointer event to game coordinates.
export function toGame(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) * W) / r.width,
    y: ((e.clientY - r.top) * H) / r.height,
  };
}

// Is the point p inside the rectangle rect = { x, y, w, h }?
export function inside(p, rect) {
  return (
    p.x >= rect.x &&
    p.x < rect.x + rect.w &&
    p.y >= rect.y &&
    p.y < rect.y + rect.h
  );
}

// Text with the effects of the old game.
//   effect: "shadow" (black shadow), "glow" (white shadow) or "none".
//   gray: 0 to 255, color of the text (the old game used grays only).
//   align: "left", "center" or "right". baseline: "top" or "alphabetic".
// The old game moved every text down TEXT_DY px, so it is done here too.
export function drawText(
  ctx,
  text,
  x,
  y,
  { size = 40, gray = 255, effect = "shadow", align = "left", baseline = "top" } = {},
) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  const yy = y + TEXT_DY;
  if (effect !== "none") {
    ctx.fillStyle = effect === "glow" ? "#fff" : "#000";
    ctx.fillText(text, x + 2, yy + 2);
  }
  ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
  ctx.fillText(text, x, yy);
}

// Score with 5 digits: 00025.
export function formatScore(score) {
  return String(score).padStart(5, "0");
}
