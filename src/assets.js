// Images, sounds and font. Vite finds the files in src/assets and gives their final URLs.
// To add a file, put it in src/assets/images or src/assets/sounds. The name (without
// the extension) is the name used in the code, for example img("menu") or play("match").
import { loadSounds } from "./audio.js";

const imageUrls = import.meta.glob("./assets/images/*.{png,jpg}", {
  query: "?url",
  import: "default",
  eager: true,
});
const soundUrls = import.meta.glob("./assets/sounds/*.mp3", {
  query: "?url",
  import: "default",
  eager: true,
});

const images = {};

// "./assets/images/menu.jpg" -> "menu"
const nameOf = (path) => path.split("/").pop().replace(/\.[^.]+$/, "");

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Cannot load ${url}`));
    image.src = url;
  });
}

// Load everything before the game starts. Call it once.
export async function loadAssets() {
  const entries = Object.entries(imageUrls);
  const loaded = await Promise.all(entries.map(([, url]) => loadImage(url)));
  entries.forEach(([path], i) => (images[nameOf(path)] = loaded[i]));

  const sounds = {};
  for (const [path, url] of Object.entries(soundUrls)) sounds[nameOf(path)] = url;
  loadSounds(sounds);

  // Texts in the canvas use this font: wait for it, or they would be drawn with another one.
  try {
    await document.fonts.load("40px Helsinki");
  } catch (err) {
    // The game still works with the default font.
  }
}

// Get a loaded image by name.
export function img(name) {
  const image = images[name];
  if (!image) throw new Error(`Image not found: ${name}`);
  return image;
}
