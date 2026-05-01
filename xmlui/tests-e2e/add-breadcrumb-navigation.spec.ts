import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/add-breadcrumb-navigation.md"),
);

test.describe("Breadcrumb bar from route segments", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Breadcrumb bar from route segments",
  );

  test("home page shows navigation links and no Home breadcrumb link", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Welcome to the project hub")).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    // Home is the current page so it is plain text, not a link
    await expect(page.getByRole("link", { name: "Home" })).not.toBeVisible();
  });

  test("navigating to Projects shows a Home breadcrumb link", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Projects" }).click();
    await expect(page.getByText("All projects listed here.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    // Projects is the current page so it is plain text, not a link
    await expect(page.getByRole("link", { name: "Projects" })).not.toBeVisible();
  });

  test("navigating to a project slug shows the full breadcrumb trail", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Projects" }).click();
    await page.getByRole("link", { name: "Project Alpha" }).click();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    // The slug "alpha" is the current segment — plain text, not a link
    await expect(page.getByText("alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Project: alpha")).toBeVisible();
  });

  test("navigating to Settings shows the Home breadcrumb link", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByText("Application settings.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  });
});
