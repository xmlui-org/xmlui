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
export default defineConfig({
  /* Run tests in files in parallel */
  fullyParallel: true,
  testMatch: "*.spec.ts",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /*
  Default Github job runners have 4 cores (on public repos, 2 on privates)
  https://docs.github.com/en/actions/using-github-hosted-runners/using-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories */
  workers: undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["github"], ["html"]] : [["html"]],
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

  /* Global timeout settings */
  timeout: 20000, // 20 seconds for entire test
  expect: {
    timeout: 5000, // 5 seconds for expect assertions
  },

  retries: process.env.CI ? 2 : 1,
  /* Configure projects for major browsers */
  projects: [
    {
      name: "xmlui",
      testDir: "./xmlui",
      grepInvert: /@smoke/,
    },
    {
      name: "xmlui-smoke",
      testDir: "./xmlui",
      grep: /@smoke/,
    },
    {
      name: "extensions",
      testDir: "./packages",
      grepInvert: /@smoke/,
    },
    {
      name: "extensions-smoke",
      testDir: "./packages",
      grep: /@smoke/,
    },
    {
      name: "all",
      testDir: ".",
      testIgnore: ["**/node_modules/**"],
      grepInvert: /@smoke/,
    },
    {
      name: "all-smoke",
      testDir: ".",
      testIgnore: ["**/node_modules/**"],
      grep: /@smoke/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? `npx serve xmlui/src/testing/infrastructure/dist -p ${port}`
      : `cd xmlui && npm run start-test-bed -- --port ${port}`,
    timeout: 50 * 1000,
    port,
    reuseExistingServer: !process.env.CI,
    cwd: path.resolve(__dirname),
  },
});
