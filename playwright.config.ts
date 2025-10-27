import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const port = 3211;

// Default to using dev server unless explicitly set to false
const useDevServer = process.env.PLAYWRIGHT_USE_DEV_SERVER !== "false";
const CI = process.env.CI;

export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  testMatch: "*.spec.ts",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!CI,

  workers: CI ? "100%" : "75%",
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: CI ? [["github"], ["html"]] : [["html", { open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ...devices["Desktop Chrome"],
    channel: "chromium",
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    serviceWorkers: "allow",
    /* Grants specified permissions to the browser context. */
    permissions: ["clipboard-read", "clipboard-write"],
  },

  retries: CI ? 2 : 1,
  /* Configure projects for major browsers */
  projects: [
    {
      name: "xmlui-nonsmoke",
      testDir: "./xmlui",
      grepInvert: /@smoke/,
    },
    {
      name: "xmlui-smoke",
      testDir: "./xmlui",
      grep: /@smoke/,
    },
    {
      name: "extensions-nonsmoke",
      testDir: "./packages",
      grepInvert: /@smoke/,
    },
    {
      name: "extensions-smoke",
      testDir: "./packages",
      grep: /@smoke/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      useDevServer && !CI
        ? `cd xmlui && npm run start-test-bed -- --port ${port}`
        : `npx serve xmlui/src/testing/infrastructure/dist -p ${port}`,
    timeout: 50 * 1000,
    port,
    reuseExistingServer: !CI,
    cwd: path.resolve(__dirname),
  },
});
