import { defineConfig } from "@playwright/test";

const includeIncompleteCompatibility =
  process.env.XMLUI_INCLUDE_INCOMPLETE_COMPAT === "1";
const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";
const reuseDevServer =
  reuseExistingServer && process.env.XMLUI_REUSE_DEV_SERVER !== "0";
const devServerPort = process.env.XMLUI_E2E_DEV_PORT ?? "5173";
const isComponentSpecRun = process.argv.some((arg) =>
  arg.includes("src/components/") || arg.includes("src/components\\")
);

const devWebServer = {
  command: `npm run dev -- --host 127.0.0.1 --port ${devServerPort}`,
  url: `http://127.0.0.1:${devServerPort}/`,
  reuseExistingServer: reuseDevServer,
};

const fullWebServers = [
  devWebServer,
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
];

export default defineConfig({
  fullyParallel: true,
  testDir: ".",
  testMatch: [
    "tests/e2e/**/*.spec.ts",
    "src/components/**/*.spec.ts",
  ],
  workers: process.env.CI ? "80%" : "75%",
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["html"]] : [["html", { open: "never" }]],
  expect: { timeout: 10_000 },
  testIgnore: includeIncompleteCompatibility
    ? []
    : [
        "src/components/App/App.spec.ts",
        "src/components/App/App-layout.spec.ts",
        "src/components/App/App-layout-mobile.spec.ts",
        "src/components/App/App-navigation-events.spec.ts",
        "src/components/App/App-script-imports.spec.ts",
      ],
  webServer: isComponentSpecRun ? [devWebServer] : fullWebServers,
  use: {
    baseURL: `http://127.0.0.1:${devServerPort}/`,
  },
});
