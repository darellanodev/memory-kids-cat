// Sound effects. Respects the sound option (saved in progress.js).
import { isSoundOn } from "./progress.js";

const sounds = {};

// Called by assets.js with { name: url }.
export function loadSounds(urls) {
  for (const [name, url] of Object.entries(urls)) {
    const audio = new Audio(url);
    audio.preload = "auto";
    sounds[name] = audio;
  }
}

// Play a sound from the start. Does nothing if the sound is off.
export function play(name) {
  if (!isSoundOn()) return;
  const audio = sounds[name];
  if (!audio) return;
  try {
    audio.currentTime = 0;
  } catch (err) {
    // The sound was not ready yet.
  }
  // The browser can refuse to play before the first tap: that is not an error.
  audio.play().catch(() => {});
}

// Stop all the sounds that are playing (when the game is paused).
export function stopAll() {
  for (const audio of Object.values(sounds)) {
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch (err) {
      // The sound was not ready yet.
    }
  }
}

// Phones only allow sounds that start after a tap. Playing every sound once, muted,
// in the first tap makes them available for the rest of the session.
let unlocked = false;
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  for (const audio of Object.values(sounds)) {
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  }
}
