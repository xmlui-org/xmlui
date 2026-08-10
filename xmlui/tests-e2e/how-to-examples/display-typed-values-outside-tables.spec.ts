import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/display-typed-values-outside-tables.md",
  ),
);

test.describe("Display summary values with Value", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "display-summary-values-with-value",
  );

  test("initial state renders typed summary values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator('[data-value-kind="number"]')).toHaveText("$1,299.95");
    await expect(page.locator('[data-value-kind="date"]')).not.toHaveText(
      "2026-08-10T08:30:00Z",
    );
    await expect(page.locator('[data-value-kind="yes-no"]')).toHaveText("No");
    await expect(page.getByRole("link", { name: "billing@example.com" })).toHaveAttribute(
      "href",
      "mailto:billing@example.com",
    );
  });
});

test.describe("Reuse table display types in a detail panel", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "reuse-table-display-types-in-detail-panel",
  );

  test("initial state renders table cells and standalone values with matching formatting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator('[data-column-cell-kind="number"]')).toHaveText("$1,299.95");
    await expect(page.locator('[data-column-cell-kind="enum"]')).toHaveText("Sent to customer");
    await expect(page.locator('[data-value-kind="number"]:not([data-column-cell-kind])')).toHaveText(
      "$1,299.95",
    );
    await expect(page.locator('[data-value-kind="enum"]:not([data-column-cell-kind])')).toHaveText(
      "Sent to customer",
    );
  });
});

test.describe("Display structured and visual values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "display-structured-and-visual-values-with-value",
  );

  test("initial state renders mapped, link, json, and avatar values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator('[data-value-kind="status"]')).toHaveText("Ready for review");
    await expect(page.getByRole("link", { name: "example.com" })).toHaveAttribute(
      "href",
      "https://example.com/docs/value",
    );
    await expect(page.locator('[data-value-kind="json"]')).toHaveText(
      '{"retries":3,"cache":true}',
    );
    await expect(page.getByRole("img", { name: "Project avatar" })).toBeVisible();
  });
});
