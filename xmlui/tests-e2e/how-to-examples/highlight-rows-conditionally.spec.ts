import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/highlight-rows-conditionally.md"),
);

test.describe("Conditional row highlighting", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Conditional row highlighting",
  );

  test("renders the table with all tasks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Fix login bug")).toBeVisible();
    await expect(page.getByText("Update docs")).toBeVisible();
    await expect(page.getByText("Redesign dashboard")).toBeVisible();
    await expect(page.getByText("Add dark mode")).toBeVisible();
    await expect(page.getByText("Migrate database")).toBeVisible();
  });

  test("overdue rows show status badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Overdue items have "overdue" badges
    const overdueBadges = page.getByText("overdue", { exact: true });
    await expect(overdueBadges).toHaveCount(2);
  });

  test("at-risk row shows at-risk badge", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("at-risk", { exact: true })).toBeVisible();
  });

  test("on-track rows show on-track badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const onTrackBadges = page.getByText("on-track", { exact: true });
    await expect(onTrackBadges).toHaveCount(2);
  });
});

test.describe("highlight-one-row-from-code", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Highlight one row from code",
  );
  const row = (page: any, title: string) => page.getByRole("row").filter({ hasText: title });

  test("starts with no highlighted row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("No current task")).toBeVisible();
    await expect(page.locator("tbody tr[class*='selected']")).toHaveCount(0);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
  });

  test("Next highlights the whole row of the current task", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Current: Fix login bug")).toBeVisible();
    await expect(row(page, "Fix login bug")).toHaveClass(/selected/);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Current: Update docs")).toBeVisible();
    await expect(row(page, "Update docs")).toHaveClass(/selected/);
    await expect(row(page, "Fix login bug")).not.toHaveClass(/selected/);
    // The selection tints the row, so the highlighted row looks different from the others.
    const bg = (title: string) =>
      row(page, title).evaluate((el: Element) => {
        const cell = el.querySelector("td") ?? el;
        const rowBg = getComputedStyle(el).backgroundColor;
        const cellBg = getComputedStyle(cell).backgroundColor;
        return cellBg !== "rgba(0, 0, 0, 0)" ? cellBg : rowBg;
      });
    expect(await bg("Update docs")).not.toBe(await bg("Fix login bug"));
  });

  test("Clear removes the highlight", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Next" }).click();
    await expect(row(page, "Fix login bug")).toHaveClass(/selected/);
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("No current task")).toBeVisible();
    await expect(page.locator("tbody tr[class*='selected']")).toHaveCount(0);
  });

  test("clicking a row updates the current task", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await row(page, "Redesign dashboard").click();
    await expect(page.getByText("Current: Redesign dashboard")).toBeVisible();
    await expect(row(page, "Redesign dashboard")).toHaveClass(/selected/);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Current: Add dark mode")).toBeVisible();
  });

  test("arrow keys keep the current task in step with the highlight", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await row(page, "Update docs").click();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByText("Current: Redesign dashboard")).toBeVisible();
    await expect(row(page, "Redesign dashboard")).toHaveClass(/selected/);
  });
});
