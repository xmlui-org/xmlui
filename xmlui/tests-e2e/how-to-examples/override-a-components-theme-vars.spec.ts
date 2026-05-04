import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/override-a-components-theme-vars.md"),
);

test.describe("Component-scoped theme overrides", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Component-scoped theme overrides",
  );

  test("initial state renders default and restyled card sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Default Cards")).toBeVisible();
    await expect(page.getByText("Restyled Cards")).toBeVisible();
    await expect(page.getByText("Button with hover override")).toBeVisible();
  });

  test("all card content is visible in both sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$12,400 this month").first()).toBeVisible();
    await expect(page.getByText("3,210 active").first()).toBeVisible();
  });

  test("custom purple button is visible and clickable", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const button = page.getByRole("button", { name: "Custom purple button" });
    await expect(button).toBeVisible();
    await button.click();
    await expect(button).toBeVisible();
  });
});
