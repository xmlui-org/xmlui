import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/pin-columns-in-a-wide-table.md"),
);

test.describe("Pinned columns in a wide table", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Pinned columns in a wide table",
  );

  test("renders all employee rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Martinez")).toBeVisible();
    await expect(page.getByText("Carol Chen")).toBeVisible();
    await expect(page.getByText("David Kim")).toBeVisible();
    await expect(page.getByText("Eva Novak")).toBeVisible();
  });

  test("shows all column headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "ID" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Department" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Role" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("shows status badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("On Leave", { exact: true })).toBeVisible();
  });

  test("salary values are formatted", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$95,000")).toBeVisible();
  });
});
