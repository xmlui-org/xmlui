import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/add-drag-and-drop-reordering-to-a-list.md",
  ),
);

test.describe("Reorderable task backlog", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Reorderable task backlog",
  );

  // XMLUI's List component renders items as generic divs (no listitem role).
  // Navigate from task text → parent row with .locator("..") to scope button assertions.

  test("initial state shows all 5 tasks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Define project requirements", { exact: true })).toBeVisible();
    await expect(page.getByText("Set up development environment", { exact: true })).toBeVisible();
    await expect(page.getByText("Design database schema", { exact: true })).toBeVisible();
    await expect(page.getByText("Implement user authentication", { exact: true })).toBeVisible();
    await expect(page.getByText("Write unit tests", { exact: true })).toBeVisible();
  });

  test("move-up button is disabled for the first item", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const firstRow = page.getByText("Define project requirements", { exact: true }).locator("..");
    await expect(firstRow.getByRole("button", { name: "chevronup" })).toBeDisabled();
    await expect(firstRow.getByRole("button", { name: "chevrondown" })).toBeEnabled();
  });

  test("move-down button is disabled for the last item", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const lastRow = page.getByText("Write unit tests", { exact: true }).locator("..");
    await expect(lastRow.getByRole("button", { name: "chevrondown" })).toBeDisabled();
    await expect(lastRow.getByRole("button", { name: "chevronup" })).toBeEnabled();
  });

  test("clicking move-down on the first item swaps it with the second", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const firstRow = page.getByText("Define project requirements", { exact: true }).locator("..");
    await firstRow.getByRole("button", { name: "chevrondown" }).click();
    // After swap: "Set up development environment" is now first → its chevronup should be disabled
    const setUpRow = page.getByText("Set up development environment", { exact: true }).locator("..");
    await expect.poll(() => setUpRow.getByRole("button", { name: "chevronup" }).isDisabled()).toBe(true);
    // "Define project requirements" moved to position 1 → its chevronup should now be enabled
    const defineRow = page.getByText("Define project requirements", { exact: true }).locator("..");
    await expect.poll(() => defineRow.getByRole("button", { name: "chevronup" }).isEnabled()).toBe(true);
  });

  test("clicking move-up on the last item swaps it with the one before", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const lastRow = page.getByText("Write unit tests", { exact: true }).locator("..");
    await lastRow.getByRole("button", { name: "chevronup" }).click();
    // After swap: "Implement user authentication" is now last → its chevrondown should be disabled
    const implementRow = page.getByText("Implement user authentication", { exact: true }).locator("..");
    await expect.poll(() => implementRow.getByRole("button", { name: "chevrondown" }).isDisabled()).toBe(true);
    // "Write unit tests" moved to position 3 → its chevrondown should now be enabled
    const writeRow = page.getByText("Write unit tests", { exact: true }).locator("..");
    await expect.poll(() => writeRow.getByRole("button", { name: "chevrondown" }).isEnabled()).toBe(true);
  });
});
