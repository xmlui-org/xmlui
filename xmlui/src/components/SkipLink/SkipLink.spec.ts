import { expect, test } from "../../testing/fixtures";

test.describe("SkipLink foundation", () => {
  test("renders with the default accessible label and target", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SkipLink testId="skip" />
      <Text testId="main">Main content</Text>
    `);

    const skip = page.getByTestId("skip");
    await expect(skip).toHaveAttribute("href", "#main");
    await expect(skip).toHaveText("Skip to main content");
  });

  test("focuses target by test id", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SkipLink testId="skip" target="main-panel" label="Skip" />
      <VStack testId="main-panel">
        <Button testId="target-button">Target</Button>
      </VStack>
    `);

    await page.getByTestId("skip").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("target-button")).toBeFocused();
  });
});

test.describe("SkipLink old-suite transfer debt", () => {
  test("copy literal portal, keyboard, and visual-hidden tests", async () => {
    test.fixme(true, "The full old SkipLink suite is deferred to accessibility closure");
  });
});
