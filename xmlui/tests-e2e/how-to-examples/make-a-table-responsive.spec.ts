import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/make-a-table-responsive.md",
  ),
);

test.describe("Make a Table responsive", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Make a Table responsive");

  test("at wide viewport all columns are visible", async ({ initTestBed, page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Department" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Salary" })).toBeVisible();
  });

  test("at medium viewport (800px) Salary column is hidden", async ({ initTestBed, page }) => {
    await page.setViewportSize({ width: 800, height: 800 });
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Department" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Salary" })).not.toBeVisible();
  });

  test("at sm viewport (600px) only Name and Email columns are visible", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 });
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Department" })).not.toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).not.toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Salary" })).not.toBeVisible();
  });

  test("at extra-small viewport (300px) only Name column is visible", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 300, height: 800 });
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).not.toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Salary" })).not.toBeVisible();
  });

  test("all five people are always shown in the Name column", async ({ initTestBed, page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).toBeVisible();
    await expect(page.getByText("Carol Davis")).toBeVisible();
  });
});
