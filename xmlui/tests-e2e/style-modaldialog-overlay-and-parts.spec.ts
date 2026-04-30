import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/style-modaldialog-overlay-and-parts.md",
  ),
);

test.describe("ModalDialog overlay and parts theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "ModalDialog overlay and parts theming",
  );

  test("initial state shows the Open dialog button and no dialog content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open dialog" })).toBeVisible();
    await expect(page.getByText("Confirm deletion")).not.toBeVisible();
  });

  test("clicking Open dialog opens the modal with title and body text", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByText("Confirm deletion")).toBeVisible();
    await expect(page.getByText("This action cannot be undone.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("clicking Cancel closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByText("Confirm deletion")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByText("Confirm deletion")).not.toBeVisible();
  });

  test("clicking Delete closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByText("Confirm deletion")).toBeVisible();
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Confirm deletion")).not.toBeVisible();
  });
});
