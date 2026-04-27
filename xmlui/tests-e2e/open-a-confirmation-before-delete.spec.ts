import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/open-a-confirmation-before-delete.md"),
);

test.describe("Confirm before deleting a task", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Confirm before deleting a task");

  test("confirming delete removes the task", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Write proposal")).toBeVisible();
    await page.getByText("Write proposal").locator("..").getByRole("button").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Write proposal")).not.toBeVisible();
  });

  test("cancelling delete keeps the task", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Write proposal")).toBeVisible();
    await page.getByText("Write proposal").locator("..").getByRole("button").click();
    await page.getByRole("button", { name: "Keep" }).click();
    await expect(page.getByText("Write proposal")).toBeVisible();
  });

  test("task count decreases after confirmed delete", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Task list (3)")).toBeVisible();
    await page.getByText("Write proposal").locator("..").getByRole("button").click();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Task list (2)")).toBeVisible();
  });
});
