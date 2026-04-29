import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/customize-tooltip-appearance.md"),
);

test.describe("Custom Tooltip appearance", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Custom Tooltip appearance",
  );

  test("initial state shows all four buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Top with arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Right with arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bottom no arrow" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Left with arrow" })).toBeVisible();
  });

  test("hovering Top with arrow shows the tooltip text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Top with arrow" }).hover();
    await expect.poll(() =>
      page.getByText("Appears above with arrow").isVisible(),
    ).toBe(true);
  });

  test("hovering Right with arrow shows the tooltip text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Right with arrow" }).hover();
    await expect.poll(() =>
      page.getByText("Appears to the right with arrow").isVisible(),
    ).toBe(true);
  });

  test("hovering Bottom no arrow shows the tooltip text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Bottom no arrow" }).hover();
    await expect.poll(() =>
      page.getByText("Appears below, no arrow").isVisible(),
    ).toBe(true);
  });

  test("hovering Left with arrow shows the tooltip text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Left with arrow" }).hover();
    await expect.poll(() =>
      page.getByText("Appears to the left with arrow").isVisible(),
    ).toBe(true);
  });
});
