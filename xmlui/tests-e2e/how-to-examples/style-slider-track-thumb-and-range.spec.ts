import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/style-slider-track-thumb-and-range.md"),
);

test.describe("Slider track, thumb, and range theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Slider track, thumb, and range theming",
  );

  test("initial state shows Default and Themed column labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Default", { exact: true })).toBeVisible();
    await expect(page.getByText("Themed", { exact: true })).toBeVisible();
  });

  test("initial state renders Volume and Disabled slider labels in both columns", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Volume").first()).toBeVisible();
    await expect(page.getByText("Volume").nth(1)).toBeVisible();
    await expect(page.getByText("Disabled").first()).toBeVisible();
    await expect(page.getByText("Disabled").nth(1)).toBeVisible();
  });

  test("initial state renders four sliders", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("slider").first()).toBeVisible();
    await expect(page.getByRole("slider").nth(1)).toBeVisible();
    await expect(page.getByRole("slider").nth(2)).toBeVisible();
    await expect(page.getByRole("slider").nth(3)).toBeVisible();
  });

  test("disabled sliders are not interactive", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The two disabled sliders (one default, one themed) should be disabled
    const sliders = page.getByRole("slider");
    await expect(sliders.nth(1)).toBeDisabled();
    await expect(sliders.nth(3)).toBeDisabled();
  });
});
