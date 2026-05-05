import { expect, test } from "../../testing/fixtures";

// =============================================================================
// LIFECYCLE EVENT TESTS
// =============================================================================

test.describe("Lifecycle Events", () => {
  test("onInit fires when Fragment has no 'when' prop", async ({ initTestBed }) => {
    // Regression: Fragment without 'when' was silently unwrapped by extractAppComponents,
    // discarding its events before they could fire.
    const { testStateDriver } = await initTestBed(`
      <App>
        <Fragment onInit="testState = 'initialized'">
          <Text value="content" />
        </Fragment>
      </App>`);

    await expect.poll(testStateDriver.testState).toEqual("initialized");
  });

  test("onInit fires when Fragment becomes visible via 'when'", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.visible="{false}">
        <Fragment when="{visible}" onInit="testState = 'initialized'">
          <Text value="content" testId="content" />
        </Fragment>
        <Button testId="show" onClick="{() => visible = true}">Show</Button>
      </App>`);

    await expect(page.getByTestId("content")).not.toBeVisible();
    await page.getByTestId("show").click();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect.poll(testStateDriver.testState).toEqual("initialized");
  });

  test("onCleanup fires when Fragment is hidden via 'when'", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.visible="{true}">
        <Fragment when="{visible}" onCleanup="testState = 'cleaned-up'">
          <Text value="content" testId="content" />
        </Fragment>
        <Button testId="hide" onClick="{() => visible = false}">Hide</Button>
      </App>`);

    await expect(page.getByTestId("content")).toBeVisible();
    await page.getByTestId("hide").click();
    await expect(page.getByTestId("content")).not.toBeVisible();
    await expect.poll(testStateDriver.testState).toEqual("cleaned-up");
  });
});

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
      <Theme fontSize="${expectedFontSize}">
        <App>
          <Stack testId="container">
            <Fragment>
              <Text value='Item #1' />
              <Text value='Item #2' />
              <Text value='Item #3' />
            </Fragment>
          </Stack>
        </App>
      </Theme>`,
    );
    for (const child of await page.locator(`[data-testid="container"] > *`).all()) {
      await expect(child).toHaveCSS("font-size", expectedFontSize);
    }
  });
});
