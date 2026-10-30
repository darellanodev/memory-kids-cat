# Memory Kids Cat

Memory games for kids, for the web. It is a port of my old Processing game for Android (2014). Train your memory with the cat!

Right now the game has the title screen, the games menu, the credits, the sound option (saved in the browser) and the first game, **Make pairs**: look at the pictures, remember where they are, and find all the pairs before the time bar is empty. After each level, the cat walks to the next place on the map. The other three games of the old version (Sequence, Languages and Equals) are not ported yet. See the roadmap in `AGENTS.md`.

Built with plain JavaScript (ES modules) and HTML canvas. It uses [Vite](https://vite.dev/) for development and builds, and [pnpm](https://pnpm.io/) as package manager. There are no runtime dependencies.

## Run it

You need Node.js 20.19 or newer and pnpm.

```
pnpm install
pnpm dev
```

Then open the address shown in the terminal.

Other commands:

- `pnpm build`: create the production build in `dist/`.
- `pnpm preview`: serve the production build locally.

## Build and deploy on GitHub

The workflow `.github/workflows/build.yml` runs on every push to `main` and on every pull request. It installs the dependencies and runs `pnpm build`.

On pushes to `main` it also publishes the game to GitHub Pages: `https://<your-user>.github.io/memorykidscat/`.

One-time setup: in the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Play on a phone (PWA)

The game works in any browser, and it can also be installed on a phone like an app. Installed, it opens in full screen, in portrait mode, and works without internet.

- **Android (Chrome):** open the game, then menu `⋮` → **Install app** (or **Add to Home screen**).
- **iPhone (Safari):** open the game, then **Share** → **Add to Home Screen**.

To try the PWA on your computer, use `pnpm build` and then `pnpm preview` (the PWA is not active in `pnpm dev`).

After you publish a new version, the installed app updates itself the next time it is opened (you may need to open it twice).

The icons are in `public/icons/`. They are a **placeholder** drawn for this first version: replace the 4 files (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `apple-touch-icon.png`) with the real icon of the game.

## Project structure

```
index.html        page and canvas
styles.css        page styles and the font of the game
vite.config.js    Vite settings and PWA settings
public/icons/     app icons
.github/workflows/build.yml   automatic build on push
src/main.js       startup, screens and main loop
src/config.js     game settings, themes and button areas
src/pairs.js      rules of the "make pairs" game (no drawing)
src/render.js     draws the "make pairs" game
src/tween.js      easing functions (replaces the Ani library of the old game)
src/ui.js         pointer, hit test and text helpers
src/assets.js     loads images, sounds and the font
src/audio.js      sound effects
src/progress.js   saved data (sound and best score)
src/scenes/       screens: title, games, credits, congrats, pairs, map
src/assets/       images, sounds and font taken from the old game
```

More details for contributors and coding agents are in `AGENTS.md`.
