import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/adjust-spacing-globally.md"),
);

test.describe("Default vs compact spacing", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Default vs compact spacing",
  );

  test("initial state renders both default and compact sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Default spacing")).toBeVisible();
    await expect(page.getByText("Compact spacing")).toBeVisible();
  });

  test("both sections show Revenue and Users cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$12,400 this month").first()).toBeVisible();
    await expect(page.getByText("3,210 active").first()).toBeVisible();
    await expect(page.getByText("On track").first()).toBeVisible();
    await expect(page.getByText("Growing").first()).toBeVisible();
  });

  test("View report buttons are visible in both sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "View report" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "View report" }).last()).toBeVisible();
  });
});
