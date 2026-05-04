import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/wrap-items-across-multiple-rows.md"),
);

test.describe("Wrapping tag list", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Wrapping tag list");

  test("initial state shows all badge tags", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("React")).toBeVisible();
    await expect(page.getByText("TypeScript")).toBeVisible();
    await expect(page.getByText("Vite", { exact: true })).toBeVisible();
    await expect(page.getByText("Playwright")).toBeVisible();
    await expect(page.getByText("Dark Mode")).toBeVisible();
  });
});

test.describe("Mixed widths in a wrapping HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Mixed widths in a wrapping HStack",
  );

  test("initial state shows all three cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Fixed 200 px")).toBeVisible();
    await expect(page.getByText("30 %")).toBeVisible();
    await expect(page.getByText("Fills rest")).toBeVisible();
  });
});

test.describe("Cards with minWidth guard", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Cards with minWidth guard");

  test("initial state shows all four cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Card One")).toBeVisible();
    await expect(page.getByText("Card Two")).toBeVisible();
    await expect(page.getByText("Card Three")).toBeVisible();
    await expect(page.getByText("Card Four")).toBeVisible();
  });
});

test.describe("itemWidth on the HStack", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "itemWidth on the HStack");

  test("initial state shows all four cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alpha")).toBeVisible();
    await expect(page.getByText("Beta")).toBeVisible();
    await expect(page.getByText("Gamma")).toBeVisible();
    await expect(page.getByText("Delta")).toBeVisible();
  });
});
