import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/display-an-empty-state-illustration.md"),
);

test.describe("Task list with an empty state", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Task list with an empty state");

  test("initial state shows all three tasks with their priorities", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Review pull requests")).toBeVisible();
    await expect(page.getByText("Update documentation")).toBeVisible();
    await expect(page.getByText("Fix login page bug")).toBeVisible();
    await expect(page.getByText("High").first()).toBeVisible();
    await expect(page.getByText("Normal")).toBeVisible();
  });

  test("clearing all tasks shows the empty state template", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Clear all tasks" }).click();
    await expect(page.getByText("No tasks yet")).toBeVisible();
    await expect(page.getByText("You are all caught up!")).toBeVisible();
  });

  test("task rows are hidden after clearing", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Clear all tasks" }).click();
    await expect(page.getByText("Review pull requests")).not.toBeVisible();
    await expect(page.getByText("Update documentation")).not.toBeVisible();
    await expect(page.getByText("Fix login page bug")).not.toBeVisible();
  });
});
