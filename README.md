# Memory Kids Cat

Memory games for kids, for the web. It is a port of my old Processing game for Android (2014). Train your memory with the cat!

Right now the game has the title screen, the games menu, the credits, the sound option, the best score and the experience (saved in the browser) and the first game, **Make pairs**: look at the pictures, remember where they are, and find all the pairs before the time bar is empty. After each level, the cat walks to the next place on the map, and stars fly out of the cards when you find a pair. Completing a game gives experience points, shown with your level in a bar on the title screen. It also has the second game, **Sequence**: watch the animals and repeat the sequence, in 3 stages. It also has **Equals**: the cat shows a card and you find all the cards that are like it, with 3 lives. And the last game of the old version, **Languages**: find the picture of a word in English, Spanish, French or German. All the games of the old version are ported now. The game pauses when you change app or lock the phone, and waits for a tap to continue. See the roadmap in `AGENTS.md`.

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

The icons are in `public/icons/`, made from the 512 x 512 art of the game (`icon-512.png` is the art as it is):

- `icon-512.png` and `icon-192.png`: the normal icon of the app.
- `icon-maskable-512.png`: the same art, smaller (78 %) and with the gradient of the background extended. Android crops this icon with a shape (circle, rounded square...), so everything important must be inside the central circle of 80 % of its size.
- `apple-touch-icon.png` (180 x 180, without transparency): the icon of iPhone and iPad. iOS makes the rounded corners.

To change the icon, make these 4 files again from the new art (keep the names). The cat and the stars of the maskable one must stay inside the central circle. After installing a new version, the icon of an app that is already installed may not change until it is installed again.

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
src/sequence.js   rules of the "Sequence" game (no drawing)
src/render-sequence.js  draws the "Sequence" game
src/equals.js     rules of one "Equals" level (no drawing)
src/render-equals.js    draws the "Equals" level
src/languages.js  rules of one "Languages" level (no drawing)
src/render-languages.js draws the "Languages" level
src/random.js     shuffle()
src/banner.js     movement of the banner (shared)
src/render-common.js    drawing pieces shared by the games
src/particles.js  stars that fly out when a pair is found
src/tween.js      easing functions (replaces the Ani library of the old game)
src/ui.js         pointer, hit test and text helpers
src/assets.js     loads images, sounds and the font
src/audio.js      sound effects
src/pause.js      pause when the page is hidden
src/experience.js level and bar of the experience points
src/progress.js   saved data (sound, best score and experience)
src/scenes/       screens: title, games, credits, congrats, pairs, equals, languageMenu, languages, map, sequence (levels.js is shared by pairs, equals and languages)
src/assets/       images, sounds and font taken from the old game
```

More details for contributors and coding agents are in `AGENTS.md`.
