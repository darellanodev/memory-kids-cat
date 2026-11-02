import { defineConfig } from "vitest/config";

// Settings for `pnpm test`. This file is separate from vite.config.js on purpose:
// the tests do not need the PWA plugin. They run in Node, without a browser.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
  },
});
