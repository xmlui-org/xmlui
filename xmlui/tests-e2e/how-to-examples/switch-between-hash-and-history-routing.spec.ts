import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/switch-between-hash-and-history-routing.md"),
);

test.describe("Hash vs history routing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Hash vs history routing");

  test("initial state shows the Home page with path text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Current path:")).toBeVisible();
    await expect(page.getByText("with history routing it is just /")).toBeVisible();
  });

  test("clicking Team nav link navigates to the Team page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Team" }).click();
    await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
    await expect(page.getByText("Current path:")).toBeVisible();
  });

  test("clicking Settings nav link navigates to the Settings page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("Current path:")).toBeVisible();
  });
});
