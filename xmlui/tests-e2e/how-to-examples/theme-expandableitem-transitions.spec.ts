import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/theme-expandableitem-transitions.md",
  ),
);

test.describe("ExpandableItem snappy animation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "ExpandableItem snappy animation",
  );

  test("initial state shows both summary headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("What is XMLUI?")).toBeVisible();
    await expect(page.getByText("How does theming work?")).toBeVisible();
  });

  test("content is hidden initially", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator('[data-part-id="content"]').first()).not.toBeVisible();
  });

  test("clicking a summary header expands the content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part-id="summary"]').filter({ hasText: "What is XMLUI?" }).click();
    await expect.poll(() =>
      page.locator('[data-part-id="content"]').first().isVisible(),
    ).toBe(true);
  });

  test("clicking an expanded header collapses the content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part-id="summary"]').filter({ hasText: "What is XMLUI?" }).click();
    await expect.poll(() =>
      page.locator('[data-part-id="content"]').first().isVisible(),
    ).toBe(true);
    await page.locator('[data-part-id="summary"]').filter({ hasText: "What is XMLUI?" }).click();
    await expect.poll(() =>
      page.locator('[data-part-id="content"]').first().isVisible(),
    ).toBe(false);
  });
});

test.describe("ExpandableItem relaxed animation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "ExpandableItem relaxed animation",
  );

  test("initial state shows both summary headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("What is XMLUI?")).toBeVisible();
    await expect(page.getByText("How does theming work?")).toBeVisible();
  });

  test("clicking a summary header expands the content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part-id="summary"]').filter({ hasText: "How does theming work?" }).click();
    await expect.poll(() =>
      page.locator('[data-part-id="content"]').nth(1).isVisible(),
    ).toBe(true);
  });
});

test.describe("ExpandableItem no animation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "ExpandableItem no animation",
  );

  test("initial state shows both summary headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("What is XMLUI?")).toBeVisible();
    await expect(page.getByText("How does theming work?")).toBeVisible();
  });

  test("clicking a summary header instantly shows the content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('[data-part-id="summary"]').filter({ hasText: "What is XMLUI?" }).click();
    await expect.poll(() =>
      page.locator('[data-part-id="content"]').first().isVisible(),
    ).toBe(true);
  });
});
