import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default properties", async ({ page, initTestBed }) => {
    await initTestBed(`<EmojiSelector testId="emoji-selector" />`, {});

    await expect(page.getByTestId("emoji-selector")).toBeVisible();
  });

  test("display selected emoji", async ({ page, initTestBed }) => {
    const EXPECTED_EMOTICON = "😀";
    const { testStateDriver } = await initTestBed(`
    <EmojiSelector onSelect="(emoji) => { testState = emoji }" />
  `);
    await page.getByText(EXPECTED_EMOTICON).click();
    await expect.poll(testStateDriver.testState).toBe(EXPECTED_EMOTICON);
  });
});


