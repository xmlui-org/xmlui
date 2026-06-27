import { expect, test } from "@playwright/test";

test("markdown foundation example renders markdown, bindings, code, and nested playground", async ({ page }) => {
  await page.goto("/?example=markdownFoundation");

  await expect(page.getByTestId("markdown-foundation")).toContainText("Markdown Foundation");
  await expect(page.getByTestId("markdown-foundation")).toContainText("Count: 1");
  await expect(page.locator("pre > code")).toContainText("@{count}");

  await page.getByTestId("markdown-button").click();
  await expect(page.getByTestId("markdown-foundation")).toContainText("Count: 2");

  await expect(page.getByTestId("nested-markdown-count")).toHaveText("Nested: 0");
  await page.getByTestId("nested-markdown-button").click();
  await expect(page.getByTestId("nested-markdown-count")).toHaveText("Nested: 1");
});
