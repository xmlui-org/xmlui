/**
 * Table Cell Text Overflow E2E Tests (Issue #2936)
 *
 * Verifies that long text inside table cells with custom column templates
 * (Link > HStack > Text) correctly respects width constraints and text
 * overflow modes. The layout-context fix ensures min-width: 0 and
 * flex-shrink: 1 propagate through intermediate flex containers inside
 * TableCell so that Text overflow CSS actually takes effect.
 */

import { expect, test } from "../../testing/fixtures";

const longTextData = JSON.stringify([
  { id: 1, name: "Short" },
  {
    id: 2,
    name: "A moderately long name that should be truncated with ellipsis",
  },
  {
    id: 3,
    name: "Another very long name that definitely overflows the column when not truncated properly",
  },
  {
    id: 4,
    name: "Extra extremely verbose item name to stress-test the ellipsis truncation behavior in a constrained table cell",
  },
]);

// =============================================================================
// FLOW MODE — Link > HStack > Text with overflowMode="flow"
// =============================================================================

test.describe("Table cell text overflow — flow mode", () => {
  test("text wraps within the column width (Link > HStack > Text)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" overflowMode="flow" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Every text element must stay within the table's 400px width.
    // scrollWidth > clientWidth would mean the text overflows its container.
    const overflowingTexts = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.filter((el) => el.scrollWidth > el.clientWidth).length,
    );
    expect(overflowingTexts).toBe(0);
  });

  test("long text wraps to multiple lines in flow mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" overflowMode="flow" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    // The longest text (row 4) should occupy more height than the short text
    // (row 1), confirming that wrapping actually happens.
    const heights = await page.getByTestId("cell-text").evaluateAll(
      (elements) => elements.map((el) => el.getBoundingClientRect().height),
    );

    // Row 1 ("Short") should be single-line
    // Row 4 (very long) should be taller — meaning the text wrapped
    expect(heights[3]).toBeGreaterThan(heights[0]);
  });

  test("text does not overflow beyond the table boundary", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" overflowMode="flow" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    const tableBox = await page.getByTestId("table").boundingBox();
    expect(tableBox).not.toBeNull();

    const textBoxes = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return { right: rect.right };
        }),
    );

    // No text element should extend past the table's right edge
    for (const box of textBoxes) {
      expect(box.right).toBeLessThanOrEqual(tableBox!.x + tableBox!.width + 1);
    }
  });
});

// =============================================================================
// ELLIPSIS MODE — Link > HStack > Text with maxLines="1"
// =============================================================================

test.describe("Table cell text overflow — ellipsis mode (maxLines=1)", () => {
  test("long text is truncated to a single line", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" maxLines="1" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // All text elements should have the same height (single line),
    // regardless of content length.
    const heights = await page.getByTestId("cell-text").evaluateAll(
      (elements) => elements.map((el) => el.getBoundingClientRect().height),
    );

    // All rows should have the same single-line height
    const firstHeight = heights[0];
    for (const h of heights) {
      expect(h).toBeCloseTo(firstHeight, 0);
    }
  });

  test("truncated text has text-overflow: ellipsis", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" maxLines="1" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    // The long text cells (rows 2-4) should have text-overflow: ellipsis
    // applied via the truncateOverflow CSS class.
    const textOverflows = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.map((el) => {
          // The truncation is on a child span, not necessarily the testId element itself
          const target = el.querySelector("[class*='truncate']") || el;
          return window.getComputedStyle(target).textOverflow;
        }),
    );

    // At least the long rows should have ellipsis
    expect(textOverflows[1]).toBe("ellipsis");
    expect(textOverflows[2]).toBe("ellipsis");
    expect(textOverflows[3]).toBe("ellipsis");
  });

  test("text does not overflow beyond the table boundary", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" maxLines="1" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    const tableBox = await page.getByTestId("table").boundingBox();
    expect(tableBox).not.toBeNull();

    const textBoxes = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return { right: rect.right };
        }),
    );

    // No text element should extend past the table's right edge
    for (const box of textBoxes) {
      expect(box.right).toBeLessThanOrEqual(tableBox!.x + tableBox!.width + 1);
    }
  });

  test("short text is not truncated", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="trash" size="20px" />
              <Text value="{$cell}" maxLines="1" testId="cell-text" />
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    // Row 1 ("Short") should NOT be truncated — its scrollWidth should
    // equal its clientWidth.
    const firstText = page.getByTestId("cell-text").first();
    const isTruncated = await firstText.evaluate(
      (el) => el.scrollWidth > el.clientWidth,
    );
    expect(isTruncated).toBe(false);
  });
});

// =============================================================================
// NESTING DEPTH VARIANTS — verify fix works at different nesting levels
// =============================================================================

test.describe("Table cell text overflow — nesting variants", () => {
  test("HStack > Text (no Link wrapper) truncates correctly", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <HStack gap="8px" verticalAlignment="center">
            <Icon name="star" size="20px" />
            <Text value="{$cell}" maxLines="1" testId="cell-text" />
          </HStack>
        </Column>
      </Table>
    `);

    // All text elements should be single-line
    const heights = await page.getByTestId("cell-text").evaluateAll(
      (elements) => elements.map((el) => el.getBoundingClientRect().height),
    );
    for (const h of heights) {
      expect(h).toBeCloseTo(heights[0], 0);
    }

    // Long text should not overflow the table
    const tableBox = await page.getByTestId("table").boundingBox();
    const textBoxes = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.map((el) => el.getBoundingClientRect().right),
    );
    for (const right of textBoxes) {
      expect(right).toBeLessThanOrEqual(tableBox!.x + tableBox!.width + 1);
    }
  });

  test("Link > HStack > VStack > Text (deep nesting) truncates correctly", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${longTextData}}' width="400px" testId="table">
        <Column header="ID" width="60px" bindTo="id" />
        <Column header="Name" width="2*" bindTo="name">
          <Link to="/">
            <HStack gap="8px" verticalAlignment="center">
              <Icon name="info" size="20px" />
              <VStack>
                <Text value="{$cell}" maxLines="1" testId="cell-text" />
              </VStack>
            </HStack>
          </Link>
        </Column>
      </Table>
    `);

    // All text elements should be single-line
    const heights = await page.getByTestId("cell-text").evaluateAll(
      (elements) => elements.map((el) => el.getBoundingClientRect().height),
    );
    for (const h of heights) {
      expect(h).toBeCloseTo(heights[0], 0);
    }

    // Long text should not overflow the table
    const tableBox = await page.getByTestId("table").boundingBox();
    const textBoxes = await page.getByTestId("cell-text").evaluateAll(
      (elements) =>
        elements.map((el) => el.getBoundingClientRect().right),
    );
    for (const right of textBoxes) {
      expect(right).toBeLessThanOrEqual(tableBox!.x + tableBox!.width + 1);
    }
  });
});
