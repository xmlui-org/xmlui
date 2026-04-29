import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/create-a-reusable-component.md",
  ),
);

test.describe("TaskCard used in two panels", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "TaskCard used in two panels",
  );

  test("initial state shows both panels with headings", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("My Tasks")).toBeVisible();
    await expect(page.getByText("All Tasks")).toBeVisible();
  });

  test("task cards are visible with titles and assignees", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Write release notes").first()).toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
    await expect(page.getByText("Update dependencies")).toBeVisible();
    await expect(page.getByText("Fix login bug")).toBeVisible();
  });

  test("task cards show due dates", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Due: 2026-04-10").first()).toBeVisible();
    await expect(page.getByText("Due: 2026-04-12").first()).toBeVisible();
    await expect(page.getByText("Due: 2026-04-15")).toBeVisible();
  });
});
