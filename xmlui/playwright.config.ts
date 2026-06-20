import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "tests/e2e/**/*.spec.ts",
    "src/components/**/*.spec.ts",
  ],
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
    {
      command: "npm run build:ssg && XMLUI_SSG_PORT=5176 node scripts/preview-ssg.mjs",
      url: "http://127.0.0.1:5176/xmlui-ssg-manifest.json",
      reuseExistingServer: true,
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173/",
  },
});
