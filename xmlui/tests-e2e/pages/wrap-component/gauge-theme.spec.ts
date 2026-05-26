import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/gauge-theme.md",
  ),
);

test.describe("demo-b71f", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "demo-b71f");

  test("renders the gauge with initial value and control buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-gauge" });
    await expect(page.getByText("Value: 42")).toBeVisible();
    await expect(page.getByRole("button", { name: "Set 0" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set 50" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set 100" })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Digital display' })).toBeVisible();
  });

  test("clicking Set 0 updates the displayed value to 0", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-gauge" });
    await page.getByRole("button", { name: "Set 0" }).click();
    await expect.poll(() => page.getByText("Value: 0").isVisible()).toBe(true);
  });

  test("clicking Set 100 updates the displayed value to 100", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-gauge" });
    await page.getByRole("button", { name: "Set 100" }).click();
    await expect.poll(() => page.getByText("Value: 100").isVisible()).toBe(true);
  });
});
