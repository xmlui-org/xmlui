import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/create-a-custom-color-theme.md"),
);

test.describe("Custom color theme", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Custom color theme");

  test("initial state renders both palette sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Custom warm palette")).toBeVisible();
    await expect(page.getByText("Built-in green variant")).toBeVisible();
  });

  test("warm palette section shows buttons and components", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Solid primary" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Outlined secondary" }).first()).toBeVisible();
    await expect(page.getByText("Active").first()).toBeVisible();
    await expect(page.getByText("Agree to terms")).toBeVisible();
    await expect(page.getByText("Notifications")).toBeVisible();
  });

  test("semantic color labels are visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Success")).toBeVisible();
    await expect(page.getByText("Warning")).toBeVisible();
    await expect(page.getByText("Danger")).toBeVisible();
  });
});
