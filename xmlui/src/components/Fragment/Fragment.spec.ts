import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("parent has items", async ({ page, initTestBed }) => {
    const expectedChildCount = 3;
    const expectedChildrenDisplay = ["Item #1", "Item #2", "Item #3"];

    await initTestBed(`
    <Stack testId="container">
      <Fragment>
        <Text value='Item #1' />
        <Text value='Item #2' />
        <Text value='Item #3' />
      </Fragment>
    </Stack>`);

    const children = page.locator(`[data-testid="container"] > *`);
    await expect(children).toHaveCount(expectedChildCount);
    await expect(children).toHaveText(expectedChildrenDisplay);
  });

  test("parent style affects children", async ({ page, initTestBed }) => {
    const expectedFontSize = "20px";
    await initTestBed(`
      <App>
        <Stack testId="container">
          <Fragment>
            <Text value='Item #1' />
            <Text value='Item #2' />
            <Text value='Item #3' />
          </Fragment>
        </Stack>
      </App>`,
      {
        testThemeVars: {
          "fontSize": "20px",
        },
      },
    );
    for (const child of await page.locator(`[data-testid="container"] > *`).all()) {
      await expect(child).toHaveCSS("font-size", expectedFontSize);
    }
  });
});
