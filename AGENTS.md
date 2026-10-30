# AGENTS.md

Guide for coding agents and contributors working on Memory Kids Cat.

## Project description

Memory Kids Cat is a set of memory games for kids, for the web. It is a port of my old Processing (Android) game from 2014. The old game had a title screen, a games menu and four games:

1. **Make pairs** (ported): 20 cards come in face up, the player looks at them, they are turned face down, and the player finds the 10 pairs before the time bar is empty. 10 themes (levels) in random order.
2. **Sequence**: not ported.
3. **Languages**: not ported.
4. **Equals**: not ported.

The goal is to port the whole game step by step, one feature per session.

## Stack

- **Language:** plain JavaScript with ES modules. Moving to TypeScript is a future option.
- **Rendering:** native 2D `<canvas>`, drawn by hand on every frame. There are no runtime dependencies (the old game had no physics, so Matter.js is not used).
- **Assets:** images and sounds in `src/assets/`. They are found with `import.meta.glob` in `src/assets.js` and loaded before the game starts.
- **Tooling:** [Vite](https://vite.dev/) for the dev server and the production build. Package manager: **pnpm**.
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) makes the web manifest and the service worker in the build. The game can be installed and works offline.
- **CI/CD:** GitHub Actions builds the project on every push to `main` and on pull requests. Pushes to `main` are also deployed to GitHub Pages (repository setting: Pages source = GitHub Actions).

## Project structure

```
index.html        page and canvas
styles.css        page styles and @font-face of the font "Helsinki"
vite.config.js    Vite settings and PWA settings (manifest, offline files)
public/icons/     app icons (placeholder, to be replaced)
.github/workflows/build.yml   build, and deploy to GitHub Pages
src/main.js       startup, scene switching, main loop, pointer and key events
src/config.js     game settings, THEMES, and the button areas of the old images
src/pairs.js      rules of one "make pairs" level (no drawing)
src/render.js     draws the "make pairs" level (does not change the state)
src/tween.js      easing functions and tween() (replaces Ani)
src/ui.js         toGame(), inside(), drawText(), formatScore()
src/assets.js     loads images, sounds and the font; img(name)
src/audio.js      play(name), unlockAudio()
src/progress.js   saved data: sound and best score
src/scenes/       one file per screen: title, games, credits, congrats, pairs, map
src/assets/       images/, sounds/, fonts/ (from the old game)
```

## Screens (scenes)

`main.js` shows one scene at a time and sends the events to it.

```
title -> games -> pairs -> map -> pairs -> map -> ... -> map -> congrats -> title
  |        |        |
  v        v        v (MENU button, Escape key, or "time is up")
credits   title    title

(The map shows after every completed level. It calls params.done() when the cat arrives
 or the player taps; pairs.js gives it the function that starts the next level.)
```

Every scene is an object with: `update(now)`, `draw()`, `pointerDown(p)`, and optionally `enter(params)`, `exit()`, `pointerMove(p)`, `pointerUp(p)`, `pointerCancel()`, `keyDown(e)`. It can also have a `hint` text for the line under the canvas. A scene changes screen with `goTo(name, params)`. To add a screen, create a file in `src/scenes/` and register it in `main.js`.

Keep each file focused on one job:

- `pairs.js` (and the files of the next games) know the rules. They must not draw, play sounds directly, or read the pointer. Sounds are requested with the `sfx(name)` function that the scene gives to the game.
- `render.js` only draws. It must not change the game state.
- `scenes/*.js` connect everything: they read the pointer, call the game, and call the renderer.

## How to run

Needs Node.js 20.19 or newer.

```
pnpm install
pnpm dev        # dev server
pnpm build      # production build in dist/
pnpm preview    # serve the production build
```

Run `pnpm build` before you finish a task. The CI runs the same command.

## Working with the old game

The old source (`memorykidscat.pde`, about 2800 lines) is not part of this repository. When porting a feature, ask for the old zip again and read the class that you need. Useful facts:

- **Same coordinates.** The old game used a logical size of 500 × 800, and the images are 500 × 800. The new game uses the same size (`W` × `H` in `src/config.js`), so the rectangles of the old `mousedentro(x, y, w, h)` calls are used as they are (`BTN_*` and `GAME_*` in `config.js`). The canvas is scaled with CSS and keeps its proportions.
- **Time in ms, not frames.** The old game counted frames at 60 fps. Convert them: 6 frames = 100 ms, 60 frames = 1000 ms. The values already converted are in `config.js`.
- **Animations.** The old game used the Ani library (`Ani.to(...)`). Use `tween()` and the easing functions of `src/tween.js`. The default easing of Ani is linear.
- **Texts.** The old `texto()` function drew a shadow (black or white, 2 px down and right) and moved the text 13 px down (an Android fix). `drawText()` does the same. The font is `helsinki.ttf` (family `Helsinki`).
- **Cards.** Each theme has a sprite sheet `cartas_<key>.png` (119 × 1190: ten 119 × 119 pictures one under another), a background `fondo_<key>.jpg`, and all share `carta_tapada.png` (the back of the cards).
- **Sounds.** The old index of each sound: 0 button, 1 completed (played when a level starts), 2 endgame (time is up), 3 match, 4 select (tap on a card), 5 startgame (back to the title), 6 tapartodos (all cards turn face down). The animal sounds of the Sequence game are in the old `sonidos/game2/`.
- **Back key.** The old game used the back key of Android to open the "do you really want to exit?" screen. Here, the Escape key and the MENU button of the play screen do it.

## Phones and PWA

- The game works in the browser and also as an installed app. Do not break the normal browser view.
- The size on screen comes from the CSS in `styles.css`. On phones, tablets and installed apps (`pointer: coarse` or `display-mode: standalone/fullscreen`) the canvas fills the screen height and keeps the proportion 500 × 800. On desktop it is 400 px wide at most.
- The pixels of the canvas are set in `src/main.js` (`resizeCanvas`) to match the screen, so it is sharp on phones. The game code does not change: always use the logical size `W` × `H`. Do not set a CSS size that depends on `canvas.width`.
- The service worker saves the built files in the phone. Files are listed by type in `workbox.globPatterns` in `vite.config.js` (now: js, css, html, png, jpg, svg, ico, webmanifest, mp3, ttf). If you add a new file type (for example `.ogg` or `.woff2`), add it to that list.
- Sounds smaller than 4 KB are inlined by Vite into the JavaScript. This is normal.
- Phones only allow sounds after a tap. `unlockAudio()` (in `audio.js`) is called in the first tap on the title screen. Do not play sounds before that and expect them to be heard.
- The PWA is only active in the build. Test it with `pnpm build` and `pnpm preview`.
- The status bar and the navigation bar of Android are black: `theme_color` and `background_color` in `vite.config.js`, `theme-color` in `index.html`, and the background of `html, body` in the standalone block of `styles.css`. Keep these four in sync. An already installed app may need to be uninstalled and installed again to show a new color.
- Icons: `public/icons/`. They are placeholders. Keep the 4 files and their names, or change them in `vite.config.js` and `index.html`.

## Saved data

`src/progress.js` keeps `{ sound, bestScore }` in `localStorage` (key `memorykidscat-progress`). If the storage fails, the data is kept only until the page is closed. To start again, run `localStorage.removeItem("memorykidscat-progress")` in the browser console and reload.

## Gameplay settings (make pairs)

All in `src/config.js`. Change them there before changing the logic:

- `POINTS_MATCH` (25) and `POINTS_MISS` (5, the score never goes below 0).
- `DEAL_DELAY`, `DEAL_DURATION`, `OBSERVE_TIME`, `COVER_DELAY`: timing of the start of a level.
- `MISS_COVER_DELAY`: time before two cards that are not a pair are covered (tapping another card covers them at once).
- `TIME_BAR_MAX` (148 px) and `TIME_BAR_STEP` (1 px every 133 ms, about 19.7 s). Every pair found gives the full time again.
- `BANNER_*`: movement of the banner ("LEVEL 1 / THE FOREST", "TIME IS UP").

## Conventions

- Code, comments and docs are in simple English.
- Names in English (`cards`, `banner`, `selected`). The old Spanish names are not used.
- Always use the logical space 500 × 800. Convert pointer coordinates with `toGame()` in `src/ui.js`.
- Install libraries with pnpm and import them. Do not load libraries from a CDN.
- Use **pnpm** only. Do not use `npm` or `yarn`, and do not create `package-lock.json` or `yarn.lock`. Commit `pnpm-lock.yaml`, because the CI uses `--frozen-lockfile`.
- Do not use `localStorage` without a `try/catch`.
- To add an image or a sound, put the file in `src/assets/images` (png or jpg) or `src/assets/sounds` (mp3). The file name without the extension is its name in the code. Do not use plain paths like `"images/a.png"`, because they break in the build.
- One export per clear purpose. Avoid circular imports.
- The site is served from a sub-path (`/memorykidscat/`). Keep `base: "./"` in `vite.config.js` and do not use absolute paths like `/img/a.png`.

## Roadmap

Each step is meant to be one work session. Order can change.

**Step 0 (done): base**
- [x] Vite + PWA + GitHub Actions (same as Cave Drop), pnpm, no runtime dependencies.
- [x] Title screen, games menu, credits and "congratulations" screen.
- [x] Sound effects and the sound ON/OFF button (saved).
- [x] Best score (saved) shown on the title screen.
- [x] Game 1 *Make pairs*: the 10 themes in random order, banner, time bar, score, exit dialog.

**Step 1: finish game 1 (make pairs)**
- [x] Map between levels (`scenes/map.js`): the cat walks from one level to the next (3 s, `quadInOut`). Positions: `MAP_POS` in `config.js`. Tap to skip.
- [ ] Particle explosions when a pair is found (`C_ParticleSystem` and `C_Particle`).
- [ ] Experience bar of the title screen (`barraexp.png`): experience points = sum of the scores; level = `0.04 * sqrt(points)`; next level at `(ceil(level) / 0.04)^2` points. Save the points in `progress.js`.
- [ ] Optional: the "zoom" effect of a card when it is turned.

**Step 2: game 2, Sequence** (`C_NivelSecuencia`)
- [ ] Port the rules and the screen. Uses the animal sounds (`sonidos/game2/`) and `star.png`, `incorrecto.png`, `corazon.png`.

**Step 3: game 4, Equals** (`C_NivelEquals`)
- [ ] Port the rules and the screen (`gato_equals.png`).

**Step 4: game 3, Languages** (`C_NivelIdiomas`)
- [ ] Language menu (`menuidiomas.jpg`, `mapa_idiomas.jpg`) and the game with the word cards (`cartaslang/`, `cartas_language*.png`, `gato_idioma.png`).

**Step 5: quality**
- [ ] Remove the "SOON" cover of the games menu when all the games exist.
- [ ] Pause the game when the tab or the app is hidden.
- [ ] Real app icon, and the old `cartel` and button art checked on small phones.
- [ ] Basic tests for the rules (`pairs.js` is already pure logic and easy to test).
- [ ] Move to TypeScript if the project grows.

## Instructions for agents

- Respect the split between rules (`pairs.js`...), drawing (`render.js`...) and scenes.
- Always test with mouse and touch (the events are `pointer*`).
- Do not break the CI: `pnpm install --frozen-lockfile` and `pnpm build` must pass.
- Do not add new dependencies without a good reason. Add them with `pnpm add` (or `pnpm add -D` for dev tools).
- When a roadmap item is finished, mark it here and update `README.md` if it changes what the game has.
