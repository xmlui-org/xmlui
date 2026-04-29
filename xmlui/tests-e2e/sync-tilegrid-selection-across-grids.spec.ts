import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/sync-tilegrid-selection-across-grids.md",
  ),
);

test.describe("Sync TileGrid selection across two grids", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Sync TileGrid selection across two grids",
  );

  test("initial state renders both grids with all items and empty selection", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Products")).toBeVisible();
    await expect(page.getByText("Selection mirror")).toBeVisible();
    // Both grids render the same three items
    await expect(page.getByText("MacBook Pro")).toHaveCount(2);
    await expect(page.getByText("iPad")).toHaveCount(2);
    await expect(page.getByText("iPhone")).toHaveCount(2);
    await expect(page.getByText(/Selected IDs:/)).toContainText("[]");
  });

  test("selecting an item in the first grid updates the shared selection caption", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("MacBook Pro").first().click();
    await expect.poll(() => page.getByText(/Selected IDs:/).textContent()).toContain("1");
  });

  test("selection in the first grid mirrors to the second grid", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("iPad").first().click();
    await expect.poll(() => page.getByText(/Selected IDs:/).textContent()).toContain("2");
    // Both occurrences of "iPad" should now be visually selected — the shared
    // selectedIds drives both grids, so clicking one tile affects both.
    await expect(page.getByText(/Selected IDs:/)).toContainText("[2]");
  });

  test("selecting multiple items accumulates IDs in shared selection", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("MacBook Pro").first().click();
    await expect.poll(() => page.getByText(/Selected IDs:/).textContent()).toContain("1");
    await page.getByText("iPhone").first().click({ modifiers: ["Meta"] });
    await expect.poll(() => page.getByText(/Selected IDs:/).textContent()).toContain("3");
  });
});
