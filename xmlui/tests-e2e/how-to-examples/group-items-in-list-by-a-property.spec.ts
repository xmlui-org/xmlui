import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/group-items-in-list-by-a-property.md"),
);

test.describe("Employee list grouped by department", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Employee list grouped by department",
  );

  test("initial state renders employees grouped by department with counts and footers", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Engineering", { exact: true })).toBeVisible();
    await expect(page.getByText("Design", { exact: true })).toBeVisible();
    await expect(page.getByText("Marketing", { exact: true })).toBeVisible();

    await expect(page.getByText("3", { exact: true })).toBeVisible();
    await expect(page.getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByText("1", { exact: true })).toBeVisible();

    await expect(page.getByText("3 team members", { exact: true })).toBeVisible();
    await expect(page.getByText("2 team members", { exact: true })).toBeVisible();
    await expect(page.getByText("1 team members", { exact: true })).toBeVisible();

    await expect(page.getByText("Alice Chen", { exact: true })).toBeVisible();
    await expect(page.getByText("Dave Lee", { exact: true })).toBeVisible();
    await expect(page.getByText("Carol Kim", { exact: true })).toBeVisible();
    await expect(page.getByText("Frank Brown", { exact: true })).toBeVisible();
  });
});
