import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/truncate-text-with-expand-on-demand.md",
  ),
);

test.describe("Clamp known-long text and expand on demand", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "clamp-known-long-text-and-expand-on-demand",
  );

  test("starts with the known-long text clamped", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const description = page.getByTestId("description");
    const toggle = page.getByRole("button", { name: "Show more" });
    await expect(description).toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(description).toHaveCSS("-webkit-line-clamp", "4");

    const overflows = await description.evaluate((element) => {
      return element.scrollHeight > element.clientHeight;
    });
    expect(overflows).toBe(true);
    await expect(description).toContainText("anchor windlass needs a new solenoid");
  });

  test("expands and restores the same text without changing its value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const description = page.getByTestId("description");
    const showMore = page.getByRole("button", { name: "Show more" });
    await expect(description).toBeVisible();
    await expect(showMore).toBeVisible();
    const clampedBox = await description.boundingBox();
    expect(clampedBox).not.toBeNull();

    await showMore.click();
    const showLess = page.getByRole("button", { name: "Show less" });
    await expect(showLess).toBeVisible();

    await expect(description).toHaveCSS("-webkit-line-clamp", "none");
    const expandedBox = await description.boundingBox();
    expect(expandedBox).not.toBeNull();
    expect(expandedBox!.height).toBeGreaterThan(clampedBox!.height * 1.5);
    await expect(description).toContainText("anchor windlass needs a new solenoid");

    await showLess.click();
    await expect(showMore).toBeVisible();
    await expect(description).toHaveCSS("-webkit-line-clamp", "4");
    const reClampedBox = await description.boundingBox();
    expect(reClampedBox).not.toBeNull();
    expect(Math.abs(reClampedBox!.height - clampedBox!.height)).toBeLessThan(2);
  });
});

// display-only example — no interaction to test
test.describe("Crop with and without the ellipsis marker", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "crop-with-and-without-the-ellipsis-marker",
  );

  test('ellipses="false" crops without the trailing marker', async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const withEllipsis = page.getByTestId("withEllipsis");
    const withoutEllipsis = page.getByTestId("withoutEllipsis");
    await expect(withEllipsis).toBeVisible();
    await expect(withoutEllipsis).toBeVisible();

    await expect(withEllipsis).toHaveCSS("text-overflow", "ellipsis");
    await expect(withoutEllipsis).toHaveCSS("text-overflow", "clip");

    // Both are actually truncated (content wider than the box) — the
    // difference is only the marker, not whether cropping happened.
    const ellipsisOverflows = await withEllipsis.evaluate((el) => el.scrollWidth > el.clientWidth);
    const clipOverflows = await withoutEllipsis.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(ellipsisOverflows).toBe(true);
    expect(clipOverflows).toBe(true);
  });
});

// display-only example — no interaction to test
test.describe("Single-line rows", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "single-line-rows");

  test("keeps an overflowing row to one line", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const row = page.getByTestId("singleLineRow");
    await expect(row).toBeVisible();
    await expect(row).toHaveCSS("white-space", "nowrap");
    await expect(row).toHaveCSS("text-overflow", "ellipsis");
    expect(await row.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  });
});

// display-only example — no interaction to test
test.describe("Truncate custom Table cell content", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "truncate-custom-table-cell-content",
  );

  test("the longest custom value truncates inside its cell without covering the next column", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const longest = page.getByTestId("cellText-3");
    await expect(longest).toBeVisible();

    // maxLines="1" takes the single-line ellipsis path (white-space: nowrap +
    // text-overflow: ellipsis) rather than the multi-line webkit-line-clamp
    // style, which only applies for maxLines > 1.
    await expect(longest).toHaveCSS("-webkit-line-clamp", "none");
    await expect(longest).toHaveCSS("text-overflow", "ellipsis");

    const overflows = await longest.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflows).toBe(true);

    const dataRow = page.getByRole("row").filter({ has: longest });
    const cells = dataRow.getByRole("cell");
    await expect(cells).toHaveCount(3);
    const nameCell = cells.nth(1);
    const statusCell = cells.nth(2);
    await expect(statusCell).toHaveText("Needs review");

    const table = page.getByRole("table");
    const [tableBox, nameCellBox, textBox, statusCellBox] = await Promise.all([
      table.boundingBox(),
      nameCell.boundingBox(),
      longest.boundingBox(),
      statusCell.boundingBox(),
    ]);
    expect(tableBox).not.toBeNull();
    expect(nameCellBox).not.toBeNull();
    expect(textBox).not.toBeNull();
    expect(statusCellBox).not.toBeNull();
    expect(textBox!.x + textBox!.width).toBeLessThanOrEqual(
      nameCellBox!.x + nameCellBox!.width + 1,
    );
    expect(nameCellBox!.x + nameCellBox!.width).toBeLessThanOrEqual(statusCellBox!.x + 1);
    expect(statusCellBox!.x + statusCellBox!.width).toBeLessThanOrEqual(
      tableBox!.x + tableBox!.width + 1,
    );
  });
});
