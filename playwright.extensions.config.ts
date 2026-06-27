import { defineConfig } from "@playwright/test";

const reuseExistingServer = process.env.XMLUI_REUSE_EXISTING_SERVER !== "0";

export default defineConfig({
  testDir: ".",
  testMatch: "packages/**/*.e2e.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html"]] : [["html", { open: "never" }]],
  expect: { timeout: 10_000 },
  webServer: {
    command: "npm --workspace xmlui run dev -- --host 127.0.0.1 --port 5173",
    url: "http://127.0.0.1:5173/",
    reuseExistingServer,
  },
  use: {
    baseURL: "http://127.0.0.1:5173/",
  },
});
