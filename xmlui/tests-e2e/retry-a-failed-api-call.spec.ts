import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/retry-a-failed-api-call.md"),
);

test.describe("Retry a flaky API call", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Retry a flaky API call");

  test("initial state shows Save record button with no error card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Save record" })).toBeVisible();
    await expect(page.getByText("Request failed")).not.toBeVisible();
    await expect(page.getByText("Record created successfully.")).not.toBeVisible();
  });

  test("clicking Save record shows error card on first attempt", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save record" }).click();
    await expect.poll(() => page.getByText("Request failed").isVisible()).toBe(true);
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expect(page.getByText("Attempts: 0")).toBeVisible();
  });

  test("clicking Retry increments the attempt counter", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save record" }).click();
    await expect.poll(() => page.getByText("Request failed").isVisible()).toBe(true);
    await page.getByRole("button", { name: "Retry" }).click();
    await expect.poll(() => page.getByText("Attempts: 1").isVisible()).toBe(true);
  });

  test("third attempt succeeds and shows success message", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Attempt 1 — fails
    await page.getByRole("button", { name: "Save record" }).click();
    await expect.poll(() => page.getByText("Request failed").isVisible()).toBe(true);
    // Attempt 2 — fails
    await page.getByRole("button", { name: "Retry" }).click();
    await expect.poll(() => page.getByText("Attempts: 1").isVisible()).toBe(true);
    // Attempt 3 — succeeds
    await page.getByRole("button", { name: "Retry" }).click();
    await expect.poll(() => page.getByText("Record created successfully.").isVisible()).toBe(true);
    await expect(page.getByText("Request failed")).not.toBeVisible();
  });

  test("Save record button is disabled while request is in progress", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // After a successful save, the button should re-enable
    await page.getByRole("button", { name: "Save record" }).click();
    await expect.poll(() => page.getByText("Request failed").isVisible()).toBe(true);
    await expect(page.getByRole("button", { name: "Save record" })).toBeEnabled();
  });
});
