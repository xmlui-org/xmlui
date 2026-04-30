import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/debug-a-component.md"),
);

test.describe("Debug a component", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Debug a component");

  test("initial state shows all method labels and buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Method 1: JSON.stringify with preserveLinebreaks")).toBeVisible();
    await expect(
      page.getByText("Method 2: Console.log in handler (fires on button click only)"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Log to console" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update counter" })).toBeVisible();
  });

  test("initial state loads and displays API data as JSON", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("John Doe").isVisible()).toBe(true);
    await expect.poll(() => page.getByText('"id": 42').isVisible()).toBe(true);
  });

  test("clicking Update counter appends an entry to the watch log", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Update counter" }).click();
    await expect.poll(() =>
      page.getByText("counter changed →").isVisible(),
    ).toBe(true);
  });

  test("clicking Update counter multiple times keeps only the last 5 entries", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    for (let i = 0; i < 5; i++) {
      await page.getByRole("button", { name: "Update counter" }).click();
    }
    // After 5 clicks, counter goes from 1→6; watchLog slices to last 4 + new entry
    await expect.poll(() => page.getByText("counter changed → 6").isVisible()).toBe(true);
  });
});
