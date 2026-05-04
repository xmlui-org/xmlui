import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";
import { SKIP_REASON } from "../../src/testing/component-test-helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/toggle-multiple-items-with-shared-state.md",
  ),
);

test.describe("Toggle categories to filter articles", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Toggle categories to filter articles",
  );

  test("initial state shows all 12 articles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await expect(page.getByText("12 of 12 shown")).toBeVisible();
  });

  test("unchecking Technology hides Technology articles and updates count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("checkbox").nth(0).click();
    await expect(page.getByText("8 of 12 shown")).toBeVisible();
    await expect(page.getByText("Understanding React Hooks")).not.toBeVisible();
  });

  test.fixme(
    "re-checking Technology restores its articles",
    SKIP_REASON.TEST_NOT_WORKING(
      "Re-checking works on website but for some reason, it fails to wait for the articles to be visible",
    ),
    async ({ initTestBed, page }) => {
      await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
      await page.getByRole("checkbox").nth(0).click();
      await expect(page.getByText("8 of 12 shown")).toBeVisible();
      await page.getByRole("checkbox").nth(0).click();
      await expect(page.getByText("12 of 12 shown")).toBeVisible();
      await expect(page.getByText("Understanding React Hooks")).toBeAttached();
    },
  );

  test("unchecking two categories cumulates the filter", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("checkbox").nth(0).click();
    await page.getByRole("checkbox").nth(1).click();
    await expect(page.getByText("5 of 12 shown")).toBeVisible();
  });
});
