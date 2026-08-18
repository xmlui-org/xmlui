import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/preserve-tree-state-across-data-refreshes.md",
  ),
);

test.describe("Tree refresh after insert, update, and delete", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Tree refresh after insert, update, and delete",
  );

  async function initExample(initTestBed: any, page: any) {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("treeitem", { name: /Acme Workspace/ })).toBeVisible();
  }

  test("insert refetch adds and selects the new node", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Insert under Engineering" }).click();

    const inserted = page.getByRole("treeitem", { name: /New engineering task 25/ });
    await expect(inserted).toBeVisible();
    await expect(inserted).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Inserted New engineering task 25")).toBeVisible();
  });

  test("update refetch keeps the updated node visible", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Update API gateway" }).click();

    const updated = page.getByRole("treeitem", { name: /API gateway v2/ });
    await expect(updated).toBeVisible();
    await expect(page.getByText("Updated API gateway v2 and kept it in view")).toBeVisible();
  });

  test("delete refetch removes the deleted node", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    const treeScroller = page.getByRole("tree", { name: "Tree navigation" });
    await treeScroller.evaluate((element) => {
      const scroller = element as HTMLElement;
      scroller.scrollTop = scroller.scrollHeight;
    });
    await page.waitForTimeout(50);
    const beforeScrollTop = await treeScroller.evaluate(
      (element) => (element as HTMLElement).scrollTop,
    );

    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).toBeVisible();

    await page.getByRole("button", { name: "Delete vendor renewals" }).click();

    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).not.toBeVisible();
    await expect(page.getByText("Deleted Vendor renewals")).toBeVisible();
    const afterScrollTop = await treeScroller.evaluate(
      (element) => (element as HTMLElement).scrollTop,
    );
    expect(Math.abs(afterScrollTop - beforeScrollTop)).toBeLessThanOrEqual(1);
  });

  test("multiple operations refresh the same running tree", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Insert under Engineering" }).click();
    await expect(page.getByRole("treeitem", { name: /New engineering task 25/ })).toBeVisible();

    await page.getByRole("button", { name: "Update API gateway" }).click();
    await expect(page.getByRole("treeitem", { name: /API gateway v2/ })).toBeVisible();

    await page.getByRole("button", { name: "Delete vendor renewals" }).click();
    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).not.toBeVisible();
  });
});
