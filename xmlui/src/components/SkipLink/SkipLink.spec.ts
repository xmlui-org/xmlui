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

  test("is visually hidden until keyboard focus", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SkipLink testId="skip" />
      <Text testId="main">Main content</Text>
    `);

    const skip = page.getByTestId("skip");
    await expect(skip).toHaveCSS("top", "-999px");

    await page.keyboard.press("Tab");

    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS("top", "16px");
  });

  test("focuses XMLUI id targets without changing location hash", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SkipLink testId="skip" target="searchBox" />
      <TextBox id="searchBox" label="Search" />
    `);

    await page.getByTestId("skip").focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("textbox", { name: "Search" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });

  test("activates with Space and respects custom labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SkipLink testId="skip" target="main-panel" label="Skip filters" />
      <VStack testId="main-panel">
        <Button testId="main-action">Main action</Button>
      </VStack>
    `);

    const skip = page.getByTestId("skip");
    await expect(skip).toHaveAttribute("href", "#main-panel");
    await expect(skip).toHaveText("Skip filters");

    await skip.focus();
    await page.keyboard.press(" ");

    await expect(page.getByTestId("main-action")).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe("");
  });
});
