import { expect, test } from "./fixtures";
import {initApp, initThemedApp} from "./component-test-helpers";

test("parent has items", async ({ page }) => {
  const containerId = "container";
  const childComponents = [
    "<Text value='Item #1' />",
    "<Text value='Item #2' />",
    "<Text value='Item #3' />",
  ];
  const expectedChildCount = childComponents.length;
  const expectedChildrenDisplay = ["Item #1", "Item #2", "Item #3"];

  await initApp(page, {
    entryPoint: `
    <Stack testId="${containerId}">
      <Fragment>
        ${childComponents.join("\n")}
      </Fragment>
    </Stack>`,
  });

  const children = page.locator(`[data-testid="${containerId}"] > *`);
  await expect(children).toHaveCount(expectedChildCount);
  await expect(children).toHaveText(expectedChildrenDisplay);
});

test("parent style affects children", async ({ page }) => {
  const containerId = "container";
  const childComponents = [
    "<Text value='Item #1' />",
    "<Text value='Item #2' />",
    "<Text value='Item #3' />",
  ];
  const expectedFontSize = "14px";

  await initThemedApp(page, {
    entryPoint: `
    <Stack testId="${containerId}" fontSize="${expectedFontSize}">
      <Fragment>
        ${childComponents.join("\n")}
      </Fragment>
    </Stack>`,
  }, {
    themeVars: {
        "font-size": "16px",
    }
  });

  for (const child of await page.locator(`[data-testid="${containerId}"] > *`).all()) {
    await expect(child).toHaveCSS("font-size", expectedFontSize);
  }
});