import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/build-a-fullscreen-modal-dialog.md"),
);

test.describe("Fullscreen project details dialog", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Fullscreen project details dialog",
  );

  test("initial state shows project list with Details buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Projects")).toBeVisible();
    await expect(page.getByText("Website Redesign")).toBeVisible();
    await expect(page.getByText("Mobile App v2")).toBeVisible();
    await expect(page.getByText("API Migration")).toBeVisible();
    await expect(page.getByRole("button", { name: "Details" }).first()).toBeVisible();
  });

  test("clicking Details opens dialog with project information", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).first().click();
    await expect(page.getByText("Sarah Chen")).toBeVisible();
    await expect(page.getByText("active").first()).toBeVisible();
    await expect(page.getByText("Close", { exact: true })).toBeVisible();
  });

  test("clicking Close button dismisses the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Details" }).first().click();
    await expect(page.getByText("Close", { exact: true })).toBeVisible();
    await page.getByText("Close", { exact: true }).click();
    await expect(page.getByText("Sarah Chen")).not.toBeVisible();
  });
});
