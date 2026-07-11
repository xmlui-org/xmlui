import { defineConfig } from "@playwright/test";

const includeIncompleteCompatibility =
  process.env.XMLUI_INCLUDE_INCOMPLETE_COMPAT === "1";
const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";
const reuseDevServer =
  reuseExistingServer && process.env.XMLUI_REUSE_DEV_SERVER !== "0";
const devServerPort = process.env.XMLUI_E2E_DEV_PORT ?? "5173";
const specArgs = process.argv.slice(2).filter((arg) =>
  !arg.startsWith("-") &&
  (
    arg.includes("tests/e2e/") ||
    arg.includes("tests/e2e\\") ||
    arg.includes("src/components/") ||
    arg.includes("src/components\\")
  )
);
const hasExplicitSpecArgs = specArgs.length > 0;
const requestsProductionBuild =
  includeIncompleteCompatibility || specArgs.some((arg) => arg.includes("production-build.spec.ts"));
const requestsSsg =
  includeIncompleteCompatibility || specArgs.some((arg) => arg.includes("ssg-hydration.spec.ts"));
const requestsStandalone =
  includeIncompleteCompatibility ||
  !hasExplicitSpecArgs ||
  specArgs.some((arg) => arg.includes("standalone-runtime.spec.ts"));
const requestsDevServer =
  includeIncompleteCompatibility ||
  !hasExplicitSpecArgs ||
  specArgs.some((arg) =>
    arg.includes("src/components/") ||
    arg.includes("src/components\\") ||
    (
      (arg.includes("tests/e2e/") || arg.includes("tests/e2e\\")) &&
      !arg.includes("production-build.spec.ts") &&
      !arg.includes("ssg-hydration.spec.ts") &&
      !arg.includes("standalone-runtime.spec.ts")
    )
  );

const devWebServer = {
  command: `npm run dev -- --host 127.0.0.1 --port ${devServerPort}`,
  url: `http://127.0.0.1:${devServerPort}/`,
  reuseExistingServer: reuseDevServer,
};

const webServers = [
  requestsDevServer ? devWebServer : undefined,
  requestsStandalone
    ? {
        command: "npm run serve:standalone-samples",
        url: "http://127.0.0.1:5174/counter-components/",
        reuseExistingServer,
      }
    : undefined,
  requestsProductionBuild
    ? {
        command: "npm run build:production && XMLUI_STATIC_ROOT=dist-production XMLUI_STANDALONE_PORT=5175 node scripts/standalone-static-server.mjs",
        url: "http://127.0.0.1:5175/index.html",
        reuseExistingServer,
      }
    : undefined,
  requestsSsg
    ? {
        command: "npm run build:ssg && XMLUI_SSG_PORT=5176 node scripts/preview-ssg.mjs",
        url: "http://127.0.0.1:5176/xmlui-ssg-manifest.json",
        reuseExistingServer,
      }
    : undefined,
].filter((server): server is typeof devWebServer => Boolean(server));

const defaultIgnoredSpecs = hasExplicitSpecArgs
  ? []
  : [
      "tests/e2e/production-build.spec.ts",
      "tests/e2e/ssg-hydration.spec.ts",
    ];

export default defineConfig({
  fullyParallel: true,
  testDir: ".",
  timeout: 10_000,
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
        ...defaultIgnoredSpecs,
      ],
  webServer: webServers,
  use: {
    baseURL: `http://127.0.0.1:${devServerPort}/`,
  },
});
