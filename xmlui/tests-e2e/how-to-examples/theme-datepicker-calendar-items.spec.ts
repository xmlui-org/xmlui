import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/theme-datepicker-calendar-items.md"),
);

test.describe("DatePicker calendar item theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "DatePicker calendar item theming",
  );

  test("initial state shows Default and Themed column labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Default", { exact: true })).toBeVisible();
    await expect(page.getByText("Themed", { exact: true })).toBeVisible();
  });

  test("initial state renders two Pick a date inputs", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Pick a date").first()).toBeVisible();
    await expect(page.getByText("Pick a date").nth(1)).toBeVisible();
  });

  test("clicking the default DatePicker opens a calendar popup", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The calendar opens from the control's non-input chrome (the editable input
    // is reserved for typing). Click its leading padding to open.
    await page.locator('[data-part="control"]').first().click({ position: { x: 6, y: 6 } });
    // The opened calendar renders day-of-week headers. Both pickers keep their
    // calendar mounted, so scope to the visible ones.
    await expect
      .poll(() => page.locator('[data-part="table-header"]:visible').count())
      .toBeGreaterThan(0);
  });

  test("clicking the themed DatePicker opens a calendar popup", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part="control"]').nth(1).click({ position: { x: 6, y: 6 } });
    await expect
      .poll(() => page.locator('[data-part="table-header"]:visible').count())
      .toBeGreaterThan(0);
  });
});
