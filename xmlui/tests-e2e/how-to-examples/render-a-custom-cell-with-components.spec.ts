import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/render-a-custom-cell-with-components.md",
  ),
);

test.describe("Table with rich cell templates", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Table with rich cell templates",
  );

  test("renders all rows with names and roles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Martinez")).toBeVisible();
    await expect(page.getByText("Carol Chen")).toBeVisible();
    await expect(page.getByText("David Kim")).toBeVisible();
    await expect(page.getByText("Senior Developer")).toBeVisible();
  });

  test("shows status badges for each row", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("On Leave", { exact: true })).toBeVisible();
    await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
  });

  test("shows priority badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("high", { exact: true })).toBeVisible();
    await expect(page.getByText("normal", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("low", { exact: true })).toBeVisible();
  });

  test("clicking View button shows the last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "View" }).first().click();
    await expect.poll(() => page.getByText("Viewed Alice Johnson").isVisible()).toBe(true);
  });
});
