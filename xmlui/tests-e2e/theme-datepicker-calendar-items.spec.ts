import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/theme-datepicker-calendar-items.md"),
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
    await page.getByText("Pick a date").first().click();
    // Calendar popup renders day-of-week headers
    await expect.poll(() => page.getByText("Su").isVisible()).toBe(true);
  });

  test("clicking the themed DatePicker opens a calendar popup", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Pick a date").nth(1).click();
    await expect.poll(() => page.getByText("Su").isVisible()).toBe(true);
  });
});
