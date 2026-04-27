import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/add-a-dropdown-menu-to-a-button.md"),
);

test.describe("Click the button to open the menu", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Click the button to open the menu",
  );

  test("initial state shows the Actions button and no last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Actions" })).toBeVisible();
    await expect(page.getByText("Last action: (none)")).toBeVisible();
  });

  test("clicking Actions opens the menu with all items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "New folder" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Upload file" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Move to trash" })).toBeVisible();
  });

  test("clicking New folder updates last action and closes the menu", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "New folder" }).click();
    await expect(page.getByText("Last action: New folder created")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "New folder" })).not.toBeVisible();
  });

  test("clicking Upload file updates last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Upload file" }).click();
    await expect(page.getByText("Last action: Upload dialog opened")).toBeVisible();
  });

  test("clicking Rename updates last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    await expect(page.getByText("Last action: Rename mode")).toBeVisible();
  });

  test("clicking Move to trash updates last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Move to trash" }).click();
    await expect(page.getByText("Last action: Moved to trash")).toBeVisible();
  });
});
