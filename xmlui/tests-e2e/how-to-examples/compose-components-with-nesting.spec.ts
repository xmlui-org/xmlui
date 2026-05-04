import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/compose-components-with-nesting.md",
  ),
);

test.describe("Kanban board built from composed components", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Kanban board built from composed components",
  );

  test("initial state shows three Kanban columns", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("To Do")).toBeVisible();
    await expect(page.getByText("In Progress")).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
  });

  test("each column shows the correct task count badge", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // All three columns have 2 tasks each → three "2" badges
    await expect(page.getByText("2").first()).toBeVisible();
  });

  test("task cards are visible across all columns", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Design mockup")).toBeVisible();
    await expect(page.getByText("Write release notes")).toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
    await expect(page.getByText("Update dependencies")).toBeVisible();
    await expect(page.getByText("Fix login bug")).toBeVisible();
    await expect(page.getByText("Add dark mode")).toBeVisible();
  });
});
