import { expect, test, type Locator } from "@playwright/test";

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Expected locator to have a bounding box");
  }
  return box;
}

test.describe("Text old component E2E compatibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?example=textOldCompatibility");
  });

  test("renders empty, value, child content, and value precedence", async ({ page }) => {
    await expect(page.getByTestId("empty")).toBeAttached();
    await expect(page.getByTestId("empty")).toBeEmpty();
    await expect(page.getByTestId("value")).toHaveText("test content");
    await expect(page.getByTestId("child")).toHaveText("test content");
    await expect(page.getByTestId("valueWins")).toHaveText("this test text is the value of the heading");
  });

  test("coerces value prop types like the old Text component", async ({ page }) => {
    const expected = [
      "",
      "abcdef",
      "",
      "abcdef",
      "",
      "test",
      "1",
      "1.2",
      "true",
      "[object Object]",
      "[object Object]",
      "",
      "1,2,3",
    ];

    for (let i = 0; i < expected.length; i++) {
      await expect(page.getByTestId(`v${i}`)).toHaveText(expected[i]);
    }
  });

  test("preserves the old whitespace and selection behavior", async ({ page }) => {
    await expect(page.getByTestId("leading")).toHaveText("123");
    await expect(page.getByTestId("trailing")).toHaveText("123");
    await expect(page.getByTestId("whitespaceValue")).toHaveText("test        content");
    await expect(page.getByTestId("value")).toHaveCSS("user-select", "text");

    const short = await bounds(page.getByTestId("preserveShort"));
    const long = await bounds(page.getByTestId("preserveLong"));
    expect(long.height).toBeGreaterThan(short.height * 2);
  });

  test("renders semantic text variants", async ({ page }) => {
    await expect(page.getByTestId("variantStrong")).toHaveJSProperty("tagName", "STRONG");
    await expect(page.getByTestId("variantStrong")).toHaveText("Important text");
    await expect(page.getByTestId("variantCode")).toHaveJSProperty("tagName", "CODE");
    await expect(page.getByTestId("variantParagraph")).toHaveJSProperty("tagName", "P");
  });

  test("applies old overflow and maxLines behavior", async ({ page }) => {
    const short = await bounds(page.getByTestId("shortLine"));
    const ellipsis = await bounds(page.getByTestId("ellipsisLine"));
    const wrapped = await bounds(page.getByTestId("wrapLine"));

    expect(Math.abs(short.height - ellipsis.height)).toBeLessThan(10);
    expect(wrapped.height).toBeGreaterThan(short.height);
    await expect(page.getByTestId("ellipsisLine")).toHaveCSS("text-overflow", "ellipsis");
    await expect(page.getByTestId("clipLine")).not.toHaveCSS("text-overflow", "ellipsis");

    const layout = await bounds(page.getByTestId("oversizedText").locator("xpath=.."));
    const oversized = await bounds(page.getByTestId("oversizedText"));
    expect(layout.width).toBe(300);
    expect(oversized.width).toBe(400);
  });

  test("supports hasOverflow API and updates after data mutation", async ({ page }) => {
    await page.getByTestId("checkOverflow").click();
    await expect(page.getByTestId("overflowResult")).toHaveText("false");

    await page.getByTestId("makeOverflow").click();
    await page.getByTestId("checkOverflow").click();
    await expect(page.getByTestId("overflowResult")).toHaveText("true");
  });

  test("collapses nested text whitespace correctly", async ({ page }) => {
    await expect(page.getByTestId("nestedWhitespace")).toHaveText("test content here");
  });
});
