import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/highlight-rows-conditionally.md"),
);

test.describe("Conditional row highlighting", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Conditional row highlighting",
  );

  test("renders the table with all tasks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Fix login bug")).toBeVisible();
    await expect(page.getByText("Update docs")).toBeVisible();
    await expect(page.getByText("Redesign dashboard")).toBeVisible();
    await expect(page.getByText("Add dark mode")).toBeVisible();
    await expect(page.getByText("Migrate database")).toBeVisible();
  });

  test("overdue rows show status badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Overdue items have "overdue" badges
    const overdueBadges = page.getByText("overdue", { exact: true });
    await expect(overdueBadges).toHaveCount(2);
  });

  test("at-risk row shows at-risk badge", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("at-risk", { exact: true })).toBeVisible();
  });

  test("on-track rows show on-track badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const onTrackBadges = page.getByText("on-track", { exact: true });
    await expect(onTrackBadges).toHaveCount(2);
  });
});
