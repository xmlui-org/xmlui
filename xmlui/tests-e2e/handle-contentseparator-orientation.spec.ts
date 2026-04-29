import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/handle-contentseparator-orientation.md"),
);

test.describe("ContentSeparator orientation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "ContentSeparator orientation");

  test("initial state renders all three orientation sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Horizontal (default)")).toBeVisible();
    await expect(page.getByText("Vertical — parent has explicit height")).toBeVisible();
    await expect(page.getByText("Vertical with explicit length")).toBeVisible();
  });

  test("horizontal section shows top and bottom items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Top item")).toBeVisible();
    await expect(page.getByText("Bottom item")).toBeVisible();
  });

  test("vertical sections show left, middle, and right labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Middle")).toBeVisible();
    const leftItems = page.getByText("Left", { exact: true });
    const rightItems = page.getByText("Right", { exact: true });
    await expect(leftItems).toHaveCount(2);
    await expect(rightItems).toHaveCount(2);
  });
});
