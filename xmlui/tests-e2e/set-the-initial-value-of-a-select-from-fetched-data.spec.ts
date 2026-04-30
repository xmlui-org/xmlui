import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/set-the-initial-value-of-a-select-from-fetched-data.md",
  ),
);

test.describe("Set the initial value of a Select from fetched data", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Set the initial value of a Select from fetched data",
  );

  test("select renders with the first option pre-selected", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("combobox")).toBeVisible();
    await expect(page.getByText("Coder Gal", { exact: true })).toBeVisible();
  });

  test("select contains all loaded user options", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("combobox").click();
    await expect(page.getByRole("option", { name: "Coder Gal" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Tech Ninja" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Design Diva" })).toBeVisible();
  });
});
