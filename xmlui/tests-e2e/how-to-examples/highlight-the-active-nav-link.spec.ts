import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/highlight-the-active-nav-link.md"),
);

test.describe("NavLinks with active indicators", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "NavLinks with active indicators");

  test("initial state shows the Home page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("The Home link uses exact matching")).toBeVisible();
  });

  test("clicking Team nav link navigates to the Team page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Team" }).click();
    await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
    await expect(page.getByText("Team roster.")).toBeVisible();
  });

  test("clicking Settings nav link navigates to the Settings page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("App settings.")).toBeVisible();
  });

  test("clicking Projects nav link navigates to the Projects page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Projects" }).click();
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    await expect(page.getByText("Navigate deeper to see prefix matching in action.")).toBeVisible();
  });

  test("clicking the Project Alpha link navigates to the project slug page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Projects" }).click();
    await page.getByRole("link", { name: "Project Alpha" }).click();
    await expect(page.getByRole("heading", { name: "Project: alpha" })).toBeVisible();
    await expect(page.getByText("The Projects nav link stays active")).toBeVisible();
  });
});
