// Saved data: the sound option and the best score.
// It is kept in the browser (localStorage), so it is still there when the game is opened again.
const KEY = "memorykidscat-progress";

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return {
      sound: !(data && data.sound === false),
      bestScore: Math.max(0, Math.floor(Number(data && data.bestScore) || 0)),
    };
  } catch (err) {
    // No storage, or the saved data is not valid: use the default values.
    return { sound: true, bestScore: 0 };
  }
}

// Kept in memory, so it is not read from the storage on every frame.
const data = read();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    // The data is only kept until the page is closed.
  }
}

export function isSoundOn() {
  return data.sound;
}

export function setSound(on) {
  data.sound = Boolean(on);
  save();
}

export function getBestScore() {
  return data.bestScore;
}

// Save the score of a finished game if it is the best one.
export function saveScore(score) {
  if (score <= data.bestScore) return;
  data.bestScore = score;
  save();
}
