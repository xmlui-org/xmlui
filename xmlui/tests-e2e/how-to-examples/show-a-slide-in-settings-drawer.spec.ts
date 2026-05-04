import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/show-a-slide-in-settings-drawer.md"),
);

test.describe("Settings drawer", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Settings drawer");

  test("initial state shows the dashboard content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("$42,500")).toBeVisible();
    await expect(page.getByText("1,284")).toBeVisible();
    await expect(page.getByText("No new activity today.")).toBeVisible();
  });

  test("drawer is closed initially", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Enable notifications")).not.toBeVisible();
  });

  test("clicking Settings button opens the drawer", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect.poll(() => page.getByText("Enable notifications").isVisible()).toBe(true);
    await expect(page.getByText("Dark mode")).toBeVisible();
    await expect(page.getByText("Compact layout")).toBeVisible();
  });

  test("clicking Save button closes the drawer", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect.poll(() => page.getByRole("button", { name: "Save" }).isVisible()).toBe(true);
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(() => page.getByText("Enable notifications").isVisible()).toBe(false);
  });

  test("drawer contains Language select and checkboxes", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect.poll(() => page.getByText("Language").isVisible()).toBe(true);
    await expect(page.getByText("Dark mode")).toBeVisible();
    await expect(page.getByText("Compact layout")).toBeVisible();
  });
});
