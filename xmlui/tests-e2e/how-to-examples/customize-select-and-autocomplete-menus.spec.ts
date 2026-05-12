import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/customize-select-and-autocomplete-menus.md",
  ),
);

// display-only example — no interaction to test
test.describe("Custom Select and AutoComplete menus", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Custom Select and AutoComplete menus",
  );

  test("renders single select and multi-select fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Single select")).toBeVisible();
    await expect(page.getByText("Multi-select with badges")).toBeVisible();
  });

  test("can select options in single select", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const singleSelect = page.getByRole("combobox", { name: "Single select" });
    await singleSelect.click();
    await page.getByRole("option", { name: "Option A" }).click();
    await expect(singleSelect).toHaveText("Option A");
  });

  test("can select multiple options in multi-select", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const multiSelect = page.getByRole("combobox", { name: "Multi-select with badges" });
    await multiSelect.click();
    await page.getByRole("option", { name: "Alpha" }).click();
    await page.getByRole("option", { name: "Gamma" }).click();
    await expect(multiSelect.getByText("Alpha")).toBeVisible();
    await expect(multiSelect.getByText("Gamma")).toBeVisible();
  });
});
