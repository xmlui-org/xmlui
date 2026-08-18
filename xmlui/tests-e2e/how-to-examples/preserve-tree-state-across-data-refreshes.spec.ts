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

async function scrollToBottom(locator: any) {
  await locator.evaluate((element: HTMLElement) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect
    .poll(() => locator.evaluate((element: HTMLElement) => element.scrollTop))
    .toBeGreaterThan(0);
}

test.describe("Tree refresh after insert, update, and delete", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "tree-refresh-after-insert-update-and-delete",
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

  test("delete refetch removes the deleted node without jumping from the bottom", async ({
    initTestBed,
    page,
  }) => {
    await initExample(initTestBed, page);
    const treeScroller = page.getByTestId("project-tree");
    await scrollToBottom(treeScroller);
    const beforeScrollTop = await treeScroller.evaluate(
      (element: HTMLElement) => element.scrollTop,
    );

    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).toBeVisible();
    await page.getByRole("button", { name: "Delete vendor renewals" }).click();

    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).not.toBeVisible();
    await expect(page.getByText("Deleted Vendor renewals")).toBeVisible();
    const afterScrollTop = await treeScroller.evaluate((element: HTMLElement) => element.scrollTop);
    expect(Math.abs(afterScrollTop - beforeScrollTop)).toBeLessThanOrEqual(1);
  });

  test("insert, update, and delete work sequentially in the same tree", async ({
    initTestBed,
    page,
  }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Insert under Engineering" }).click();
    await expect(page.getByRole("treeitem", { name: /New engineering task 25/ })).toBeVisible();

    await page.getByRole("button", { name: "Update API gateway" }).click();
    await expect(page.getByRole("treeitem", { name: /API gateway v2/ })).toBeVisible();

    await page.getByRole("button", { name: "Delete vendor renewals" }).click();
    await expect(page.getByRole("treeitem", { name: /Vendor renewals/ })).not.toBeVisible();
  });
});

test.describe("List refresh after insert, update, and delete", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "list-refresh-after-insert-update-and-delete",
  );

  async function initExample(initTestBed: any, page: any) {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Ticket 1", { exact: true })).toBeVisible();
  }

  test("initial tickets render", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    await expect(page.getByText("Ready")).toBeVisible();
  });

  test("selection survives a preserved delete refresh", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByText("Ticket 6", { exact: true }).click();
    await expect(page.getByText("Selected tickets: ticket-6")).toBeVisible();

    await page.getByRole("button", { name: "Delete ticket 28" }).click();

    await expect(page.getByText("Ticket 28", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Selected tickets: ticket-6")).toBeVisible();
  });

  test("insert scrolls the new ticket into view", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    await expect(page.getByText("New ticket 31", { exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Insert ticket" }).click();

    await expect(page.getByText("New ticket 31", { exact: true })).toBeVisible();
    await expect(page.getByText("Inserted New ticket 31")).toBeVisible();
  });

  test("update uses an explicit scroll target", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Update ticket 18" }).click();

    await expect(page.getByText("Ticket 18 rev 2", { exact: true })).toBeVisible();
    await expect(page.getByText("Updated Ticket 18 rev 2 and kept it in view")).toBeVisible();
  });

  test("delete preserves bottom scroll position", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    const listScroller = page.getByTestId("ticket-list");
    await scrollToBottom(listScroller);
    const beforeScrollTop = await listScroller.evaluate(
      (element: HTMLElement) => element.scrollTop,
    );

    await page.getByRole("button", { name: "Delete ticket 28" }).click();

    await expect(page.getByText("Ticket 28", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Deleted Ticket 28")).toBeVisible();
    const afterScrollTop = await listScroller.evaluate((element: HTMLElement) => element.scrollTop);
    expect(Math.abs(afterScrollTop - beforeScrollTop)).toBeLessThanOrEqual(1);
  });

  test("insert, update, and delete work sequentially in the same list", async ({
    initTestBed,
    page,
  }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Insert ticket" }).click();
    await expect(page.getByText("New ticket 31", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Update ticket 18" }).click();
    await expect(page.getByText("Ticket 18 rev 2", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Delete ticket 28" }).click();
    await expect(page.getByText("Ticket 28", { exact: true })).not.toBeVisible();
  });
});

test.describe("Table refresh after insert, update, and delete", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "table-refresh-after-insert-update-and-delete",
  );

  async function initExample(initTestBed: any, page: any) {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("cell", { name: "Order 1", exact: true })).toBeVisible();
  }

  test("initial orders render", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    await expect(page.getByText("Selected orders: (none)", { exact: true })).toBeVisible();
  });

  test("selection survives a preserved delete refresh", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("cell", { name: "Order 6", exact: true }).click();
    await expect(page.getByText("Selected orders: order-6")).toBeVisible();

    await page.getByRole("button", { name: "Delete order 18" }).click();

    await expect(page.getByRole("cell", { name: "Order 18", exact: true })).not.toBeVisible();
    await expect(page.getByText("Selected orders: order-6")).toBeVisible();
  });

  test("insert scrolls the new order into view", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    await expect(page.getByRole("cell", { name: "New order 25", exact: true })).not.toBeVisible();

    await page.getByRole("button", { name: "Insert order" }).click();

    await expect(page.getByRole("cell", { name: "New order 25", exact: true })).toBeVisible();
    await expect(page.getByText("Inserted New order 25")).toBeVisible();
  });

  test("update uses an explicit scroll target", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Update order 16" }).click();

    await expect(page.getByRole("cell", { name: "Order 16 rev 2", exact: true })).toBeVisible();
    await expect(page.getByText("Updated Order 16 rev 2 and kept it in view")).toBeVisible();
  });

  test("delete preserves bottom scroll position", async ({ initTestBed, page }) => {
    await initExample(initTestBed, page);
    const tableScroller = page.getByTestId("order-table");
    await scrollToBottom(tableScroller);
    const beforeScrollTop = await tableScroller.evaluate(
      (element: HTMLElement) => element.scrollTop,
    );

    await page.getByRole("button", { name: "Delete order 18" }).click();

    await expect(page.getByRole("cell", { name: "Order 18", exact: true })).not.toBeVisible();
    await expect(page.getByText("Deleted Order 18")).toBeVisible();
    const afterScrollTop = await tableScroller.evaluate(
      (element: HTMLElement) => element.scrollTop,
    );
    expect(Math.abs(afterScrollTop - beforeScrollTop)).toBeLessThanOrEqual(1);
  });

  test("insert, update, and delete work sequentially in the same table", async ({
    initTestBed,
    page,
  }) => {
    await initExample(initTestBed, page);

    await page.getByRole("button", { name: "Insert order" }).click();
    await expect(page.getByRole("cell", { name: "New order 25", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Update order 16" }).click();
    await expect(page.getByText("Updated Order 16 rev 2 and kept it in view")).toBeVisible();

    await page.getByRole("button", { name: "Delete order 18" }).click();
    await expect(page.getByRole("cell", { name: "Order 18", exact: true })).not.toBeVisible();
  });
});
