import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Relative paths, so the build works in any folder
  // (for example GitHub Pages at https://user.github.io/memorykidscat/).
  base: "./",
  plugins: [
    // Makes the game installable (PWA) and able to work without internet.
    VitePWA({
      registerType: "autoUpdate", // a new version is used after the next reload
      manifest: {
        name: "Memory Kids Cat",
        short_name: "MemoryKidsCat",
        description: "Memory games for kids. Train your memory with the cat!",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#000000",
        theme_color: "#000000", // color of the status bar and the navigation bar of Android
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Files saved in the phone to work without internet.
        // Images, sounds and the font are part of the game, so they are listed here.
        globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,webmanifest,mp3,ttf}"],
      },
    }),
  ],
});
