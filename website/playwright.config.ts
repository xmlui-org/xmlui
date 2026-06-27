import { defineConfig } from "@playwright/test";

const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? [["github"], ["html"]] : [["html", { open: "never" }]],
  expect: { timeout: 10_000 },
  webServer: {
    command: "npm run start -- --port 5173",
    url: "http://localhost:5173/",
    reuseExistingServer,
  },
  use: {
    baseURL: "http://localhost:5173/",
  },
});
