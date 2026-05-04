import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/debounce-user-input-for-api-calls.md"),
);

test.describe("Search with debounced API calls", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Search with debounced API calls",
  );

  test("initial state shows search box and zero counters", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("Changed/Invoked: 0 / 0")).toBeVisible();
  });

  test("typing increments the Changed counter immediately", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox").fill("Lap");
    await expect.poll(() => page.getByText(/Changed\/Invoked: \d+ \/ \d+/).textContent()).resolves.toMatch(/Changed\/Invoked: [1-9]\d* \/ \d+/);
  });

  test("results appear after debounce and API call complete", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox").fill("Laptop");
    await expect.poll(
      () => page.getByText("Laptop (Electronics) - $999").isVisible(),
      { timeout: 5000 },
    ).toBe(true);
    // Invoked counter must have incremented once
    await expect(page.getByText("Changed/Invoked: 1 / 1")).toBeVisible();
  });

  test("searching for a category returns multiple results", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox").fill("Electronics");
    await expect.poll(
      () => page.getByText("Found 4 results").isVisible(),
      { timeout: 5000 },
    ).toBe(true);
  });

  test("searching for an unknown term shows no results", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox").fill("zzzunknown");
    await expect.poll(
      () => page.getByText("No results found").isVisible(),
      { timeout: 5000 },
    ).toBe(true);
  });

  test("clearing the search hides the results card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox").fill("Laptop");
    await expect.poll(
      () => page.getByText("Laptop (Electronics) - $999").isVisible(),
      { timeout: 5000 },
    ).toBe(true);
    await page.getByRole("textbox").fill("");
    await expect(page.getByText("Laptop (Electronics) - $999")).not.toBeVisible();
  });
});
