import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/control-item-spacing-with-gap.md"),
);

test.describe("Compact toolbar vs spacious cards", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Compact toolbar vs spacious cards",
  );

  test("initial state shows toolbar and card section", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Bold" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Italic" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Underline" })).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Costs")).toBeVisible();
    await expect(page.getByText("Profit")).toBeVisible();
  });
});

test.describe("Comparing gap tokens", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Comparing gap tokens",
  );

  test("initial state shows all three gap token labels and buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText('gap="$gap-tight"')).toBeVisible();
    await expect(page.getByText('gap="$gap-normal" (default)')).toBeVisible();
    await expect(page.getByText('gap="$gap-loose"')).toBeVisible();
    await expect(page.getByRole("button", { name: "First" }).first()).toBeVisible();
  });
});

test.describe("Items with no gap", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Items with no gap");

  test("initial state shows Day, Week, Month buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Day" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Week" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Month" })).toBeVisible();
  });
});

test.describe("Percentage widths without gap overflow", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Percentage widths without gap overflow",
  );

  test("initial state shows overflow and no-overflow rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("With explicit gap (overflows)")).toBeVisible();
    await expect(page.getByText('With gap="0" (no overflow)')).toBeVisible();
  });
});
