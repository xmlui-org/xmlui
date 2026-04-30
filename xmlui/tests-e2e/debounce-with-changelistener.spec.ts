import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/debounce-with-changelistener.md"),
);

test.describe("Debounced value listener", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Debounced value listener");

  test("initial state shows only the search box", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Search products:" })).toBeVisible();
    await expect(page.getByText("No results found")).not.toBeVisible();
    await expect(page.getByText(/Searching for:/)).not.toBeVisible();
  });

  test("typing shows the in-progress state immediately", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Search products:" }).fill("Lap");
    await expect(page.getByText("Searching for: Lap")).toBeVisible();
  });

  test("results appear after the debounced listener calls the API", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Search products:" }).fill("Laptop");
    await expect
      .poll(() => page.getByText("Laptop (Electronics) - $999").isVisible(), { timeout: 5000 })
      .toBe(true);
    await expect(page.getByText("Found 1 result(s)")).toBeVisible();
  });

  test("searching by category returns multiple products", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Search products:" }).fill("Electronics");
    await expect
      .poll(() => page.getByText("Found 4 result(s)").isVisible(), { timeout: 5000 })
      .toBe(true);
    await expect(page.getByText("Mouse (Electronics) - $29")).toBeVisible();
    await expect(page.getByText("Keyboard (Electronics) - $79")).toBeVisible();
  });

  test("searching for an unknown term shows the empty result state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Search products:" }).fill("zzzunknown");
    await expect
      .poll(() => page.getByText("No results found").isVisible(), { timeout: 5000 })
      .toBe(true);
  });

  test("clearing the search hides the results card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "Search products:" }).fill("Laptop");
    await expect
      .poll(() => page.getByText("Laptop (Electronics) - $999").isVisible(), { timeout: 5000 })
      .toBe(true);
    await page.getByRole("textbox", { name: "Search products:" }).fill("");
    await expect(page.getByText("Laptop (Electronics) - $999")).not.toBeVisible();
  });
});
