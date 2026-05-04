import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/theme-button-variant-color-combos.md"),
);

test.describe("Button variant and color theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Button variant and color theming",
  );

  test("initial state shows all three styled buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Primary solid" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Secondary outlined" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Attention ghost" })).toBeVisible();
  });

  test("all three buttons are clickable", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Primary solid" }).click();
    await page.getByRole("button", { name: "Secondary outlined" }).click();
    await page.getByRole("button", { name: "Attention ghost" }).click();
    // Buttons have no side-effects in this example — just verify no errors occur
    await expect(page.getByRole("button", { name: "Primary solid" })).toBeVisible();
  });
});
