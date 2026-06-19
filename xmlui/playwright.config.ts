import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173/",
      reuseExistingServer: true,
    },
    {
      command: "npm run serve:standalone-samples",
      url: "http://127.0.0.1:5174/counter-components/",
      reuseExistingServer: true,
    },
    {
      command: "npm run build:production && XMLUI_STATIC_ROOT=dist-production XMLUI_STANDALONE_PORT=5175 node scripts/standalone-static-server.mjs",
      url: "http://127.0.0.1:5175/index.html",
      reuseExistingServer: true,
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173/",
  },
});
