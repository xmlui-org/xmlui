import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/buffer-a-reactive-edit.md"),
);

test.describe("Buffered task editing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Buffered task editing");

  test.fixme("focus then blur writes PUT to the log", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').first().click();
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.locator("textarea")).toContainText("PUT");
  });

  test.fixme("editing text commits updated value on blur", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').first().click();
    await page.locator('input[type="text"]').first().fill("Merge feature branch");
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.locator("textarea")).toContainText("Merge feature branch");
  });

  test.fixme("clearing a field does not write a PUT entry", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').first().click();
    await page.locator('input[type="text"]').first().fill("");
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.locator("textarea")).not.toContainText("PUT");
  });

  test.fixme("Clear button empties the log", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').first().click();
    await page.getByRole("heading", { name: "Todo list" }).click();
    await expect(page.locator("textarea")).toContainText("PUT");
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.locator("textarea")).toBeEmpty();
  });
});
