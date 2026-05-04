import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/buffer-a-reactive-edit.md"),
);

test.describe("Buffered task editing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Buffered task editing");

  async function initExample(initTestBed: any, page: any) {
    await initTestBed(app, { components, apiInterceptor });
    const firstTask = page.getByRole("textbox").first();
    await expect(firstTask).toHaveValue("Review pull requests");
    return firstTask;
  }

  test("focus shows which row is being edited", async ({ initTestBed, page }) => {
    const firstTask = await initExample(initTestBed, page);
    await firstTask.click();
    await expect(page.getByText("Editing", { exact: true })).toBeVisible();
  });

  test("editing text commits one PUT on blur", async ({ initTestBed, page }) => {
    const firstTask = await initExample(initTestBed, page);
    await firstTask.click();
    await firstTask.fill("Merge feature branch");
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.getByText("Last PUT /api/tasks/1: Merge feature branch")).toBeVisible();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  });

  test("clearing a field does not write a PUT", async ({ initTestBed, page }) => {
    const firstTask = await initExample(initTestBed, page);
    await firstTask.click();
    await firstTask.fill("");
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.getByText("Last PUT")).not.toBeVisible();
    await expect(page.getByText("Focus a task, change its text, then click outside the field.")).toBeVisible();
  });
});
