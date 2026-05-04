import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/poll-an-api-at-regular-intervals.md",
  ),
);

test.describe("Live server metrics dashboard", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Live server metrics dashboard",
  );

  test("displays server metrics cards on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Server Metrics")).toBeVisible();
    await expect(page.getByText("CPU Usage")).toBeVisible();
    await expect(page.getByText("Memory")).toBeVisible();
    await expect(page.getByText("Active Connections")).toBeVisible();
  });

  test("shows the live badge", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Live — refreshes every 3 s")).toBeVisible();
  });

  test("displays metric values and timestamp", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // CPU renders as e.g. "42%", Memory as "612 MB"
    await expect(page.getByText(/\d+%/)).toBeVisible();
    await expect(page.getByText(/\d+ MB/)).toBeVisible();
    await expect(page.getByText(/Last updated:/)).toBeVisible();
  });
});
