import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/use-a-custom-formitem.md"),
);

test.describe("Custom FormItem control", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Custom FormItem control",
  );

  test("shows the custom toggle with label on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Toggle (click to change)")).toBeVisible();
  });

  test("submitting shows the initial true value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    await expect
      .poll(() => page.getByText('{"myCustomProp":true}').isVisible())
      .toBe(true);
  });

  test("clicking the toggle changes the submitted value to false", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The custom Stack control is rendered inside the labeled item area.
    // Navigate via XPath from the label to its sibling wrapper and click the first div inside.
    const toggleBox = page
      .locator(
        'xpath=//label[normalize-space(text())="Toggle (click to change)"]/ancestor::div[contains(@class,"labelWrapper")]/following-sibling::div[1]//div[1]',
      )
      .first();
    await toggleBox.click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect
      .poll(() => page.getByText('{"myCustomProp":false}').isVisible())
      .toBe(true);
  });
});
