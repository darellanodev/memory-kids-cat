// Random helpers shared by the games.

// Shuffle a copy of the list (Fisher-Yates). random: function from 0 to 1 (can be changed in tests).
export function shuffle(list, random = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
