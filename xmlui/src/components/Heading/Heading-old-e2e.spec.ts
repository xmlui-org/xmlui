import { expect, test, type Locator } from "@playwright/test";

async function bounds(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Expected locator to have a bounding box");
  }
  return box;
}

async function expectTag(locator: Locator, tagName: string) {
  await expect(locator).toHaveJSProperty("tagName", tagName.toUpperCase());
}

test.describe("Heading old component E2E compatibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?example=headingOldCompatibility");
  });

  test("renders generic Heading with basic value behavior", async ({ page }) => {
    await expect(page.getByTestId("headingEmpty")).toBeAttached();
    await expect(page.getByTestId("headingBasic")).toBeVisible();
    await expect(page.getByTestId("headingBasic")).toHaveText("Test Heading");
    await expect(page.getByTestId("headingValue")).toHaveText("Value prop text");
    await expect(page.getByTestId("headingValueWins")).toHaveText("this test text is the value of the heading");
  });

  test("normalizes Heading level values like the old component", async ({ page }) => {
    for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      await expectTag(page.getByTestId(`level${level.toUpperCase()}`), level);
    }
    await expectTag(page.getByTestId("levelNumber"), "h3");
    await expectTag(page.getByTestId("levelStringNumber"), "h2");
    await expectTag(page.getByTestId("levelUppercase"), "h4");
    await expectTag(page.getByTestId("levelWhitespace"), "h2");
    await expectTag(page.getByTestId("levelInvalid"), "h1");
  });

  test("renders H1-H6 shortcuts and ignores level overrides", async ({ page }) => {
    for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      const shortcut = page.getByTestId(`shortcut${level.toUpperCase()}`);
      await expect(shortcut).toHaveRole("heading");
      await expectTag(shortcut, level);
      await expect(shortcut).toHaveText(`Shortcut ${level.toUpperCase()}`);
    }

    await expectTag(page.getByTestId("shortcutIgnoresLevel"), "h2");
    await expectTag(page.getByTestId("genericH2"), "h2");
    await expectTag(page.getByTestId("specializedH2"), "h2");
    await expect(page.getByTestId("genericH2")).toHaveText("Content");
    await expect(page.getByTestId("specializedH2")).toHaveText("Content");
  });

  test("coerces Heading value prop types like the old component", async ({ page }) => {
    const expected = [
      "",
      "",
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
      await expect(page.getByTestId(`headingV${i}`)).toHaveText(expected[i]);
    }
  });

  test("preserves old selection, whitespace, and overflow behavior", async ({ page }) => {
    await expect(page.getByTestId("headingWhitespaceValue")).toHaveText("test        content");
    await expect(page.getByTestId("headingSelectable")).toHaveCSS("user-select", "text");

    const short = await bounds(page.getByTestId("headingShort"));
    const maxLines = await bounds(page.getByTestId("headingMaxLines"));
    const preserve = await bounds(page.getByTestId("headingPreserve"));
    const ellipsis = await bounds(page.getByTestId("headingEllipsis"));
    const wrapped = await bounds(page.getByTestId("headingWrapped"));

    expect(maxLines.height).toBeGreaterThan(short.height);
    expect(preserve.height).toBeGreaterThan(short.height * 2);
    expect(Math.abs(short.height - ellipsis.height)).toBeLessThan(10);
    expect(wrapped.height).toBeGreaterThan(short.height);
    await expect(page.getByTestId("headingEllipsis")).toHaveCSS("text-overflow", "ellipsis");
    await expect(page.getByTestId("headingNoEllipsis")).not.toHaveCSS("text-overflow", "ellipsis");
  });

  test("supports hasOverflow API and updates after data mutation", async ({ page }) => {
    await page.getByTestId("checkHeadingOverflow").click();
    await expect(page.getByTestId("headingOverflowResult")).toHaveText("true");

    await page.getByTestId("toggleHeadingText").click();
    await page.getByTestId("checkHeadingOverflow").click();
    await expect(page.getByTestId("headingOverflowResult")).toHaveText("false");
  });

  test("collapses nested heading whitespace correctly", async ({ page }) => {
    await expect(page.getByTestId("nestedHeadingWhitespace")).toHaveText("test content here");
  });
});
