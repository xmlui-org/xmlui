import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/share-a-modaldialog-across-components.md",
  ),
);

test.describe("Share a ModalDialog across components", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Share a ModalDialog across components",
  );

  test("initial state shows the item list and settings button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await expect(page.getByText("Mountain View")).toBeVisible();
    await expect(page.getByText("City Lights")).toBeVisible();
    await expect(page.getByText("Ocean Sunset")).toBeVisible();
    await expect(page.getByText("Items (medium size)")).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
  });

  test("clicking the Settings button opens the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Item Size")).toBeVisible();
    await expect(page.getByText("Show details")).toBeVisible();
  });

  test("pressing Escape closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("changing Item Size in the dialog updates the text behind it live", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Large" }).click();
    await expect.poll(() => page.getByText("Items (large size)").isVisible()).toBe(true);
  });

  test("the dialog can be opened a second time after closing", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
