import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const port = 3210;
export default defineConfig({
  testDir: './src/components',
  /* Run tests in files in parallel */
  fullyParallel: true,
  testMatch: "*.spec.ts",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Opt out of parallel tests on CI. */
  workers: process.env.SINGLE_WORKER ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html']] : [['html']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chromium',
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: `http://localhost:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  retries: process.env.CI ? 2 : 1,
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'nightly',
    },
    {
      name: 'smoke',
      grep: /@smoke/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? `npx serve src/testing/infrastructure/dist -p ${port}` : `npm run start-test-bed -- --port ${port}`,
    timeout: 10 * 1000,
    port,
    reuseExistingServer: !process.env.CI,
  },
});
