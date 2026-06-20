import { defineConfig } from "@playwright/test";

const includeIncompleteCompatibility =
  process.env.XMLUI_INCLUDE_INCOMPLETE_COMPAT === "1";
const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";
const reuseDevServer =
  reuseExistingServer && process.env.XMLUI_REUSE_DEV_SERVER !== "0";

export default defineConfig({
  testDir: ".",
  testMatch: [
    "tests/e2e/**/*.spec.ts",
    "src/components/**/*.spec.ts",
  ],
  testIgnore: includeIncompleteCompatibility
    ? []
    : [
        "src/components/App/App.spec.ts",
        "src/components/App/App-layout.spec.ts",
        "src/components/App/App-layout-mobile.spec.ts",
        "src/components/App/App-navigation-events.spec.ts",
        "src/components/App/App-script-imports.spec.ts",
      ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 5173",
      url: "http://127.0.0.1:5173/",
      reuseExistingServer: reuseDevServer,
    },
    {
      command: "npm run serve:standalone-samples",
      url: "http://127.0.0.1:5174/counter-components/",
      reuseExistingServer,
    },
    {
      command: "npm run build:production && XMLUI_STATIC_ROOT=dist-production XMLUI_STANDALONE_PORT=5175 node scripts/standalone-static-server.mjs",
      url: "http://127.0.0.1:5175/index.html",
      reuseExistingServer,
    },
    {
      command: "npm run build:ssg && XMLUI_SSG_PORT=5176 node scripts/preview-ssg.mjs",
      url: "http://127.0.0.1:5176/xmlui-ssg-manifest.json",
      reuseExistingServer,
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:5173/",
  },
});
