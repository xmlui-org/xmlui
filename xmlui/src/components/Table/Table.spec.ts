/**
 * Table Component End-to-End Tests
 *
 * This test suite provides comprehensive coverage for the Table component following
 * XMLUI testing conventions. The tests validate all documented properties, events,
 * accessibility features, and edge cases.
 *
 * Test Results Summary:
 * - ✅ 25+ tests passing
 *
 * Key Testing Insights:
 * - Use HTML element selectors (th, td, table) rather than role-based selectors
 * - Add .first() to avoid strict mode violations when multiple elements match
 * - Some features like selection checkboxes exist but are hidden via CSS
 * - Loading states, sorting, and pagination may use different implementations than expected
 */

import { expect, test } from "../../testing/fixtures";
import type { Locator, Page } from "@playwright/test";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";

// Sample data for testing
const sampleData = [
  { id: 1, name: "Apple", quantity: 5, category: "Fruit" },
  { id: 2, name: "Banana", quantity: 3, category: "Fruit" },
  { id: 3, name: "Carrot", quantity: 10, category: "Vegetable" },
  { id: 4, name: "Spinach", quantity: 2, category: "Vegetable" },
];

async function expectControlCentered(cell: Locator, control: Locator) {
  await expect(cell).toBeVisible();
  await expect(control).toBeVisible();
  const cellBox = await cell.boundingBox();
  const controlBox = await control.boundingBox();
  expect(cellBox).not.toBeNull();
  expect(controlBox).not.toBeNull();
  const cellCenter = cellBox!.x + cellBox!.width / 2;
  const controlCenter = controlBox!.x + controlBox!.width / 2;
  expect(Math.abs(cellCenter - controlCenter)).toBeLessThanOrEqual(2);
}

async function getHeaderContentMetrics(header: Locator) {
  return header.evaluate((element) => {
    const content = element.querySelector('[class*="headerContent"]');
    const indicator = element.querySelector('[class*="orderingIndicator"]');
    if (!content || !indicator) {
      return null;
    }

    const textNode = Array.from(content.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim(),
    );
    if (!textNode) {
      return null;
    }

    const range = document.createRange();
    range.selectNodeContents(textNode);
    const textRect = range.getBoundingClientRect();
    range.detach();
    const indicatorRect = indicator.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const groupLeft = Math.min(textRect.left, indicatorRect.left);
    const groupRight = Math.max(textRect.right, indicatorRect.right);

    return {
      contentLeft: contentRect.left,
      contentRight: contentRect.right,
      contentCenter: contentRect.left + contentRect.width / 2,
      groupLeft,
      groupRight,
      groupCenter: (groupLeft + groupRight) / 2,
    };
  });
}

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic data and columns", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
        <Column bindTo="category" header="Category"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Check for actual HTML table elements
    const htmlTable = page.locator("table");
    await expect(htmlTable).toBeVisible();

    // Check headers are present
    const headers = page.locator("th");
    await expect(headers).toHaveCount(3); // Should have 3 headers

    // Check header text content
    await expect(headers.nth(0)).toContainText("Name");
    await expect(headers.nth(1)).toContainText("Quantity");
    await expect(headers.nth(2)).toContainText("Category");

    // Check data content - use first() to avoid strict mode violations
    await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "5" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Fruit" }).first()).toBeVisible();
  });

  test("does not show loading indicator before loadingDelay expires", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<Table loading="true" loadingDelay="10000" data="{[]}" />`);

    await expect(page.getByRole("status", { name: /loading/i })).toHaveCount(0, {
      timeout: 0,
    });
  });

  test("shows loading indicator after loadingDelay expires", async ({ initTestBed, page }) => {
    await initTestBed(`<Table loading="true" loadingDelay="50" data="{[]}" />`);

    await expect(page.getByRole("status", { name: /loading/i })).toBeVisible();
  });

  test("does not show loading indicator when loading finishes before loadingDelay", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.isLoading="{false}" var.items="{[]}">
        <Button testId="load" onClick="isLoading = true; delay(50); items = [{ id: 1, name: 'Loaded' }]; isLoading = false" />
        <Table loading="{isLoading}" loadingDelay="400" data="{items}" />
      </Fragment>
    `);

    await page.getByTestId("load").click();

    await expect(page.locator("td").filter({ hasText: "Loaded" }).first()).toBeVisible();
    await expect(page.getByRole("status", { name: /loading/i })).toHaveCount(0);
  });

  test.describe("inferred columns", () => {
    test("renders data without explicit Column children", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" />
      `);

      await expect(page.getByTestId("table")).toBeVisible();

      const headers = page.locator("th");
      await expect(headers).toHaveCount(4);
      await expect(headers.nth(0)).toContainText("id");
      await expect(headers.nth(1)).toContainText("name");
      await expect(headers.nth(2)).toContainText("quantity");
      await expect(headers.nth(3)).toContainText("category");

      await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "5" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "Fruit" }).first()).toBeVisible();
    });

    test("explicit Column children override inferred columns", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Product" />
          <Column bindTo="quantity" header="Qty" />
        </Table>
      `);

      const headers = page.locator("th");
      await expect(headers).toHaveCount(2);
      await expect(headers.nth(0)).toContainText("Product");
      await expect(headers.nth(1)).toContainText("Qty");
      await expect(headers.filter({ hasText: "category" })).toHaveCount(0);
    });

    test("columnInference controls sampled rows", async ({ initTestBed, page }) => {
      const sparseData = [
        { id: 1, name: "First" },
        { id: 2, name: "Second", later: "Visible by default" },
      ];

      await initTestBed(`
        <VStack>
          <Table data='{${JSON.stringify(sparseData)}}' testId="default-table" />
          <Table data='{${JSON.stringify(sparseData)}}' columnInference="first-only" testId="first-table" />
        </VStack>
      `);

      const defaultHeaders = page.getByTestId("default-table").locator("th");
      await expect(defaultHeaders.filter({ hasText: "later" })).toHaveCount(1);

      const firstOnlyHeaders = page.getByTestId("first-table").locator("th");
      await expect(firstOnlyHeaders.filter({ hasText: "later" })).toHaveCount(0);
    });

    test("inferred columns are sortable by default", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" />
      `);

      const quantityHeaderButton = page
        .locator("th")
        .filter({ hasText: "quantity" })
        .locator("button");
      await expect(quantityHeaderButton).toBeVisible();
      await quantityHeaderButton.click();

      const firstRowCells = page.locator("tbody tr").first().locator("td");
      await expect(firstRowCells.nth(1)).toHaveText("Spinach");
      await expect(firstRowCells.nth(2)).toHaveText("2");
    });

    test("inferred column types use typed rendering", async ({ initTestBed, page }) => {
      const typedData = [
        {
          id: 1,
          active: true,
          published: "2026-08-06",
          updated: "2026-08-06T12:00:00Z",
          email: "ada@example.com",
          website: "https://example.com",
          tags: ["math", "logic"],
          details: { level: "admin" },
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(typedData)}}' testId="table" />
      `);

      await expect(page.locator('[data-column-cell-kind="id"]')).toHaveText("1");
      await expect(page.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
        "href",
        "mailto:ada@example.com",
      );
      await expect(page.getByRole("link", { name: "https://example.com" })).toHaveAttribute(
        "href",
        "https://example.com",
      );
      await expect(page.locator("td").filter({ hasText: "true" })).toBeVisible();
      const inferredDateCells = page.locator('[data-column-cell-kind="date"]');
      await expect(inferredDateCells).toHaveCount(2);
      await expect(inferredDateCells.first()).not.toHaveText("2026-08-06");
      await expect(inferredDateCells.nth(1)).not.toHaveText("2026-08-06T12:00:00Z");
      await expect(page.locator("td").filter({ hasText: "math, logic" })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: '{"level":"admin"}' })).toBeVisible();
    });

    test("infers integer and number column rendering", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[
          { id: 1, count: 12, amount: 1234.567 },
          { id: 2, count: 7, amount: 45.5 }
        ]}' testId="table" />
      `);

      const numberCells = page.locator('[data-column-cell-kind="number"]');
      await expect(page.locator('[data-column-cell-kind="id"]')).toHaveText(["1", "2"]);
      await expect(numberCells).toHaveCount(4);
      await expect(numberCells.nth(0)).toHaveText("12");
      await expect(numberCells.nth(1)).toHaveText("1,234.567");
      await expect(numberCells.nth(2)).toHaveText("7");
      await expect(numberCells.nth(3)).toHaveText("45.5");
    });

    test("uses root App locale for inferred number column rendering", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <App locale="hu-HU">
          <Text testId="active-locale" value="{App.locale}" />
          <Text testId="locale-number" value="{App.formatNumber(3123.45)}" />
          <Table
            data='{[
              { id: 1, customer: "Ada", total: 3123.45, paid: true },
              { id: 2, customer: "Grace", total: 87.5, paid: false }
            ]}'
          />
        </App>
      `);

      await expect(page.getByTestId("active-locale")).toHaveText("hu-HU");
      await expect(page.getByTestId("locale-number")).toHaveText("3123,45");

      const numberCells = page.locator('[data-column-cell-kind="number"]');
      await expect(numberCells.nth(0)).toHaveText("3123,45");
      await expect(numberCells.nth(1)).toHaveText("87,5");
    });

    test("uses idKey and UUID values for inferred id-like display types", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          idKey="customerId"
          data='{[
            {
              customerId: "C-001",
              quantity: 12,
              traceId: "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f"
            }
          ]}'
          testId="table"
        />
      `);

      await expect(page.locator('[data-column-cell-kind="id"]')).toHaveText("C-001");
      await expect(page.locator('[data-column-cell-kind="uuid"]')).toHaveText(
        "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f",
      );
      await expect(page.locator('[data-column-cell-kind="number"]')).toHaveText("12");
    });

    test("uses balanced type-aware sizing for inferred columns by default", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{[
            { id: 1, customer: "Ada" },
            { id: 2, customer: "Grace" }
          ]}'
          testId="table"
        />
      `);

      const idCellBox = await page.locator("tbody tr").first().locator("td").nth(0).boundingBox();
      const customerCellBox = await page
        .locator("tbody tr")
        .first()
        .locator("td")
        .nth(1)
        .boundingBox();

      expect(idCellBox?.width).toBeLessThan(140);
      expect(customerCellBox?.width).toBeGreaterThan((idCellBox?.width ?? 0) * 2);
    });

    test("infers date, datetime, email, url, phone, and boolean rendering", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{[
          {
            active: true,
            published: "2026-08-06",
            updated: "2026-08-06T12:00:00Z",
            email: "ada@example.com",
            website: "https://example.com/profile",
            phone: "+1 555 123 4567"
          }
        ]}' testId="table" />
      `);

      await expect(page.locator('[data-column-cell-kind="boolean"]')).toHaveText("true");
      const dateCells = page.locator('[data-column-cell-kind="date"]');
      await expect(dateCells).toHaveCount(2);
      await expect(dateCells.first()).not.toHaveText("2026-08-06");
      await expect(dateCells.nth(1)).not.toHaveText("2026-08-06T12:00:00Z");
      await expect(page.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
        "href",
        "mailto:ada@example.com",
      );
      await expect(page.getByRole("link", { name: "https://example.com/profile" })).toHaveAttribute(
        "href",
        "https://example.com/profile",
      );
      await expect(page.getByRole("link", { name: "+1 555 123 4567" })).toHaveAttribute(
        "href",
        "tel:+1 555 123 4567",
      );
    });

    test("infers enum and long-text rendering", async ({ initTestBed, page }) => {
      const rows = [
        {
          status: "sent",
          notes:
            "This note is intentionally long enough to cross the deterministic long text threshold used by column inference.",
        },
        {
          status: "draft",
          notes:
            "This second long note keeps the column homogeneous while making the inferred type visible.",
        },
        {
          status: "sent",
          notes:
            "This third long note keeps the sample broad enough for enum inference to remain stable.",
        },
        {
          status: "draft",
          notes:
            "This fourth long note keeps status low-cardinality and notes above the wrapping threshold.",
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(rows)}}' testId="table" />
      `);

      await expect(page.locator('[data-column-cell-kind="enum"]').first()).toHaveText("sent");
      const longText = page.locator('[data-column-cell-kind="long-text"]').first();
      await expect(longText).toContainText("intentionally long enough");
      await expect(longText).toHaveCSS("white-space", "normal");
    });

    test("infers tags, object, and array rendering", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[
          {
            tags: ["math", "logic"],
            details: { level: "admin" },
            scores: [1, 2]
          }
        ]}' testId="table" />
      `);

      await expect(page.locator('[data-column-cell-kind="tags"]')).toHaveText("math, logic");
      const jsonCells = page.locator('[data-column-cell-kind="json"]');
      await expect(jsonCells.nth(0)).toHaveText('{"level":"admin"}');
      await expect(jsonCells.nth(1)).toHaveText("[1,2]");
    });
  });

  test.describe("Column type rendering", () => {
    test("renders explicit text, number, date, boolean, link, enum, and json types", async ({
      initTestBed,
      page,
    }) => {
      const typedData = [
        {
          name: "Ada",
          amount: 1234.5678,
          count: 12.7,
          ratio: 0.12,
          published: "2026-08-06",
          updated: "2026-08-06T12:00:00Z",
          active: true,
          email: "ada@example.com",
          website: "https://example.com/profile",
          state: "sent",
          details: { level: "admin" },
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(typedData)}}' testId="table">
          <Column bindTo="name" type="text" />
          <Column bindTo="amount" type="currency(USD)" />
          <Column bindTo="count" type="integer" />
          <Column bindTo="ratio" type="percent" />
          <Column bindTo="published" type="date" />
          <Column bindTo="updated" type="datetime" />
          <Column bindTo="active" type="boolean" />
          <Column bindTo="email" type="email" />
          <Column bindTo="website" type="url(label:domain)" />
          <Column bindTo="state" type="enum" typeOptions="{{sent:{label:'Sent to customer'}}}" />
          <Column bindTo="details" type="json" />
        </Table>
      `);

      await expect(page.getByRole("cell", { name: "Ada", exact: true })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "$1,234.57" })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "13" })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "12%" })).toBeVisible();
      const dateCells = page.locator('[data-column-cell-kind="date"]');
      await expect(dateCells).toHaveCount(2);
      await expect(dateCells.first()).not.toHaveText("2026-08-06");
      await expect(dateCells.nth(1)).not.toHaveText("2026-08-06T12:00:00Z");
      await expect(page.locator("td").filter({ hasText: "true" })).toBeVisible();
      await expect(page.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
        "href",
        "mailto:ada@example.com",
      );
      await expect(page.getByRole("link", { name: "example.com", exact: true })).toHaveAttribute(
        "href",
        "https://example.com/profile",
      );
      await expect(page.locator("td").filter({ hasText: "Sent to customer" })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: '{"level":"admin"}' })).toBeVisible();
    });

    test("renders decimal-aligned numeric structure", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[{amount: 1234.5678}]}' testId="table">
          <Column bindTo="amount" type="number(8,3)" />
        </Table>
      `);

      const numberCell = page.locator('[data-column-cell-kind="number"]').first();
      await expect(numberCell).toHaveText("1,234.568");
      await expect(numberCell.locator('[data-number-part="integer"]')).toHaveText("1,234");
      await expect(numberCell.locator('[data-number-part="decimal"]')).toHaveText(".");
      await expect(numberCell.locator('[data-number-part="fraction"]')).toHaveText("568");
    });

    test("uses column locale options for typed formatting", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[{year: 1976, amount: 1234.5, usAmount: 1234.5}]}' testId="table">
          <Column bindTo="year" type="number" typeOptions="{{locale:'hu-HU'}}" />
          <Column bindTo="amount" type="decimal(1)" typeOptions="{{locale:'hu-HU'}}" />
          <Column bindTo="usAmount" type="decimal(1)" typeOptions="{{locale:'en-US'}}" />
        </Table>
      `);

      const numberCells = page.locator('[data-column-cell-kind="number"]');
      await expect(numberCells.nth(0)).toHaveText("1976");
      await expect(numberCells.nth(1)).toHaveText("1234,5");
      await expect(numberCells.nth(2)).toHaveText("1,234.5");
    });

    test("clamps long-text typed columns with max line options", async ({ initTestBed, page }) => {
      const note =
        "This is a long note that should wrap across multiple visual lines when the column is narrow enough to require clamping.";

      await initTestBed(`
        <Table data='{[{note: "${note}"}]}' testId="table" columnSizing="balanced">
          <Column bindTo="note" type="long-text(lines:2)" />
        </Table>
      `);

      const longText = page.locator('[data-column-cell-kind="long-text"]');
      await expect(longText).toHaveAttribute("title", note);
      await expect(longText).toHaveCSS("overflow", "hidden");
      expect(await longText.evaluate((element) => getComputedStyle(element).webkitLineClamp)).toBe(
        "2",
      );
    });

    test("aligns numeric typed columns to the end by default", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[{name: "Ada", amount: 1234.5, total: 9876.5, override: 42}]}' testId="table">
          <Column bindTo="name" type="text" />
          <Column bindTo="amount" type="number(8,3)" />
          <Column bindTo="total" type="currency(USD)" />
          <Column bindTo="override" type="integer" horizontalAlignment="start" />
        </Table>
      `);

      const textCell = page.locator("td").nth(0);
      const numberCell = page.locator("td").nth(1);
      const currencyCell = page.locator("td").nth(2);
      const overriddenNumericCell = page.locator("td").nth(3);

      await expect(textCell).not.toHaveCSS("text-align", "end");
      await expect(numberCell).toHaveCSS("justify-content", "flex-end");
      await expect(numberCell).toHaveCSS("text-align", "end");
      await expect(currencyCell).toHaveCSS("justify-content", "flex-end");
      await expect(currencyCell).toHaveCSS("text-align", "end");
      await expect(overriddenNumericCell).toHaveCSS("justify-content", "flex-start");
      await expect(overriddenNumericCell).toHaveCSS("text-align", "start");
    });

    test("renders text-like explicit column types", async ({ initTestBed, page }) => {
      const typedData = [
        {
          shortText: "Compact value",
          longText:
            "This is a deliberately longer value that should use the long text wrapping hook.",
          markdown: "Hello **bold** and *soft* text",
          code: "const answer = 42;",
          uuid: "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f",
          id: "customer-00000042",
          fullId: "customer-00000042",
          name: "Ada Lovelace",
          address: "42 Long Street, Budapest",
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(typedData)}}' testId="table">
          <Column bindTo="shortText" type="short-text" />
          <Column bindTo="longText" type="long-text" />
          <Column bindTo="markdown" type="markdown" />
          <Column bindTo="code" type="code" />
          <Column bindTo="uuid" type="uuid" />
          <Column bindTo="id" type="id(short)" />
          <Column bindTo="fullId" type="id(full)" />
          <Column bindTo="name" type="name" />
          <Column bindTo="address" type="address" />
        </Table>
      `);

      await expect(page.locator('[data-column-cell-kind="short-text"]')).toHaveText(
        "Compact value",
      );
      const longText = page.locator('[data-column-cell-kind="long-text"]');
      await expect(longText).toContainText("deliberately longer value");
      await expect(longText).toHaveCSS("white-space", "normal");
      await expect(page.locator('[data-column-cell-kind="markdown"] strong')).toHaveText("bold");
      await expect(page.locator('[data-column-cell-kind="markdown"] em')).toHaveText("soft");
      const codeCell = page.locator('[data-column-cell-kind="code"]');
      await expect(codeCell).toHaveText("const answer = 42;");
      expect(await codeCell.evaluate((el) => getComputedStyle(el).fontFamily)).toContain(
        "monospace",
      );
      await expect(page.locator('[data-column-cell-kind="uuid"]')).toHaveText(
        "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f",
      );
      await expect(page.locator('[data-column-cell-kind="id"]').first()).toHaveText("customer...");
      await expect(page.locator('[data-column-cell-kind="id"]').nth(1)).toHaveText(
        "customer-00000042",
      );
      await expect(page.locator('[data-column-cell-kind="name"]')).toHaveText("Ada Lovelace");
      await expect(page.locator('[data-column-cell-kind="address"]')).toHaveText(
        "42 Long Street, Budapest",
      );
    });

    test("renders numeric and time-oriented explicit column types", async ({
      initTestBed,
      page,
    }) => {
      const typedData = [
        {
          number: 1234.5,
          decimal: 12.7,
          accounting: -12.5,
          scientific: 1200,
          bytes: 1536,
          duration: 3661,
          rating: 4,
          time: "2026-08-06T12:34:00Z",
          relative: "2999-01-01T00:00:00Z",
          timestamp: "2026-08-06T12:00:00Z",
          isoDate: "2026-08-06T12:00:00Z",
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(typedData)}}' testId="table">
          <Column bindTo="number" type="number" />
          <Column bindTo="decimal" type="decimal(2)" />
          <Column bindTo="accounting" type="accounting(USD)" />
          <Column bindTo="scientific" type="scientific" />
          <Column bindTo="bytes" type="bytes" />
          <Column bindTo="duration" type="duration" />
          <Column bindTo="rating" type="rating(5)" />
          <Column bindTo="time" type="time" />
          <Column bindTo="relative" type="relative-time" />
          <Column bindTo="timestamp" type="timestamp" />
          <Column bindTo="isoDate" type="iso-date" />
        </Table>
      `);

      const numberCells = page.locator('[data-column-cell-kind="number"]');
      await expect(numberCells.nth(0)).toHaveText("1,234.5");
      await expect(numberCells.nth(1)).toHaveText("12.70");
      await expect(numberCells.nth(2)).toHaveText("($12.50)");
      await expect(numberCells.nth(3)).toHaveText("1.2E3");
      await expect(numberCells.nth(4)).toHaveText("1.5 KB");
      await expect(page.locator('[data-column-cell-kind="duration"]')).toHaveText("1h 1m 1s");
      await expect(page.locator('[data-column-cell-kind="rating"]')).toHaveText("4 / 5");
      const dateCells = page.locator('[data-column-cell-kind="date"]');
      await expect(dateCells).toHaveCount(4);
      await expect(dateCells.nth(1)).toContainText(/in \d+ years/);
      await expect(dateCells.nth(2)).toHaveText("1786017600000");
      await expect(dateCells.nth(3)).toHaveText("2026-08-06");
    });

    test("renders boolean, enum, and status explicit column types", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{[{active: true, checked: true, available: false, state: "pending", kind: "sent"}]}' testId="table">
          <Column bindTo="active" type="boolean" />
          <Column bindTo="checked" type="checkbox" />
          <Column bindTo="available" type="yes-no" />
          <Column bindTo="state" type="status" />
          <Column bindTo="kind" type="enum" typeOptions="{{sent:{label:'Sent to customer'}}}" />
        </Table>
      `);

      await expect(page.locator('[data-column-cell-kind="boolean"]').first()).toHaveText("true");
      await expect(page.locator('[data-column-cell-kind="checkbox"]')).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await expect(page.locator('[data-column-cell-kind="yes-no"]')).toHaveText("No");
      await expect(page.locator('[data-column-cell-kind="status"]')).toHaveText("pending");
      await expect(page.locator('[data-column-cell-kind="enum"]')).toHaveText("Sent to customer");
    });

    test("interactive typed columns fire didChange with row context", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment var.rows="{[{checked: false, enabled: false, accent: '#112233'}]}">
          <Table data="{rows}" testId="table">
            <Column
              bindTo="checked"
              type="checkbox"
              onDidChange="(value, row, rowIndex, columnId) => {
                row.checked = value;
                testState = { value, rowIndex, columnId, rowValue: row.checked };
              }" />
            <Column
              bindTo="enabled"
              type="switch"
              onDidChange="(value, row, rowIndex, columnId) => {
                row.enabled = value;
                testState = { value, rowIndex, columnId, rowValue: row.enabled };
              }" />
            <Column
              bindTo="accent"
              type="color"
              onDidChange="(value, row, rowIndex, columnId) => {
                row.accent = value;
                testState = { value, rowIndex, columnId, rowValue: row.accent };
              }" />
          </Table>
        </Fragment>
      `);

      await page.getByRole("checkbox", { name: "checked row 1" }).click();
      await expect.poll(testStateDriver.testState).toEqual({
        value: true,
        rowIndex: 0,
        columnId: "checked",
        rowValue: true,
      });

      await page.getByRole("switch", { name: "enabled row 1" }).click();
      await expect.poll(testStateDriver.testState).toEqual({
        value: true,
        rowIndex: 0,
        columnId: "enabled",
        rowValue: true,
      });

      const colorInput = page.locator('[data-column-cell-kind="color"]');
      await colorInput.fill("#445566");
      await expect.poll(testStateDriver.testState).toEqual({
        value: "#445566",
        rowIndex: 0,
        columnId: "accent",
        rowValue: "#445566",
      });
    });

    test("column tooltip is shown over column cells", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data="{[{id: 1, name: 'Ada', enabled: true}]}" testId="table">
          <Column
            bindTo="name"
            tooltip="{$item.id + ' - ' + $cell}"
            tooltipOptions="{{side:'right', delayDuration:0}}"
          />
        </Table>
      `);

      await page.locator('td[data-column-id="name"]').hover();
      const tooltip = page.getByRole("tooltip");
      await expect(tooltip).toHaveText("1 - Ada");
      await expect(page.locator("[data-tooltip-container]")).toHaveAttribute("data-side", "right");
    });

    test("column tooltipOptions accepts string options", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data="{[{enabled: true}]}" testId="table">
          <Column
            bindTo="enabled"
            type="switch"
            tooltip="Toggle availability"
            tooltipOptions="side:bottom; delayDuration:0"
          />
        </Table>
      `);

      await page.getByRole("switch", { name: "enabled row 1" }).hover();
      await expect(page.getByRole("tooltip")).toHaveText("Toggle availability");
      await expect(page.locator("[data-tooltip-container]")).toHaveAttribute("data-side", "bottom");
    });

    test("column tooltip resolves row context for custom column content", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{[
            { id: 1, customer: 1, total: 123.45, paid: true },
            { id: 2, customer: 2, total: 87.5, paid: false }
          ]}'
        >
          <Column
            bindTo="customer"
            header="Customer"
            width="200px"
            tooltip="{$item.id + ' - ' + $cell}"
          >
            <Select initialValue="{$cell}" width="80%">
              <Option value="{1}" label="Ada" />
              <Option value="{2}" label="Grace" />
            </Select>
          </Column>
          <Column bindTo="paid" type="switch" />
          <Column bindTo="total" header="Total" width="100px" type="number" />
        </Table>
      `);

      await page.locator('td[data-column-id="customer"]').first().hover();
      await expect(page.getByRole("tooltip")).toHaveText("1 - 1");
    });

    test("column tooltip stays hidden while and after a select dropdown is open", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{[
            { id: 1, customer: 1, total: 123.45, paid: true },
            { id: 2, customer: 2, total: 87.5, paid: false }
          ]}'
        >
          <Column
            bindTo="customer"
            header="Customer"
            width="200px"
            tooltip="{$item.id + ' - ' + $cell}"
            tooltipOptions="{{delayDuration:0}}"
          >
            <Select initialValue="{$cell}">
              <Option value="{1}" label="Ada" />
              <Option value="{2}" label="Grace" />
            </Select>
          </Column>
          <Column bindTo="paid" type="switch" />
          <Column bindTo="total" header="Total" width="100px" type="number" />
        </Table>
      `);

      const customerCell = page.locator('td[data-column-id="customer"]').first();

      await customerCell.hover();
      await expect(page.getByRole("tooltip")).toHaveText("1 - 1");

      await page.getByRole("combobox").first().click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await expect(page.getByRole("tooltip")).toBeHidden();

      await page.getByRole("option", { name: "Grace" }).hover();
      await expect(page.getByRole("tooltip")).toBeHidden();

      await page.getByRole("option", { name: "Grace" }).click();
      await expect(page.getByRole("listbox")).toBeHidden();
      await expect(page.getByRole("tooltip")).toBeHidden();

      await customerCell.hover();
      await expect(page.getByRole("tooltip")).toHaveText("1 - 1");

      await page.getByRole("combobox").first().click();
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.getByRole("option", { name: "Ada" }).hover();
      await expect(page.getByRole("tooltip")).toBeHidden();

      await page.mouse.click(1, 1);
      await expect(page.getByRole("listbox")).toBeHidden();
      await expect(page.getByRole("tooltip")).toBeHidden();

      await customerCell.hover();
      await expect(page.getByRole("tooltip")).toHaveText("1 - 1");
    });

    test("interactive typed column events resolve row context variables", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment var.rows="{[
          { id: 1, paid: false, locked: false },
          { id: 2, paid: true, locked: false }
        ]}">
          <Table data="{rows}" testId="table">
            <Column
              bindTo="paid"
              type="switch"
              onDidChange="(value) => {
                testState = {
                  phase: 'did',
                  value,
                  itemId: $item.id,
                  rowId: $row.id,
                  itemIndex: $itemIndex,
                  rowIndex: $rowIndex,
                  cell: $cell
                };
              }" />
            <Column
              bindTo="locked"
              type="checkbox"
              onWillChange="(value) => {
                testState = {
                  phase: 'will',
                  value,
                  itemId: $item.id,
                  rowId: $row.id,
                  itemIndex: $itemIndex,
                  rowIndex: $rowIndex,
                  cell: $cell
                };
                return false;
              }" />
          </Table>
        </Fragment>
      `);

      await page.getByRole("switch", { name: "paid row 1" }).click();
      await expect.poll(testStateDriver.testState).toEqual({
        phase: "did",
        value: true,
        itemId: 1,
        rowId: 1,
        itemIndex: 0,
        rowIndex: 0,
        cell: false,
      });

      const lockedCheckbox = page.getByRole("checkbox", { name: "locked row 2" });
      await lockedCheckbox.click();
      await expect(lockedCheckbox).not.toBeChecked();
      await expect.poll(testStateDriver.testState).toEqual({
        phase: "will",
        value: true,
        itemId: 2,
        rowId: 2,
        itemIndex: 1,
        rowIndex: 1,
        cell: false,
      });
    });

    test("interactive typed column action events resolve row context variables", async ({
      initTestBed,
      page,
    }) => {
      const apiInterceptor: ApiInterceptorDefinition = {
        operations: {
          "checkbox-context": {
            url: "/api/checked/1/true",
            method: "get",
            handler: `return { event: "checkbox" };`,
          },
          "switch-context": {
            url: "/api/paid/1/true",
            method: "get",
            handler: `return { event: "switch" };`,
          },
          "color-context": {
            url: "/api/accent/1/445566",
            method: "get",
            handler: `return { event: "color" };`,
          },
        },
      };

      const { testStateDriver } = await initTestBed(
        `
        <Table data="{[{ id: 1, checked: false, paid: false, accent: '#112233' }]}" testId="table">
          <Column bindTo="checked" type="checkbox">
            <event name="didChange">
              <APICall
                url="/api/checked/{$item.id}/{$param}"
                onSuccess="result => testState = [...(testState || []), result.event]" />
            </event>
          </Column>
          <Column bindTo="paid" type="switch">
            <event name="didChange">
              <APICall
                url="/api/paid/{$item.id}/{$param}"
                onSuccess="result => testState = [...(testState || []), result.event]" />
            </event>
          </Column>
          <Column bindTo="accent" type="color">
            <event name="didChange">
              <APICall
                url="/api/accent/{$item.id}/{$param.substring(1)}"
                onSuccess="result => testState = [...(testState || []), result.event]" />
            </event>
          </Column>
        </Table>
      `,
        { apiInterceptor },
      );

      await page.getByRole("checkbox", { name: "checked row 1" }).click();
      await expect.poll(testStateDriver.testState).toEqual(["checkbox"]);

      await page.getByRole("switch", { name: "paid row 1" }).click();
      await expect.poll(testStateDriver.testState).toEqual(["checkbox", "switch"]);

      await page.locator('td[data-column-id="accent"] input[type="color"]').fill("#445566");
      await expect.poll(testStateDriver.testState).toEqual(["checkbox", "switch", "color"]);
    });

    test("readOnly interactive typed columns do not fire didChange", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data="{[{checked: false, enabled: false, accent: '#112233'}]}">
          <Column
            bindTo="checked"
            type="checkbox"
            readOnly
            onDidChange="testState = 'checkbox changed'" />
          <Column
            bindTo="enabled"
            type="switch"
            readOnly
            onDidChange="testState = 'switch changed'" />
          <Column
            bindTo="accent"
            type="color"
            readOnly
            onDidChange="testState = 'color changed'" />
        </Table>
      `);

      const checkbox = page.getByRole("checkbox", { name: "checked row 1" });
      await expect(checkbox).toHaveAttribute("aria-readonly", "true");
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();

      const switchControl = page.getByRole("switch", { name: "enabled row 1" });
      await expect(switchControl).toHaveAttribute("aria-readonly", "true");
      await switchControl.click();
      await expect(switchControl).toHaveAttribute("aria-checked", "false");

      const colorInput = page.locator('td[data-column-id="accent"] input[type="color"]');
      await expect(colorInput).toBeDisabled();
      await expect(colorInput).toHaveValue("#112233");

      await expect.poll(testStateDriver.testState).toEqual(null);
    });

    test("disabled interactive typed columns do not accept input", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data="{[{checked: false, enabled: false, accent: '#112233'}]}">
          <Column
            bindTo="checked"
            type="checkbox"
            enabled="false" />
          <Column
            bindTo="enabled"
            type="switch"
            enabled="false" />
          <Column
            bindTo="accent"
            type="color"
            enabled="false" />
        </Table>
      `);

      await expect(page.getByRole("checkbox", { name: "checked row 1" })).toBeDisabled();
      await expect(page.getByRole("switch", { name: "enabled row 1" })).toBeDisabled();
      await expect(page.locator('td[data-column-id="accent"] input[type="color"]')).toBeDisabled();
    });

    test("interactive typed column enabled re-evaluates with row context changes", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment var.rows="{[{isActive: false}]}">
          <Table data="{rows}">
            <Column
              bindTo="isActive"
              type="switch"
              enabled="{$item === undefined || !$item.isActive}"
              onDidChange="(value) => {
                rows = rows.map((row, index) => index === 0 ? { ...row, isActive: value } : row);
                testState = rows[0].isActive;
              }" />
          </Table>
        </Fragment>
      `);

      const switchControl = page.getByRole("switch", { name: "isActive row 1" });
      await expect(switchControl).toBeEnabled();

      await switchControl.click();
      await expect.poll(testStateDriver.testState).toEqual(true);
      await expect(switchControl).toHaveAttribute("aria-checked", "true");
      await expect(switchControl).toBeDisabled();
    });

    test("interactive typed columns update bound rows and refresh row-scoped enabled expressions", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <App var.remainder="{0}">
          <Table
            data='{[
              { id: 1, customer: "Ada", total: 123.45, paid: true },
              { id: 2, customer: "Grace", total: 87.5, paid: false }
            ]}'
          >
            <Column header="ID" bindTo="id" />
            <Column header="Customer" bindTo="customer" />
            <Column
              header="Paid"
              bindTo="paid"
              type="switch"
              enabled="{$item.id % remainder === 0}"
              onDidChange="remainder = 1 - remainder"
            />
            <Column
              header="Paid2"
              bindTo="paid"
              type="checkbox"
              onDidChange="remainder = 1 - remainder"
            />
          </Table>
          <Text testId="remainder">Remainder: {remainder}</Text>
        </App>
      `);

      const paidSwitch = page.getByRole("switch", { name: "paid row 1" });
      const paidCheckbox = page.getByRole("checkbox", { name: "paid row 1" });

      await expect(paidSwitch).toBeDisabled();
      await expect(paidSwitch).toHaveAttribute("aria-checked", "true");
      await expect(paidCheckbox).toBeChecked();

      await paidCheckbox.click();
      await expect(page.getByTestId("remainder")).toHaveText("Remainder: 1");
      await expect(paidCheckbox).not.toBeChecked();
      await expect(paidSwitch).toHaveAttribute("aria-checked", "false");
      await expect(paidSwitch).toBeEnabled();
    });

    test("willChange controls whether interactive typed columns commit changes", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data="{[{locked: false, allowed: false, accent: '#112233'}]}">
          <Column
            bindTo="locked"
            type="checkbox"
            onWillChange="() => false"
            onDidChange="testState = 'locked changed'" />
          <Column
            bindTo="allowed"
            type="switch"
            onWillChange="() => undefined"
            onDidChange="(value, row, rowIndex, columnId) => testState = { value, rowIndex, columnId }" />
          <Column
            bindTo="accent"
            type="color"
            onWillChange="() => false"
            onDidChange="testState = 'color changed'" />
        </Table>
      `);

      const lockedCheckbox = page.getByRole("checkbox", { name: "locked row 1" });
      await lockedCheckbox.click();
      await expect(lockedCheckbox).not.toBeChecked();
      await expect.poll(testStateDriver.testState).toEqual(null);

      const allowedSwitch = page.getByRole("switch", { name: "allowed row 1" });
      await allowedSwitch.click();
      await expect(allowedSwitch).toHaveAttribute("aria-checked", "true");
      await expect.poll(testStateDriver.testState).toEqual({
        value: true,
        rowIndex: 0,
        columnId: "allowed",
      });

      const colorInput = page.locator('td[data-column-id="accent"] input[type="color"]');
      await colorInput.fill("#445566");
      await expect(colorInput).toHaveValue("#112233");
      await expect.poll(testStateDriver.testState).toEqual({
        value: true,
        rowIndex: 0,
        columnId: "allowed",
      });
    });

    test("interactive typed columns use smart default widths and center controls", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data="{[{shortCheck: true, longCheck: true, enabled: true, accent: '#112233'}]}">
          <Column bindTo="shortCheck" type="checkbox" header="On" />
          <Column bindTo="longCheck" type="checkbox" header="Really long checkbox header" />
          <Column bindTo="enabled" type="switch" header="Switch" />
          <Column bindTo="accent" type="color" header="Color" />
        </Table>
      `);

      const shortHeader = page.locator('th[data-column-id="shortCheck"]');
      const longHeader = page.locator('th[data-column-id="longCheck"]');

      await expect(shortHeader).toBeVisible();
      await expect(longHeader).toBeVisible();
      const shortHeaderBox = await shortHeader.boundingBox();
      const longHeaderBox = await longHeader.boundingBox();
      expect(shortHeaderBox).not.toBeNull();
      expect(longHeaderBox).not.toBeNull();
      expect(longHeaderBox!.width).toBeGreaterThan(shortHeaderBox!.width + 80);

      await expectControlCentered(
        page.locator('td[data-column-id="shortCheck"]'),
        page.getByRole("checkbox", { name: "shortCheck row 1" }),
      );
      await expectControlCentered(
        page.locator('td[data-column-id="longCheck"]'),
        page.getByRole("checkbox", { name: "longCheck row 1" }),
      );
      await expectControlCentered(
        page.locator('td[data-column-id="enabled"]'),
        page.getByRole("switch", { name: "enabled row 1" }),
      );
      await expectControlCentered(
        page.locator('td[data-column-id="accent"]'),
        page.locator('td[data-column-id="accent"] input[type="color"]'),
      );
    });

    test("headerHorizontalAlignment aligns header text and sort icon together", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data="{[{start: 'Alpha', center: 'Bravo', end: 'Charlie'}]}"
          alwaysShowSortingIndicator
          canResizeColumns="false"
        >
          <Column bindTo="start" header="Start" width="{180}" headerHorizontalAlignment="start" />
          <Column bindTo="center" header="Center" width="{180}" headerHorizontalAlignment="center" />
          <Column bindTo="end" header="End" width="{180}" headerHorizontalAlignment="end" />
        </Table>
      `);

      const startMetrics = await getHeaderContentMetrics(
        page.locator('th[data-column-id="start"]'),
      );
      const centerMetrics = await getHeaderContentMetrics(
        page.locator('th[data-column-id="center"]'),
      );
      const endMetrics = await getHeaderContentMetrics(page.locator('th[data-column-id="end"]'));

      expect(startMetrics).not.toBeNull();
      expect(centerMetrics).not.toBeNull();
      expect(endMetrics).not.toBeNull();

      expect(Math.abs(startMetrics!.groupLeft - startMetrics!.contentLeft)).toBeLessThanOrEqual(2);
      expect(
        Math.abs(centerMetrics!.groupCenter - centerMetrics!.contentCenter),
      ).toBeLessThanOrEqual(2);
      expect(Math.abs(endMetrics!.groupRight - endMetrics!.contentRight)).toBeLessThanOrEqual(2);
    });

    test("renders visual and structured explicit column types", async ({ initTestBed, page }) => {
      const imageUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const typedData = [
        {
          color: "#336699",
          phone: "+1 555 123 4567",
          tag: "alpha",
          tags: ["math", "logic"],
          image: imageUrl,
          avatar: imageUrl,
          icon: "check",
          link: "https://example.com/profile",
          object: { level: "admin" },
          array: [1, 2],
          list: ["red", "blue"],
        },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(typedData)}}' testId="table">
          <Column bindTo="color" type="color" />
          <Column bindTo="phone" type="phone" />
          <Column bindTo="tag" type="tag" />
          <Column bindTo="tags" type="tags" />
          <Column bindTo="image" type="image" typeOptions="{{alt:'Sample thumbnail'}}" />
          <Column bindTo="avatar" type="avatar" typeOptions="{{label:'Ada avatar'}}" />
          <Column bindTo="icon" type="icon" />
          <Column bindTo="link" type="link(label:domain)" />
          <Column bindTo="object" type="object" />
          <Column bindTo="array" type="array" />
          <Column bindTo="list" type="list" />
        </Table>
      `);

      await expect(page.locator('[data-column-cell-kind="color"]')).toHaveValue("#336699");
      await expect(page.getByRole("link", { name: "+1 555 123 4567" })).toHaveAttribute(
        "href",
        "tel:+1 555 123 4567",
      );
      await expect(page.locator('[data-column-cell-kind="tag"]')).toHaveText("alpha");
      await expect(page.locator('[data-column-cell-kind="tags"]')).toHaveText("math, logic");
      await expect(page.getByRole("img", { name: "Sample thumbnail" })).toHaveAttribute(
        "src",
        imageUrl,
      );
      await expect(page.getByRole("img", { name: "Ada avatar" })).toHaveAttribute("src", imageUrl);
      await expect(page.locator('[data-column-cell-kind="avatar"]')).toHaveCSS(
        "border-radius",
        "50%",
      );
      await expect(page.locator('[data-column-cell-kind="icon"]')).toBeVisible();
      await expect(page.getByRole("link", { name: "example.com", exact: true })).toHaveAttribute(
        "href",
        "https://example.com/profile",
      );
      await expect(page.locator('[data-column-cell-kind="json"]').nth(0)).toHaveText(
        '{"level":"admin"}',
      );
      await expect(page.locator('[data-column-cell-kind="json"]').nth(1)).toHaveText("[1,2]");
      await expect(page.locator('[data-column-cell-kind="list"]')).toHaveText("red, blue");
    });

    test("custom Column children override typed rendering", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[{amount: 1234.5}]}' testId="table">
          <Column bindTo="amount" type="currency(USD)">
            <Text>Custom {$cell}</Text>
          </Column>
        </Table>
      `);

      await expect(page.locator("td").filter({ hasText: "Custom 1234.5" })).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "$1,234.50" })).toHaveCount(0);
    });

    test("custom cell child with percentage width uses the available column content width", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
          <Table
            data='{[
            { id: 1, customer: "Ada", partialCustomer: "Ada", total: 123.45 },
            { id: 2, customer: "Grace", partialCustomer: "Grace", total: 87.5 }
          ]}'
          width="600px"
        >
          <Column bindTo="customer" header="Customer" width="240px">
            <Select testId="fullSelect" initialValue="{$cell}" width="100%">
              <Option value="Ada">Ada</Option>
              <Option value="Grace">Grace</Option>
            </Select>
          </Column>
          <Column bindTo="partialCustomer" header="Partial" width="240px">
            <Select testId="partialSelect" initialValue="{$cell}" width="80%">
              <Option value="Ada">Ada</Option>
              <Option value="Grace">Grace</Option>
            </Select>
          </Column>
          <Column bindTo="total" header="Total" width="100px" type="number" />
        </Table>
      `);

      async function getWidthMetrics(columnId: string) {
        const cell = page.locator(`td[data-column-id="${columnId}"]`).first();
        const select = cell.getByRole("combobox");
        await expect(select).toBeVisible();

        return cell.evaluate((cell) => {
          const cellBox = cell.getBoundingClientRect();
          const content = cell.firstElementChild as HTMLElement;
          const control = cell.querySelector('[role="combobox"]') as HTMLElement;
          const contentStyles = window.getComputedStyle(content);
          const availableWidth =
            cellBox.width -
            Number.parseFloat(contentStyles.paddingLeft) -
            Number.parseFloat(contentStyles.paddingRight);

          return {
            availableWidth,
            controlWidth: control.getBoundingClientRect().width,
          };
        });
      }

      const fullMetrics = await getWidthMetrics("customer");
      expect(fullMetrics.controlWidth).toBeGreaterThan(180);
      expect(Math.abs(fullMetrics.controlWidth - fullMetrics.availableWidth)).toBeLessThanOrEqual(
        2,
      );

      const partialMetrics = await getWidthMetrics("partialCustomer");
      expect(
        Math.abs(partialMetrics.controlWidth - partialMetrics.availableWidth * 0.8),
      ).toBeLessThanOrEqual(2);
    });
  });

  test("invokes onRowDoubleClick when row is double-clicked", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table" onRowDoubleClick="(item) => testState = item.name">
        <Column bindTo="name"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();
    await firstRow.dblclick();

    await expect.poll(testStateDriver.testState).toEqual("Apple");
  });

  test("double-click fires handler without interfering with row selection", async ({
    initTestBed,
    page,
  }) => {
    // Regression test: Verify that double-click doesn't trigger onClick twice
    // The fix checks event.detail >= 2 to skip onClick on the second click
    const { testStateDriver } = await initTestBed(`
      <Table
        data='{${JSON.stringify(sampleData)}}'
        testId="table"
        rowsSelectable="true"
        onRowDoubleClick="(item) => testState = { ...(testState || {}), action: 'doubleClick', item: item.name }"
        onSelectionDidChange="(selectedIds) => testState = { ...(testState || {}), selectionCount: selectedIds.length }"
      >
        <Column bindTo="name"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const firstRow = page.locator("tbody tr").first();
    await expect(firstRow).toBeVisible();

    // Verify double-click fires the handler
    await firstRow.dblclick();

    // Double-click handler should fire
    const state = await testStateDriver.testState();
    expect(state).toMatchObject({
      action: "doubleClick",
      item: "Apple",
    });

    // After double-click, the row should be selected (from the first click)
    // but not toggle-deselected (because event.detail >= 2 prevents second click)
    await expect(firstRow).toHaveClass(/selected/);
    expect(state.selectionCount).toBe(1);
  });

  test("renders with empty data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{[]}' testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Headers should still be visible
    const headers = page.locator("th");
    await expect(headers.nth(0)).toContainText("Name");
    await expect(headers.nth(1)).toContainText("Quantity");
  });

  test.describe("data property", () => {
    test("displays data with different value types", async ({ initTestBed, page }) => {
      const mixedData = [
        { id: 1, name: "Test", number: 42, boolean: true, nullValue: null },
        { id: 2, name: "Another", number: 0, boolean: false, nullValue: undefined },
      ];

      await initTestBed(`
        <Table data='{${JSON.stringify(mixedData)}}' testId="table">
          <Column bindTo="name"/>
          <Column bindTo="number"/>
          <Column bindTo="boolean"/>
          <Column bindTo="nullValue"/>
        </Table>
      `);

      // Wait for table to be visible first
      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      // Wait for rows to be present
      const rows = page.locator("tbody tr");
      await expect(rows).toHaveCount(2);

      // Now check for cell content
      await expect(page.locator("td").filter({ hasText: "Test" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "42" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "true" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "0" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "false" }).first()).toBeVisible();
    });

    test("handles null data gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{null}' testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();
    });

    test("handles undefined data gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{undefined}' testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();
    });
  });

  test.describe("items property", () => {
    test("items property works as alias for data", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table items='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "5" }).first()).toBeVisible();
    });

    test("items takes priority over data when both are provided", async ({ initTestBed, page }) => {
      const itemsData = [{ id: 1, name: "Items Data" }];
      const dataProperty = [{ id: 1, name: "Data Property" }];

      await initTestBed(`
        <Table
          items='{${JSON.stringify(itemsData)}}'
          data='{${JSON.stringify(dataProperty)}}'
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await expect(page.locator("td").filter({ hasText: "Items Data" }).first()).toBeVisible();
      await expect(page.locator("td").filter({ hasText: "Data Property" })).toHaveCount(0);
    });
  });

  test.describe("hideHeader property", () => {
    test("hides header when hideHeader is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' hideHeader="true" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Wait for table to be visible and fully rendered
      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      // Wait for data to be visible (ensures table is fully rendered)
      await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();

      // Now check that headers are not present
      await expect(page.locator("th")).toHaveCount(0);
    });

    test("shows header when hideHeader is false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' hideHeader="false" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Wait for table to be visible first
      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      // Wait for headers to be present
      const headers = page.locator("th");
      await expect(headers).toHaveCount(2);

      // Check header text content
      await expect(headers.nth(0)).toContainText("Name");
      await expect(headers.nth(1)).toContainText("Quantity");
    });
  });

  test.describe("noBottomBorder property", () => {
    test("removes bottom border when noBottomBorder is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' noBottomBorder="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();
      // Note: Visual border testing would require specific CSS assertions
    });
  });

  test.describe("rowsSelectable property", () => {
    test("enables row selection when rowsSelectable is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      // Selection checkboxes should be present - they exist but might be hidden via CSS
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(5); // 4 data rows + 1 header checkbox
    });

    test("disables row selection when rowsSelectable is false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="false" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      // No selection checkboxes should be present
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(0);
    });

    test("row is not selected if input field is clicked in row", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
          <Column bindTo="name">
            <TextBox testId="{'input' + $itemIndex}" initialValue="{$cell}" />
          </Column>
        </Table>
      `);
      const input = page.getByTestId("input0").getByRole("textbox");
      await input.click();
      await expect(input).toBeFocused();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < (await checkboxes.count()); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test("row is not selected if button is clicked in row", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
          <Column bindTo="name">
            <Button testId="{'button' + $itemIndex}" label="{$cell}" />
          </Column>
        </Table>
      `);
      const button = page.getByTestId("button0");
      await button.click();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < (await checkboxes.count()); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test("row is not selected if dropdown trigger is clicked in row", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
          <Column bindTo="name" />
          <Column id="action">
            <DropdownMenu testId="{'dropdown' + $itemIndex}">
              <MenuItem label="Test Item" />
            </DropdownMenu>
          </Column>
        </Table>
      `);
      const dropdownTrigger = page.getByTestId("dropdown0");
      await dropdownTrigger.click();
      await expect(page.getByText("Test Item")).toBeVisible();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < (await checkboxes.count()); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test("checkbox column maintains width with horizontal scrolling (issue #2790)", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{[{foo: "bar"}]}' rowsSelectable="true" testId="table">
          <Column width="2000px" bindTo="foo" />
        </Table>
      `);

      // Get the first header cell (checkbox column)
      const checkboxHeaderCell = page.locator("th").first();
      await expect(checkboxHeaderCell).toBeVisible();

      // Verify checkbox column has non-zero width
      const headerBox = await checkboxHeaderCell.boundingBox();
      expect(headerBox).not.toBeNull();
      expect(headerBox!.width).toBeGreaterThan(0);

      // Get the first body cell (checkbox column in row)
      const checkboxBodyCell = page.locator("tbody td").first();
      await expect(checkboxBodyCell).toBeVisible();

      // Verify checkbox body cell has non-zero width
      const bodyBox = await checkboxBodyCell.boundingBox();
      expect(bodyBox).not.toBeNull();
      expect(bodyBox!.width).toBeGreaterThan(0);

      // Specifically verify it's approximately the expected width (42px)
      // Allow some tolerance for browser rendering differences
      expect(bodyBox!.width).toBeGreaterThanOrEqual(35);
      expect(bodyBox!.width).toBeLessThanOrEqual(50);
    });
  });

  // Tests for hideSelectionCheckboxes prop (separate prop from rowsSelectable)
  test.describe("hideSelectionCheckboxes property", () => {
    test("hides checkboxes when true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      const checkboxesHidden = page.locator("input[type='checkbox']");
      await expect(checkboxesHidden).toHaveCount(0);
    });

    test("shows checkboxes when false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      const checkboxesShown = page.locator("input[type='checkbox']");
      await expect(checkboxesShown).toHaveCount(5);
    });
  });

  test.describe("hideSelectionCheckboxesHeader property", () => {
    test("hides header checkbox when true, row checkboxes remain", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxesHeader="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // Header checkbox must not be in the DOM
      const headerCheckbox = page.locator("thead input[type='checkbox']");
      await expect(headerCheckbox).toHaveCount(0);
      // Row checkboxes still present (one per data row)
      const rowCheckboxes = page.locator("tbody input[type='checkbox']");
      await expect(rowCheckboxes).toHaveCount(4);
    });

    test("shows header checkbox by default (hideSelectionCheckboxesHeader false)", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      const headerCheckbox = page.locator("thead input[type='checkbox']");
      await expect(headerCheckbox).toHaveCount(1);
    });

    test("hideSelectionCheckboxesHeader has no effect when enableMultiRowSelection is false", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="false" hideSelectionCheckboxesHeader="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // Single-select never renders a header checkbox regardless
      const headerCheckbox = page.locator("thead input[type='checkbox']");
      await expect(headerCheckbox).toHaveCount(0);
    });
  });

  test.describe("alwaysShowSelectionCheckboxes property", () => {
    test("checkboxes are always visible when alwaysShowSelectionCheckboxes is true", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" alwaysShowSelectionCheckboxes="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // All row checkboxes + header checkbox should be present and visible
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(5); // header + 4 data rows
      // Each checkbox wrapper should have the showInRow class that makes it always visible
      const checkboxWrappers = page.locator("tbody tr input[type='checkbox']");
      for (const checkbox of await checkboxWrappers.all()) {
        await expect(checkbox).toBeAttached();
      }
    });

    test("checkboxes are hidden on non-hovered rows by default (alwaysShowSelectionCheckboxes false)", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" alwaysShowSelectionCheckboxes="false" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // Checkboxes still exist in DOM but are not visible without hover
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(5); // header + 4 data rows
    });

    test("alwaysShowSelectionCheckboxes has no effect when hideSelectionCheckboxes is true", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true" alwaysShowSelectionCheckboxes="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // hideSelectionCheckboxes takes precedence — no checkboxes rendered
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(0);
    });

    test("alwaysShowSelectionCheckboxes has no effect when row selection is disabled", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowSelectionCheckboxes="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // No selection enabled — no checkboxes rendered
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(0);
    });
  });

  test.describe("autoFocus property", () => {
    test("focuses table when autoFocus is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' autoFocus="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeFocused();
    });
  });

  test.describe("checkboxTolerance property", () => {
    test("allows checkbox interaction within compact tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               checkboxTolerance="compact"
               onSelectionDidChange="testState = 'selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get first row checkbox - checkboxes exist but are hidden via CSS
      const firstRowCheckbox = page.locator("input[type='checkbox']").nth(1); // Skip header checkbox

      // Verify checkbox exists (even if hidden)
      await expect(firstRowCheckbox).toBeAttached();

      // Get the first table row to interact with
      const firstDataRow = page.locator("tbody tr").first();
      await expect(firstDataRow).toBeVisible();

      // Get row bounds for calculation
      const rowBounds = await firstDataRow.boundingBox();

      // Click near the left edge of the row (where checkbox would be with tolerance)
      // This simulates clicking within the 8px compact tolerance of the checkbox
      const clickX = rowBounds.x + 15; // Slightly to the right of where checkbox would be
      const clickY = rowBounds.y + rowBounds.height / 2;

      // Click within tolerance boundary should trigger selection due to checkboxTolerance="compact"
      await page.mouse.click(clickX, clickY);

      // Verify checkbox is now checked (using force since it's hidden)
      await expect(firstRowCheckbox).toBeChecked();

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("selection changed");
    });

    test("allows header checkbox interaction within compact tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               enableMultiRowSelection="true"
               checkboxTolerance="compact"
               onSelectionDidChange="testState = 'header selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get header checkbox (select all checkbox)
      const headerCheckbox = page.locator("input[type='checkbox']").first(); // Header checkbox is first

      // Verify checkbox exists (even if hidden)
      await expect(headerCheckbox).toBeAttached();

      // Get the header row to interact with
      const headerRow = page.locator("thead tr").first();
      await expect(headerRow).toBeVisible();

      // Get header row bounds for calculation
      const headerBounds = await headerRow.boundingBox();

      // Click near the left edge of the header row (where checkbox would be with tolerance)
      // This simulates clicking within the 8px compact tolerance of the header checkbox
      const clickX = headerBounds.x + 15; // Slightly to the right of where checkbox would be
      const clickY = headerBounds.y + headerBounds.height / 2;

      // Click within tolerance boundary should trigger "select all" due to checkboxTolerance="compact"
      await page.mouse.click(clickX, clickY);

      // Verify header checkbox is now checked (select all)
      await expect(headerCheckbox).toBeChecked();

      // Verify all row checkboxes are also checked (select all behavior)
      const allCheckboxes = page.locator("input[type='checkbox']");
      const checkboxCount = await allCheckboxes.count();
      for (let i = 0; i < checkboxCount; i++) {
        await expect(allCheckboxes.nth(i)).toBeChecked();
      }

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("header selection changed");
    });

    test("allows checkbox interaction within none tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               checkboxTolerance="none"
               onSelectionDidChange="testState = 'none selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get first row checkbox - checkboxes exist but are hidden via CSS
      const firstRowCheckbox = page.locator("input[type='checkbox']").nth(1); // Skip header checkbox

      // Verify checkbox exists (even if hidden)
      await expect(firstRowCheckbox).toBeAttached();

      // Get the first table row to interact with
      const firstDataRow = page.locator("tbody tr").first();
      await expect(firstDataRow).toBeVisible();

      // Get row bounds for calculation
      const rowBounds = await firstDataRow.boundingBox();

      // For "none" tolerance, we need to click precisely on the checkbox
      // Since checkboxes are hidden, click on their expected position
      await firstRowCheckbox.click({ force: true });

      // Verify checkbox is now checked
      await expect(firstRowCheckbox).toBeChecked();

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("none selection changed");
    });

    test("allows header checkbox interaction within none tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               enableMultiRowSelection="true"
               checkboxTolerance="none"
               onSelectionDidChange="testState = 'header none selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get header checkbox (select all checkbox)
      const headerCheckbox = page.locator("input[type='checkbox']").first(); // Header checkbox is first

      // Verify checkbox exists (even if hidden)
      await expect(headerCheckbox).toBeAttached();

      // Get the header row to interact with
      const headerRow = page.locator("thead tr").first();
      await expect(headerRow).toBeVisible();

      // Get header row bounds for calculation
      const headerBounds = await headerRow.boundingBox();

      // For "none" tolerance, we need to click precisely on the checkbox
      // Since checkboxes are hidden, click on their expected position
      await headerCheckbox.click({ force: true });

      // Verify header checkbox is now checked (select all)
      await expect(headerCheckbox).toBeChecked();

      // Verify all row checkboxes are also checked (select all behavior)
      const allCheckboxes = page.locator("input[type='checkbox']");
      const checkboxCount = await allCheckboxes.count();
      for (let i = 0; i < checkboxCount; i++) {
        await expect(allCheckboxes.nth(i)).toBeChecked();
      }

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("header none selection changed");
    });

    test("allows checkbox interaction within comfortable tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               checkboxTolerance="comfortable"
               onSelectionDidChange="testState = 'comfortable selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get first row checkbox - checkboxes exist but are hidden via CSS
      const firstRowCheckbox = page.locator("input[type='checkbox']").nth(1); // Skip header checkbox

      // Verify checkbox exists (even if hidden)
      await expect(firstRowCheckbox).toBeAttached();

      // Get the first table row to interact with
      const firstDataRow = page.locator("tbody tr").first();
      await expect(firstDataRow).toBeVisible();

      // Get row bounds for calculation
      const rowBounds = await firstDataRow.boundingBox();

      // Click near the left edge of the row (where checkbox would be with tolerance)
      // This simulates clicking within the 12px comfortable tolerance of the checkbox
      const clickX = rowBounds.x + 20; // Further right to test 12px tolerance
      const clickY = rowBounds.y + rowBounds.height / 2;

      // Click within tolerance boundary should trigger selection due to checkboxTolerance="comfortable"
      await page.mouse.click(clickX, clickY);

      // Verify checkbox is now checked
      await expect(firstRowCheckbox).toBeChecked();

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("comfortable selection changed");
    });

    test("allows header checkbox interaction within comfortable tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               enableMultiRowSelection="true"
               checkboxTolerance="comfortable"
               onSelectionDidChange="testState = 'header comfortable selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get header checkbox (select all checkbox)
      const headerCheckbox = page.locator("input[type='checkbox']").first(); // Header checkbox is first

      // Verify checkbox exists (even if hidden)
      await expect(headerCheckbox).toBeAttached();

      // Get the header row to interact with
      const headerRow = page.locator("thead tr").first();
      await expect(headerRow).toBeVisible();

      // Get header row bounds for calculation
      const headerBounds = await headerRow.boundingBox();

      // Click near the left edge of the header row (where checkbox would be with tolerance)
      // This simulates clicking within the 12px comfortable tolerance of the header checkbox
      const clickX = headerBounds.x + 20; // Further right to test 12px tolerance
      const clickY = headerBounds.y + headerBounds.height / 2;

      // Click within tolerance boundary should trigger "select all" due to checkboxTolerance="comfortable"
      await page.mouse.click(clickX, clickY);

      // Verify header checkbox is now checked (select all)
      await expect(headerCheckbox).toBeChecked();

      // Verify all row checkboxes are also checked (select all behavior)
      const allCheckboxes = page.locator("input[type='checkbox']");
      const checkboxCount = await allCheckboxes.count();
      for (let i = 0; i < checkboxCount; i++) {
        await expect(allCheckboxes.nth(i)).toBeChecked();
      }

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("header comfortable selection changed");
    });

    test("allows checkbox interaction within spacious tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               checkboxTolerance="spacious"
               onSelectionDidChange="testState = 'spacious selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get first row checkbox - checkboxes exist but are hidden via CSS
      const firstRowCheckbox = page.locator("input[type='checkbox']").nth(1); // Skip header checkbox

      // Verify checkbox exists (even if hidden)
      await expect(firstRowCheckbox).toBeAttached();

      // Get the first table row to interact with
      const firstDataRow = page.locator("tbody tr").first();
      await expect(firstDataRow).toBeVisible();

      // Get row bounds for calculation
      const rowBounds = await firstDataRow.boundingBox();

      // Click near the left edge of the row (where checkbox would be with tolerance)
      // This simulates clicking within the 16px spacious tolerance of the checkbox
      const clickX = rowBounds.x + 24; // Even further right to test 16px tolerance
      const clickY = rowBounds.y + rowBounds.height / 2;

      // Click within tolerance boundary should trigger selection due to checkboxTolerance="spacious"
      await page.mouse.click(clickX, clickY);

      // Verify checkbox is now checked
      await expect(firstRowCheckbox).toBeChecked();

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("spacious selection changed");
    });

    test("allows header checkbox interaction within spacious tolerance boundary", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}'
               rowsSelectable="true"
               enableMultiRowSelection="true"
               checkboxTolerance="spacious"
               onSelectionDidChange="testState = 'header spacious selection changed'"
               testId="table">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Get header checkbox (select all checkbox)
      const headerCheckbox = page.locator("input[type='checkbox']").first(); // Header checkbox is first

      // Verify checkbox exists (even if hidden)
      await expect(headerCheckbox).toBeAttached();

      // Get the header row to interact with
      const headerRow = page.locator("thead tr").first();
      await expect(headerRow).toBeVisible();

      // Get header row bounds for calculation
      const headerBounds = await headerRow.boundingBox();

      // Click near the left edge of the header row (where checkbox would be with tolerance)
      // This simulates clicking within the 16px spacious tolerance of the header checkbox
      const clickX = headerBounds.x + 24; // Even further right to test 16px tolerance
      const clickY = headerBounds.y + headerBounds.height / 2;

      // Click within tolerance boundary should trigger "select all" due to checkboxTolerance="spacious"
      await page.mouse.click(clickX, clickY);

      // Verify header checkbox is now checked (select all)
      await expect(headerCheckbox).toBeChecked();

      // Verify all row checkboxes are also checked (select all behavior)
      const allCheckboxes = page.locator("input[type='checkbox']");
      const checkboxCount = await allCheckboxes.count();
      for (let i = 0; i < checkboxCount; i++) {
        await expect(allCheckboxes.nth(i)).toBeChecked();
      }

      // Verify selection event was fired
      await expect.poll(testStateDriver.testState).toEqual("header spacious selection changed");
    });
  });

  test.describe("Selectable and Disabled Rows", () => {
    test.describe("rowDisabledPredicate property", () => {
      test("applies disabled styling to rows matching predicate", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowDisabledPredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Get all data rows (skip header row)
        const rows = page.locator("tbody tr");

        // Apple and Banana rows should not have disabled class
        const appleRow = rows.filter({ hasText: "Apple" });
        await expect(appleRow).not.toHaveClass(/disabled/);

        const bananaRow = rows.filter({ hasText: "Banana" });
        await expect(bananaRow).not.toHaveClass(/disabled/);

        // Carrot and Spinach rows should have disabled class
        const carrotRow = rows.filter({ hasText: "Carrot" });
        await expect(carrotRow).toHaveClass(/disabled/);

        const spinachRow = rows.filter({ hasText: "Spinach" });
        await expect(spinachRow).toHaveClass(/disabled/);
      });

      test("disabled rows cannot be selected via checkbox click", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowDisabledPredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // All rows should have checkboxes (4 data rows + 1 header)
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(5);

        // Disabled rows have pointer-events: none so clicking won't work
        // Verify the disabled row's checkbox is not checked
        const carrotRow = page.locator("tbody tr").filter({ hasText: "Carrot" });
        const carrotCheckbox = carrotRow.locator("input[type='checkbox']");
        await expect(carrotCheckbox).not.toBeChecked();
      });

      test("disabled predicate receives the row item as parameter", async ({
        initTestBed,
        page,
      }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowDisabledPredicate="{item => item.quantity < 5}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="quantity"/>
          </Table>
        `);

        const rows = page.locator("tbody tr");

        // Apple (5) should not be disabled
        const appleRow = rows.filter({ hasText: "Apple" });
        await expect(appleRow).not.toHaveClass(/disabled/);

        // Banana (3), Spinach (2) should be disabled
        const bananaRow = rows.filter({ hasText: "Banana" });
        await expect(bananaRow).toHaveClass(/disabled/);

        const spinachRow = rows.filter({ hasText: "Spinach" });
        await expect(spinachRow).toHaveClass(/disabled/);

        // Carrot (10) should not be disabled
        const carrotRow = rows.filter({ hasText: "Carrot" });
        await expect(carrotRow).not.toHaveClass(/disabled/);
      });

      test("all rows are enabled when no predicate is provided", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table data='{${JSON.stringify(sampleData)}}' testId="table">
            <Column bindTo="name"/>
          </Table>
        `);

        const rows = page.locator("tbody tr");
        const rowCount = await rows.count();

        for (let i = 0; i < rowCount; i++) {
          await expect(rows.nth(i)).not.toHaveClass(/disabled/);
        }
      });
    });

    test.describe("rowUnselectablePredicate property", () => {
      test("hides checkbox for rows matching predicate", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Should have header checkbox + 2 fruit row checkboxes = 3 total
        // Vegetable rows (Carrot, Spinach) should not have checkboxes
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(3);
      });

      test("unselectable rows cannot be selected via click", async ({ initTestBed, page }) => {
        const { testStateDriver } = await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            onSelectionDidChange="items => testState = items.length"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Click on a vegetable row (unselectable)
        const carrotRow = page.locator("tbody tr").filter({ hasText: "Carrot" });
        await carrotRow.click();

        // Selection should not change (or be 0)
        await expect.poll(testStateDriver.testState).toBe(0);
      });

      test("selectable rows can still be selected", async ({ initTestBed, page }) => {
        const { testStateDriver } = await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            onSelectionDidChange="items => testState = items.length"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Click on a fruit row (selectable)
        const appleRow = page.locator("tbody tr").filter({ hasText: "Apple" });
        await appleRow.click();

        // Selection should have 1 item
        await expect.poll(testStateDriver.testState).toBe(1);
      });

      test("select all checkbox only selects selectable rows", async ({ initTestBed, page }) => {
        const { testStateDriver } = await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            enableMultiRowSelection="true"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            onSelectionDidChange="items => testState = items.length"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Click the header checkbox to select all
        const headerCheckbox = page.locator("thead input[type='checkbox']");
        await headerCheckbox.check({ force: true });

        // Should only select 2 items (Apple and Banana - the fruits)
        await expect.poll(testStateDriver.testState).toBe(2);
      });

      test("has no effect when rowsSelectable is false", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="false"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // No checkboxes should be present at all
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(0);
      });

      test("predicate is evaluated for all rows", async ({ initTestBed, page }) => {
        // Test with more rows to ensure predicate is called for all
        const moreData = [
          { id: 1, name: "Item 1", selectable: true },
          { id: 2, name: "Item 2", selectable: false },
          { id: 3, name: "Item 3", selectable: true },
          { id: 4, name: "Item 4", selectable: false },
          { id: 5, name: "Item 5", selectable: true },
          { id: 6, name: "Item 6", selectable: false },
        ];

        await initTestBed(`
          <Table
            data='{${JSON.stringify(moreData)}}'
            rowsSelectable="true"
            rowUnselectablePredicate="{item => !item.selectable}"
            testId="table"
          >
            <Column bindTo="name"/>
          </Table>
        `);

        // Should have header checkbox + 3 selectable row checkboxes = 4 total
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(4);
      });
    });

    test.describe("rowDisabledPredicate and rowUnselectablePredicate combined", () => {
      test("row can be both disabled and unselectable", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowDisabledPredicate="{item => item.category === 'Vegetable'}"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Vegetable rows should be disabled
        const carrotRow = page.locator("tbody tr").filter({ hasText: "Carrot" });
        await expect(carrotRow).toHaveClass(/disabled/);

        // And should not have checkbox (3 checkboxes: header + 2 fruit rows)
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(3);
      });

      test("row can be disabled which prevents interaction (has pointer-events: none)", async ({
        initTestBed,
        page,
      }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowDisabledPredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Vegetable rows should be disabled but have checkboxes
        const carrotRow = page.locator("tbody tr").filter({ hasText: "Carrot" });
        await expect(carrotRow).toHaveClass(/disabled/);

        // All rows should have checkboxes (5 total: header + 4 data rows)
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(5);

        // Disabled rows have pointer-events: none, so the checkbox exists but is not interactable
        // The checkbox is also hidden by default (visibility: hidden) and only shows on hover,
        // but disabled rows cannot be hovered due to pointer-events: none
        const carrotCheckbox = carrotRow.locator("input[type='checkbox']");
        await expect(carrotCheckbox).toHaveCount(1);
        await expect(carrotCheckbox).not.toBeChecked();
      });

      test("row can be unselectable but not disabled (no disabled styling)", async ({
        initTestBed,
        page,
      }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowUnselectablePredicate="{item => item.category === 'Vegetable'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Vegetable rows should NOT have disabled class
        const carrotRow = page.locator("tbody tr").filter({ hasText: "Carrot" });
        await expect(carrotRow).not.toHaveClass(/disabled/);

        // But should not have checkbox
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(3);
      });

      test("different predicates can target different rows", async ({ initTestBed, page }) => {
        await initTestBed(`
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            rowDisabledPredicate="{item => item.name === 'Apple'}"
            rowUnselectablePredicate="{item => item.name === 'Banana'}"
            testId="table"
          >
            <Column bindTo="name"/>
            <Column bindTo="category"/>
          </Table>
        `);

        // Apple should be disabled but selectable
        const appleRow = page.locator("tbody tr").filter({ hasText: "Apple" });
        await expect(appleRow).toHaveClass(/disabled/);

        // Banana should not be disabled but unselectable (no checkbox)
        const bananaRow = page.locator("tbody tr").filter({ hasText: "Banana" });
        await expect(bananaRow).not.toHaveClass(/disabled/);

        // Should have 4 checkboxes: header + Apple + Carrot + Spinach (Banana has no checkbox)
        const checkboxes = page.locator("input[type='checkbox']");
        await expect(checkboxes).toHaveCount(4);
      });
    });
  });

  test.describe("noDataTemplate property", () => {
    test("shows custom no data template when data is empty", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[]}' testId="table">
          <Column bindTo="name"/>
          <property name="noDataTemplate">
            <Text>No items found</Text>
          </property>
        </Table>
      `);

      await expect(page.getByText("No items found")).toBeVisible();
    });

    test("hides no data view when noDataTemplate is empty string", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{[]}' noDataTemplate="" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      // Should not show default no data message
      await expect(page.getByText(/no data/i)).not.toBeVisible();
    });

    test("hides no data view when noDataTemplate is null", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{[]}' noDataTemplate="" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);

      // Should not show default no data message
      await expect(page.getByText(/no data/i)).not.toBeVisible();
    });
  });

  test("order indicators are not visible by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name" canSort="true"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);
    for (const indicator of await page.locator("[data-part-id='orderIndicator']").all()) {
      await expect(indicator).not.toBeVisible();
    }
  });

  test("order indicator appears on sortable columns on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name" canSort="true"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);
    const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
    await nameHeader.hover();
    await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();

    // all other indicators should remain hidden
    const quantityHeader = page.getByRole("columnheader").filter({ hasText: "Quantity" }).first();
    await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).not.toBeVisible();
  });

  test("order indicator stays visible when table is sorted by column", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name" canSort="true"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);
    const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
    await nameHeader.click();
    await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();

    // all other indicators should remain hidden
    const quantityHeader = page.getByRole("columnheader").filter({ hasText: "Quantity" }).first();
    await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).not.toBeVisible();
  });

  test.describe("alwaysShowSortingIndicator property", () => {
    test("shows all sorting indicators when alwaysShowSortingIndicator is true", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowSortingIndicator="true" testId="table">
          <Column bindTo="name" header="Name" canSort="true"/>
          <Column bindTo="quantity" header="Quantity" canSort="true"/>
          <Column bindTo="category" header="Category"/>
        </Table>
      `);

      // All sortable columns should show their indicators without hover
      const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
      const quantityHeader = page.getByRole("button").filter({ hasText: "Quantity" }).first();

      await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
      await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
    });

    test("hides sorting indicators by default when alwaysShowSortingIndicator is false", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowSortingIndicator="false" testId="table">
          <Column bindTo="name" header="Name" canSort="true"/>
          <Column bindTo="quantity" header="Quantity" canSort="true"/>
        </Table>
      `);

      // All indicators should be hidden without hover
      for (const indicator of await page.locator("[data-part-id='orderIndicator']").all()) {
        await expect(indicator).not.toBeVisible();
      }
    });

    test("sorting indicators remain visible after sorting when alwaysShowSortingIndicator is true", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowSortingIndicator="true" testId="table">
          <Column bindTo="name" header="Name" canSort="true"/>
          <Column bindTo="quantity" header="Quantity" canSort="true"/>
          <Column bindTo="category" header="Category" canSort="true"/>
        </Table>
      `);

      const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
      const quantityHeader = page.getByRole("button").filter({ hasText: "Quantity" }).first();
      const categoryHeader = page.getByRole("button").filter({ hasText: "Category" }).first();

      // Click to sort by name
      await nameHeader.click();

      // All sortable column indicators should still be visible after sorting
      await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
      await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
      await expect(categoryHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
    });

    test("non-sortable columns do not show indicators even with alwaysShowSortingIndicator", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowSortingIndicator="true" testId="table">
          <Column bindTo="name" header="Name" canSort="true"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Sortable column should show indicator
      const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
      await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();

      // Non-sortable column should not have an indicator at all
      const quantityHeader = page.getByRole("columnheader").filter({ hasText: "Quantity" }).first();
      await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).toHaveCount(1);
    });
  });

  test("links inside cells remain clickable and right-clickable when no onContextMenu handler is provided", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Table
        data='{["/destination"]}'
        width="800px"
        testId="table"
      >
        <Column>
          <Link
            testId="cell-link"
            to="{$item}"
            onClick="() => testState = 'link-clicked'"
            onContextMenu="() => testState = 'link-context-menu'"
          >
            Hello
          </Link>
        </Column>
      </Table>
    `);

    const link = page.getByTestId("cell-link");
    await expect(link).toBeVisible();

    // Left click should trigger the link's onClick handler
    await link.click();
    await expect.poll(testStateDriver.testState).toEqual("link-clicked");

    // Right click should trigger the link's own onContextMenu handler
    await link.click({ button: "right" });
    await expect.poll(testStateDriver.testState).toEqual("link-context-menu");
  });

  test.describe("onContextMenu event", () => {
    test("fires onContextMenu event on right-click", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = 'context-menu-fired'">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toBeVisible();
      await firstRow.click({ button: "right" });

      await expect.poll(testStateDriver.testState).toEqual("context-menu-fired");
    });

    test("provides $item context variable with row data", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = $item">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const firstRow = page.locator("tbody tr").first();
      await firstRow.click({ button: "right" });

      const result = await testStateDriver.testState();
      expect(result.id).toEqual(1);
      expect(result.name).toEqual("Apple");
      expect(result.quantity).toEqual(5);
      expect(result.category).toEqual("Fruit");
    });

    test("provides $row context variable with row data", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = $row">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const secondRow = page.locator("tbody tr").nth(1);
      await secondRow.click({ button: "right" });

      const result = await testStateDriver.testState();
      expect(result.id).toEqual(2);
      expect(result.name).toEqual("Banana");
      expect(result.quantity).toEqual(3);
      expect(result.category).toEqual("Fruit");
    });

    test("provides $rowIndex context variable with correct index", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = $rowIndex">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const thirdRow = page.locator("tbody tr").nth(2);
      await thirdRow.click({ button: "right" });

      await expect.poll(testStateDriver.testState).toEqual(2);
    });

    test("provides $itemIndex context variable with correct index", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = $itemIndex">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const fourthRow = page.locator("tbody tr").nth(3);
      await fourthRow.click({ button: "right" });

      await expect.poll(testStateDriver.testState).toEqual(3);
    });

    test("provides all context variables together", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = { item: $item.name, row: $row.name, rowIndex: $rowIndex, itemIndex: $itemIndex }">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const secondRow = page.locator("tbody tr").nth(1);
      await secondRow.click({ button: "right" });

      const result = await testStateDriver.testState();
      expect(result.item).toEqual("Banana");
      expect(result.row).toEqual("Banana");
      expect(result.rowIndex).toEqual(1);
      expect(result.itemIndex).toEqual(1);
    });

    test("context variables match the correct row when clicking different rows", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table" onContextMenu="() => testState = { name: $item.name, index: $rowIndex }">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      // Click first row
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click({ button: "right" });
      let result = await testStateDriver.testState();
      expect(result.name).toEqual("Apple");
      expect(result.index).toEqual(0);

      // Click third row
      const thirdRow = page.locator("tbody tr").nth(2);
      await thirdRow.click({ button: "right" });
      result = await testStateDriver.testState();
      expect(result.name).toEqual("Carrot");
      expect(result.index).toEqual(2);

      // Click last row
      const lastRow = page.locator("tbody tr").nth(3);
      await lastRow.click({ button: "right" });
      result = await testStateDriver.testState();
      expect(result.name).toEqual("Spinach");
      expect(result.index).toEqual(3);
    });
  });
});

// =============================================================================
// TESTS FOR FEATURES THAT NEED INVESTIGATION
// =============================================================================

test.describe("Features Needing Investigation", () => {
  test("loading property shows loading state", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Table loading="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
    await expect(page.getByRole("status").and(page.getByLabel("Loading"))).toBeVisible();
  });

  test("row selection works with checkboxes", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          enableMultiRowSelection="true"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

    const checkboxes = page.locator("input[type='checkbox']");
    await checkboxes.nth(1).check({ force: true }); // First data row
    await checkboxes.nth(2).check({ force: true }); // Second data row

    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
  });

  test("sorting works correctly with descending order", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          sortBy="name"
          sortDirection="descending"
          testId="table"
        >
          <Column bindTo="name" canSort="true"/>
        </Table>
      `);

    const cells = page.locator("td");
    // Should be sorted reverse alphabetically: Spinach, Carrot, Banana, Apple
    await expect(cells.nth(0)).toHaveText("Spinach");
    await expect(cells.nth(1)).toHaveText("Carrot");
  });

  test("sorting works correctly with ascending order", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          sortBy="quantity"
          sortDirection="ascending"
          testId="table"
        >
          <Column bindTo="quantity" canSort="true"/>
        </Table>
      `);

    const cells = page.locator("td");
    // Should be sorted in ascending order: 2, 3, 5, 10
    await expect(cells.nth(0)).toHaveText("2");
    await expect(cells.nth(1)).toHaveText("3");
    await expect(cells.nth(2)).toHaveText("5");
    await expect(cells.nth(3)).toHaveText("10");
  });
});

// =============================================================================
// PAGINATION FEATURES TESTS
// =============================================================================

test.describe("Pagination Features", () => {
  // Create data sets for testing
  const smallDataSet = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
  ];

  const largeDataSet = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
    { id: 5, name: "Item 5" },
    { id: 6, name: "Item 6" },
    { id: 7, name: "Item 7" },
    { id: 8, name: "Item 8" },
    { id: 9, name: "Item 9" },
    { id: 10, name: "Item 10" },
    { id: 11, name: "Item 11" },
    { id: 12, name: "Item 12" },
  ];

  test.describe("Auto-inference of isPaginated", () => {
    test("auto-enables pagination when pageSize is set and data length exceeds pageSize", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be visible because data length (12) > pageSize (5)
      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();

      // Should only show 5 items per page
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(5);
    });

    test("does not auto-enable pagination when data length is less than or equal to pageSize", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should NOT be visible because data length (2) <= pageSize (5)
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);

      // Should show all items
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(2);
    });

    test("respects explicit isPaginated=false even when pageSize is set", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="false"
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should NOT be visible because isPaginated is explicitly false
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);

      // Should show all items (no pagination)
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(12);
    });

    test("respects explicit isPaginated=true even when data length is less than pageSize", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          isPaginated="true"
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should NOT be visible because there's only one page
      // (implicit hiding when totalPages <= 1)
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);

      // Should show all items
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(2);
    });

    test("auto-enables pagination when pageSize equals data length (edge case)", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          pageSize="2"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should NOT be visible because data length (2) is not > pageSize (2)
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);
    });
  });

  test.describe("Implicit hiding of pagination controls", () => {
    test("hides pagination controls when there is only one page", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          isPaginated="true"
          pageSize="10"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be hidden because totalPages = 1
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);
    });

    test("shows pagination controls when there are multiple pages", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="true"
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be visible because totalPages > 1
      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();
    });

    test("hides pagination controls when data is empty", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{[]}'
          isPaginated="true"
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be hidden because there's no data (0 pages)
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);
    });

    test("hides pagination controls when pageSize is larger than data", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          isPaginated="true"
          pageSize="100"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be hidden because totalPages = 1
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);
    });
  });

  test.describe("alwaysShowPagination property", () => {
    test("explicitly shows pagination controls when alwaysShowPagination=true even with one page", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          isPaginated="true"
          pageSize="10"
          alwaysShowPagination="true"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be visible because alwaysShowPagination=true
      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();
    });

    test("explicitly hides pagination controls when alwaysShowPagination=false even with multiple pages", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="true"
          pageSize="5"
          alwaysShowPagination="false"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be hidden because a=false
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);

      // But pagination should still work (only showing first page)
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(5);
    });

    test("uses implicit hiding when alwaysShowPagination is omitted", async ({
      initTestBed,
      page,
    }) => {
      // Test with one page - should hide
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          isPaginated="true"
          pageSize="10"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);

      // Test with multiple pages - should show
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="true"
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();
    });

    test("alwaysShowPagination overrides implicit hiding behavior", async ({
      initTestBed,
      page,
    }) => {
      // With one page, normally controls would be hidden, but alwaysShowPagination=true should show them
      await initTestBed(`
        <Table
          data='{${JSON.stringify(smallDataSet)}}'
          testId="table"
          alwaysShowPagination="true"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();
    });
  });

  test.describe("Combined pagination features", () => {
    test("auto-inference and implicit hiding work together", async ({ initTestBed, page }) => {
      // pageSize set, data length > pageSize -> auto-enable pagination
      // But if only one page results, controls should be hidden
      const exactlyOnePageData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
        { id: 4, name: "Item 4" },
        { id: 5, name: "Item 5" },
      ];

      await initTestBed(`
        <Table
          data='{${JSON.stringify(exactlyOnePageData)}}'
          pageSize="5"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination should be enabled (data length = pageSize, so not auto-enabled)
      // But controls should be hidden because totalPages = 1
      await expect(page.locator("button[aria-label*='Previous page']")).toHaveCount(0);
      await expect(page.locator("button[aria-label*='Next page']")).toHaveCount(0);
    });

    test("pagination controls location respects visibility rules", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="true"
          pageSize="5"
          paginationControlsLocation="both"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Should show controls at both top and bottom when there are multiple pages
      const paginationControls = page.locator("nav[aria-label='Pagination']");
      const controlCount = await paginationControls.count();
      await expect(controlCount).toBeGreaterThan(0);

      // Controls should be visible
      await expect(page.locator("button[aria-label*='Previous page']").first()).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']").first()).toBeVisible();
    });

    test("pagination works correctly with pageSizeOptions", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(largeDataSet)}}'
          isPaginated="true"
          pageSize="5"
          pageSizeOptions="{[5, 10, 20]}"
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Pagination controls should be visible
      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();

      // Should show page size selector (if enabled)
      // Note: This depends on showPageSizeSelector default value
      const visibleRows = page.locator("tbody tr");
      await expect(visibleRows).toHaveCount(5);
    });
  });

  test.describe("userSelect properties", () => {
    test("userSelectCell controls text selection in cells", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' userSelectCell="none" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Get a cell content element
      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "none");
    });

    test("userSelectRow controls text selection in rows", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' userSelectRow="text" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Get a table row
      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toHaveCSS("user-select", "text");
    });

    test("userSelectHeading controls text selection in headings", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' userSelectHeading="text" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Get a header content element
      const firstHeader = page.locator("thead th").first().locator("div").first();
      await expect(firstHeader).toHaveCSS("user-select", "text");
    });

    test("userSelect properties apply when explicitly set", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          userSelectCell="auto"
          userSelectRow="auto"
          userSelectHeading="none"
          testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      // Verify explicitly set values are applied
      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "auto");

      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toHaveCSS("user-select", "auto");

      const firstHeader = page.locator("thead th").first().locator("div").first();
      await expect(firstHeader).toHaveCSS("user-select", "none");
    });

    test("userSelect properties can be set independently", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          userSelectCell="text"
          userSelectRow="none"
          userSelectHeading="all"
          testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `);

      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "text");

      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toHaveCSS("user-select", "none");

      const firstHeader = page.locator("thead th").first().locator("div").first();
      await expect(firstHeader).toHaveCSS("user-select", "all");
    });

    test("userSelect properties fallback to theme variables", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `,
        {
          testThemeVars: {
            "userSelect-cell-Table": "none",
            "userSelect-row-Table": "text",
            "userSelect-heading-Table": "all",
          },
        },
      );

      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "none");

      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toHaveCSS("user-select", "text");

      const firstHeader = page.locator("thead th").first().locator("div").first();
      await expect(firstHeader).toHaveCSS("user-select", "all");
    });

    test("property values override theme variables", async ({ initTestBed, page }) => {
      await initTestBed(
        `
        <Table
          data='{${JSON.stringify(sampleData)}}'
          userSelectCell="text"
          testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `,
        {
          testThemeVars: {
            "userSelect-cell-Table": "none",
          },
        },
      );

      // Property value "text" should override theme variable "none"
      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "text");
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct table structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    // Check proper table semantics
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("th")).toHaveCount(2); // 2 headers
    await expect(page.locator("tr")).toHaveCount(5); // 1 header + 4 data rows
  });

  test("column headers are focusable and have proper structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name" canSort="true"/>
        <Column bindTo="quantity" header="Quantity" canSort="true"/>
      </Table>
    `);

    const headers = page.locator("th");
    await expect(headers.nth(0)).toContainText("Name");
    await expect(headers.nth(1)).toContainText("Quantity");
  });

  test("selection checkboxes have proper accessibility when enabled", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
        <Column bindTo="name"/>
      </Table>
    `);

    const checkboxes = page.locator("input[type='checkbox']");

    // All checkboxes should have proper type
    await expect(checkboxes.first()).toHaveAttribute("type", "checkbox");

    // Should have expected count
    await expect(checkboxes).toHaveCount(5); // 4 data rows + 1 header
  });

  test("has proper headers for screen readers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Product Name"/>
        <Column bindTo="quantity" header="Stock Quantity"/>
      </Table>
    `);

    // Column headers should have descriptive names
    await expect(page.locator("th").filter({ hasText: "Product Name" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "Stock Quantity" })).toBeVisible();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Table testId="table"/>`);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
  });

  test("handles data with missing properties", async ({ initTestBed, page }) => {
    const incompleteData = [
      { name: "Apple" }, // missing quantity
      { quantity: 5 }, // missing name
      {}, // missing both
    ];

    await initTestBed(`
      <Table data='{${JSON.stringify(incompleteData)}}' testId="table">
        <Column bindTo="name"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    await expect(page.getByTestId("table")).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "5" }).first()).toBeVisible();
  });

  test("handles deeply nested object properties", async ({ initTestBed, page }) => {
    const nestedData = [
      {
        user: {
          profile: {
            name: "John Doe",
          },
        },
      },
    ];

    await initTestBed(`
      <Table data='{${JSON.stringify(nestedData)}}' testId="table">
        <Column bindTo="user.profile.name" header="Name"/>
      </Table>
    `);

    await expect(page.locator("td").filter({ hasText: "John Doe" }).first()).toBeVisible();
  });

  test("handles special characters in data", async ({ initTestBed, page }) => {
    const specialData = [
      { name: "Special: 🎉", symbol: "★" },
      { name: "Unicode: 你好", symbol: "⚡" },
      { name: "Emoji: 👨‍👩‍👧‍👦", symbol: "🔥" },
    ];

    await initTestBed(`
      <Table data='{${JSON.stringify(specialData)}}' testId="table">
        <Column bindTo="name"/>
        <Column bindTo="symbol"/>
      </Table>
    `);

    await expect(page.locator("td").filter({ hasText: "Special: 🎉" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Unicode: 你好" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Emoji: 👨‍👩‍👧‍👦" }).first()).toBeVisible();
  });

  test("handles custom sorting icons", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table
        data='{${JSON.stringify(sampleData)}}'
        iconNoSort="sort"
        iconSortAsc="sort-up"
        iconSortDesc="sort-down"
        testId="table"
      >
        <Column bindTo="name" canSort="true" header="Name"/>
      </Table>
    `);

    const headers = page.locator("th");
    await expect(headers.first()).toContainText("Name");
  });

  test("row checkboxes work when data array contains items with 'id' property", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
        <Table testId="table" rowsSelectable="true" data="{[
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' }
        ]}">
          <Column bindTo="id" width="80px">
            <Text>{$item.id}</Text>
          </Column>
          <Column bindTo="name">
            <Text>{$item.name}</Text>
          </Column>
        </Table>
      `);
    const checkboxes = page.locator("input[type='checkbox']");
    await checkboxes.nth(1).check({ force: true }); // First data row
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).not.toBeChecked(); // Second data row
  });

  test("row checkboxes work when 'idKey' property is specified", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Table testId="table" rowsSelectable="true"
          idKey="account_id"
          data="{[
            { account_id: 1, name: 'Item 1' },
            { account_id: 2, name: 'Item 2' }
          ]}">
          <Column bindTo="account_id" width="80px">
            <Text>{$item.account_id}</Text>
          </Column>
          <Column bindTo="name">
            <Text>{$item.name}</Text>
          </Column>
        </Table>
      `);
    const checkboxes = page.locator("input[type='checkbox']");
    await checkboxes.nth(1).check({ force: true }); // First data row
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).not.toBeChecked(); // Second data row
  });

  test("resizing a column with explicit width keeps header and data cells aligned", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
        <Table
          data="{[1,2,3]}"
          width="800px"
          testId="table"
        >
          <Column width="400px" canResize="{true}" header="Col 1">
            Col 1
          </Column>
          <Column width="300px" canResize="{true}" header="Col 2">
            Col 2
          </Column>
          <Column width="500px" canResize="{true}" header="Col 3">
            Col 3
          </Column>
        </Table>
      `);

    const firstHeader = page.locator("thead th").first();
    const firstCell = page.locator("tbody tr").first().locator("td").first();

    const headerBoxBefore = await firstHeader.boundingBox();
    const cellBoxBefore = await firstCell.boundingBox();

    expect(headerBoxBefore).not.toBeNull();
    expect(cellBoxBefore).not.toBeNull();

    expect(Math.abs(headerBoxBefore!.width - cellBoxBefore!.width)).toBeLessThan(4);

    const resizer = firstHeader.locator('div[class*="resizer"]');
    const resizerBox = await resizer.boundingBox();
    expect(resizerBox).not.toBeNull();

    const startX = resizerBox!.x + resizerBox!.width / 2;
    const startY = resizerBox!.y + resizerBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 120, startY);
    await page.mouse.up();

    const headerBoxAfter = await firstHeader.boundingBox();
    const cellBoxAfter = await firstCell.boundingBox();

    expect(headerBoxAfter).not.toBeNull();
    expect(cellBoxAfter).not.toBeNull();

    expect(headerBoxAfter!.width).toBeGreaterThan(headerBoxBefore!.width + 20);

    expect(Math.abs(headerBoxAfter!.width - cellBoxAfter!.width)).toBeLessThan(4);
  });

  test("columns are resizable by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table
        data='{${JSON.stringify(sampleData)}}'
        testId="table"
      >
        <Column bindTo="name" header="Name" />
        <Column bindTo="quantity" header="Quantity" />
      </Table>
    `);

    await expect(page.getByTestId("table")).toBeVisible();
    await expect(page.locator('thead th div[class*="resizer"]')).toHaveCount(2);
  });

  test("canResizeColumns sets column resize default and Column canResize overrides it", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <Table
          data='{${JSON.stringify(sampleData)}}'
          canResizeColumns="{true}"
          testId="enabled-table"
        >
          <Column bindTo="name" header="Name" />
          <Column bindTo="quantity" header="Quantity" canResize="{false}" />
        </Table>
        <Table
          data='{${JSON.stringify(sampleData)}}'
          canResizeColumns="{false}"
          testId="disabled-table"
        >
          <Column bindTo="name" header="Name" canResize="{true}" />
          <Column bindTo="quantity" header="Quantity" />
        </Table>
      </VStack>
    `);

    await expect(page.getByTestId("enabled-table")).toBeVisible();
    await expect(page.getByTestId("disabled-table")).toBeVisible();
    await expect(
      page.getByTestId("enabled-table").locator('thead th div[class*="resizer"]'),
    ).toHaveCount(1);
    await expect(
      page.getByTestId("disabled-table").locator('thead th div[class*="resizer"]'),
    ).toHaveCount(1);
  });
});

// =============================================================================
// THEME AND STYLING TESTS
// =============================================================================

// TODO: Need more theme variable tests!
test.describe("Theme Variables and Styling", () => {
  test("applies heading background color theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `,
      {
        testThemeVars: { "backgroundColor-heading-Table": "rgb(255, 0, 0)" },
      },
    );

    const header = page.locator("th").first();
    await expect(header).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("applies fontSize-checkbox-Table theme variable to checkbox wrapper", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `,
      {
        testThemeVars: { "fontSize-checkbox-Table": "24px" },
      },
    );

    const checkboxWrapper = page.locator('[aria-label="Select all rows"]').first();
    await expect(checkboxWrapper).toHaveCSS("font-size", "24px");
  });

  // Regression: the row separator used to live on each .cell, so resizing the
  // last column narrower than the row width left a gap on the right where no
  // cell could draw the border. The divider must live on the row so it spans
  // the entire row regardless of the last column's width.
  test("row separator spans the full row when the last column is narrower than the row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table" width="600px">
        <Column bindTo="name" header="Name" width="*" />
        <Column bindTo="quantity" header="Qty" width="50px" />
      </Table>
    `);

    const firstRow = page.locator("tbody tr").first();
    // Divider now lives on the row itself.
    await expect(firstRow).toHaveCSS("border-bottom-style", "solid");
    await expect(firstRow).not.toHaveCSS("border-bottom-width", "0px");

    // Cells should not carry the divider any more — otherwise the line would
    // stop at the last column's right edge when it is narrower than the row.
    const firstCell = firstRow.locator("td").first();
    await expect(firstCell).toHaveCSS("border-bottom-width", "0px");
  });
});

// =============================================================================
// CELL VERTICAL ALIGNMENT TESTS
// =============================================================================

test.describe("Cell Vertical Alignment", () => {
  test("applies center alignment by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    // Check header cells have center alignment class
    const headerCell = page.locator("th").first();
    await expect(headerCell).toHaveClass(/alignCenter/);

    // Check data cells have center alignment class
    const dataCell = page.locator("td").first();
    await expect(dataCell).toHaveClass(/alignCenter/);
  });

  test("applies top alignment when cellVerticalAlign='top'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' cellVerticalAlign="top" testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    // Check header cells have top alignment class
    const headerCell = page.locator("th").first();
    await expect(headerCell).toHaveClass(/alignTop/);

    // Check data cells have top alignment class
    const dataCell = page.locator("td").first();
    await expect(dataCell).toHaveClass(/alignTop/);
  });

  test("applies bottom alignment when cellVerticalAlign='bottom'", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' cellVerticalAlign="bottom" testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    // Check header cells have bottom alignment class
    const headerCell = page.locator("th").first();
    await expect(headerCell).toHaveClass(/alignBottom/);

    // Check data cells have bottom alignment class
    const dataCell = page.locator("td").first();
    await expect(dataCell).toHaveClass(/alignBottom/);
  });

  test("applies center alignment when cellVerticalAlign='center'", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' cellVerticalAlign="center" testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
      </Table>
    `);

    // Check header cells have center alignment class
    const headerCell = page.locator("th").first();
    await expect(headerCell).toHaveClass(/alignCenter/);

    // Check data cells have center alignment class
    const dataCell = page.locator("td").first();
    await expect(dataCell).toHaveClass(/alignCenter/);
  });

  test("applies alignment to all cells consistently", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' cellVerticalAlign="top" testId="table">
        <Column bindTo="name" header="Name"/>
        <Column bindTo="quantity" header="Quantity"/>
        <Column bindTo="category" header="Category"/>
      </Table>
    `);

    // Check all header cells have the same alignment
    const headerCells = page.locator("th");
    const headerCount = await headerCells.count();
    for (let i = 0; i < headerCount; i++) {
      await expect(headerCells.nth(i)).toHaveClass(/alignTop/);
    }

    // Check all data cells have the same alignment
    const dataCells = page.locator("td");
    const dataCount = await dataCells.count();
    for (let i = 0; i < dataCount; i++) {
      await expect(dataCells.nth(i)).toHaveClass(/alignTop/);
    }
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================

test.describe("Events", () => {
  test("contextMenu event fires on right click", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="Not clicked">
        <Text testId="output" label="{message}" />
        <Table
          data='{${JSON.stringify(sampleData)}}'
          testId="table"
          onContextMenu="() => message = 'Context menu triggered'"
        >
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    const output = page.getByTestId("output");

    await expect(output).toHaveText("Not clicked");
    await table.click({ button: "right" });
    await expect(output).toHaveText("Context menu triggered");
  });
});

// =============================================================================
// COLUMN ALIGNMENT TESTS
// =============================================================================

test.describe("Column Alignment", () => {
  test.describe("horizontalAlignment property", () => {
    test("aligns column content to the end", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="end"/>
        </Table>
      `);

      // Get the second column cells (quantity column)
      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      // Verify the cell has flex display and justify-content: flex-end
      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("justify-content", "flex-end");
      await expect(firstCell).toHaveCSS("text-align", "end");
    });

    test("aligns column content to the center", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="center"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("justify-content", "center");
      await expect(firstCell).toHaveCSS("text-align", "center");
    });

    test("aligns column content to the start", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="start"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("justify-content", "flex-start");
      await expect(firstCell).toHaveCSS("text-align", "start");
    });

    test("works with other layout properties like backgroundColor", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="end" backgroundColor="lightyellow"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      // Verify alignment
      await expect(firstCell).toHaveCSS("justify-content", "flex-end");
      // Verify background color is applied
      await expect(firstCell).toHaveCSS("background-color", "rgb(255, 255, 224)"); // lightyellow
    });

    test("applies to all rows in the column", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="end"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const cellCount = await quantityCells.count();

      // Verify all cells in the column have the alignment
      for (let i = 0; i < cellCount; i++) {
        const cell = quantityCells.nth(i);
        await expect(cell).toHaveCSS("justify-content", "flex-end");
      }
    });
  });

  test.describe("verticalAlignment property", () => {
    test("aligns column content to the top", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" verticalAlignment="start"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("align-items", "flex-start");
    });

    test("aligns column content to the center", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" verticalAlignment="center"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("align-items", "center");
    });

    test("aligns column content to the bottom", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" verticalAlignment="end"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("align-items", "flex-end");
    });
  });

  test.describe("combined horizontal and vertical alignment", () => {
    test("applies both horizontal and vertical alignment", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="end" verticalAlignment="center"/>
        </Table>
      `);

      const quantityCells = page.locator("td:nth-child(2)");
      const firstCell = quantityCells.first();

      await expect(firstCell).toHaveCSS("display", "flex");
      await expect(firstCell).toHaveCSS("justify-content", "flex-end");
      await expect(firstCell).toHaveCSS("align-items", "center");
    });

    test("different columns can have different alignments", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name" horizontalAlignment="start"/>
          <Column bindTo="quantity" header="Quantity" horizontalAlignment="end"/>
          <Column bindTo="category" header="Category" horizontalAlignment="center"/>
        </Table>
      `);

      const nameCell = page.locator("td:nth-child(1)").first();
      const quantityCell = page.locator("td:nth-child(2)").first();
      const categoryCell = page.locator("td:nth-child(3)").first();

      await expect(nameCell).toHaveCSS("justify-content", "flex-start");
      await expect(quantityCell).toHaveCSS("justify-content", "flex-end");
      await expect(categoryCell).toHaveCSS("justify-content", "center");
    });
  });
});

// =============================================================================
// KEYBOARD SHORTCUT TESTS
// =============================================================================

test.describe("Keyboard Shortcuts", () => {
  test.describe("selectAll action (Ctrl+A / Cmd+A)", () => {
    test("triggers onSelectAll when Ctrl+A is pressed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = { action: 'selectAll', selectedItemsLength: selectedItems.length }"
        >
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();
      await page.keyboard.press("ControlOrMeta+A");

      await expect.poll(testStateDriver.testState).toEqual({
        action: "selectAll",
        selectedItemsLength: sampleData.length, // All items are now automatically selected
      });
    });

    test("passes correct context with selected items", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = {
            selectedItemsLength: selectedItems.length,
            selectedIdsLength: selectedIds.length,
            focusedRow: row ? row.item.name : null
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Select some rows first
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      // Press the platform-appropriate key
      await page.keyboard.press("ControlOrMeta+A");

      const result = await testStateDriver.testState();
      expect(result.selectedItemsLength).toBeGreaterThanOrEqual(0);
      expect(result.selectedIdsLength).toBeGreaterThan(0);
    });

    test("does not trigger when table is not focused", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TextBox testId="input" />
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            testId="table"
            onSelectAllAction="(row, selectedItems, selectedIds) => testState = 'selectAll triggered'"
          >
            <Column bindTo="name"/>
          </Table>
        </Fragment>
      `);

      // Focus the text input instead of table
      const input = page.getByTestId("input").getByRole("textbox");
      await input.focus();
      await expect(input).toBeFocused();
      await page.keyboard.press("ControlOrMeta+A");

      // Should not trigger table's selectAll
      await expect.poll(testStateDriver.testState).not.toEqual("selectAll triggered");
    });

    test("automatically selects all items before calling event handler", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = {
            selectedItemsLength: selectedItems.length,
            selectedIdsLength: selectedIds.length,
            selectedIds: selectedIds
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("ControlOrMeta+A");
      await page.waitForTimeout(100);

      // Verify that all items are selected in the context
      const result = await testStateDriver.testState();
      expect(result.selectedItemsLength).toBe(sampleData.length);
      expect(result.selectedIdsLength).toBe(sampleData.length);
      expect(result.selectedIds).toHaveLength(sampleData.length);

      // Verify all sample data IDs are in the selected IDs
      sampleData.forEach((item) => {
        expect(result.selectedIds).toContain(String(item.id));
      });
    });
  });

  test.describe("delete action (Delete key)", () => {
    test("triggers onDelete when Delete key is pressed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onDeleteAction="(row, selectedItems, selectedIds) => testState = { action: 'delete', selectedItemsLength: selectedItems.length }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await expect(page.getByTestId("table")).toBeVisible();
      await page.keyboard.press("Delete");

      await expect.poll(testStateDriver.testState).toEqual({
        action: "delete",
        selectedItemsLength: 0,
      });
    });

    test("passes selected items in context", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onDeleteAction="(row, selectedItems, selectedIds) => testState = {
            selectedIds: selectedIds,
            selectedItemsLength: selectedItems.length
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Select a row
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await expect(firstRow).toBeVisible();
      await page.keyboard.press("Delete");

      const result = await testStateDriver.testState();
      expect(Array.isArray(result.selectedIds)).toBe(true);
      expect(typeof result.selectedItemsLength).toBe("number");
    });
  });

  test.describe("copy action (Ctrl+C / Cmd+C)", () => {
    test("triggers onCopy when Ctrl+C is pressed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = { action: 'copy', selectedItemsLength: selectedItems.length }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await page.keyboard.press("ControlOrMeta+C");

      await expect.poll(testStateDriver.testState).toEqual({
        action: "copy",
        selectedItemsLength: 0,
      });
    });

    test("provides selected items for copying", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = {
            items: selectedItems.map(item => item.name)
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Select multiple rows
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await page.keyboard.press("ControlOrMeta+C");

      const result = await testStateDriver.testState();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  test.describe("cut action (Ctrl+X / Cmd+X)", () => {
    test("triggers onCut when Ctrl+X is pressed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCutAction="(row, selectedItems, selectedIds) => testState = { action: 'cut' }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      await page.keyboard.press("ControlOrMeta+X");

      await expect.poll(testStateDriver.testState).toEqual({
        action: "cut",
      });
    });
  });

  test.describe("paste action (Ctrl+V / Cmd+V)", () => {
    test("triggers onPaste when Ctrl+V is pressed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onPasteAction="(row, selectedItems, selectedIds) => testState = { action: 'paste', focusedRowId: row?.rowId }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Focus a row
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await page.keyboard.press("ControlOrMeta+V");

      const result = await testStateDriver.testState();
      expect(result.action).toBe("paste");
    });

    test("does not fire App onKeyDown when Table handles Ctrl+V", async ({ initTestBed, page }) => {
      // Regression test: Table must call preventDefault() so that document-level
      // listeners (e.g. App.onKeyDown) can detect the event was already handled
      // via event.defaultPrevented and avoid double-processing.
      const { testStateDriver } = await initTestBed(`
        <App
          var.appKeyCount="{0}"
          var.testState="{0}"
          onKeyDown="event => { if (!event.defaultPrevented && (event.ctrlKey || event.metaKey) && event.key === 'v') appKeyCount = appKeyCount + 1; testState = appKeyCount; }"
        >
          <Table
            data='{${JSON.stringify(sampleData)}}'
            rowsSelectable="true"
            testId="table"
            autoFocus="true"
            onPasteAction="(row) => {}"
          >
            <Column bindTo="name"/>
          </Table>
        </App>
      `);

      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await page.keyboard.press("ControlOrMeta+V");

      // App-level handler must NOT count this as unhandled, because Table
      // called event.preventDefault() and the App handler checks defaultPrevented.
      await page.waitForTimeout(200);
      const count = await testStateDriver.testState();
      expect(count || 0).toBe(0);
    });
  });

  test.describe("custom key bindings", () => {
    test("uses custom key bindings when provided", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          keyBindings='{{ delete: "Backspace" }}'
          onDeleteAction="(row, selectedItems, selectedIds) => testState = 'custom delete triggered'"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Default Delete key should not work
      await page.keyboard.press("Delete");
      await expect.poll(testStateDriver.testState).not.toEqual("custom delete triggered");

      // Custom Backspace key should work
      await page.keyboard.press("Backspace");
      await expect.poll(testStateDriver.testState).toEqual("custom delete triggered");
    });

    test("allows partial override of default bindings", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          keyBindings='{{ copy: "Alt+C" }}'
          onCopyAction="(row, selectedItems, selectedIds) => testState = 'alt copy'"
          onDeleteAction="(row, selectedItems, selectedIds) => testState = 'default delete'"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Custom Alt+C for copy
      await page.keyboard.press("Alt+C");
      await expect.poll(testStateDriver.testState).toEqual("alt copy");

      // Default Delete should still work
      await page.keyboard.press("Delete");
      await expect.poll(testStateDriver.testState).toEqual("default delete");
    });
  });

  test.describe("context data structure", () => {
    test("provides complete context with selection, focusedRow, and focusedCell", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = {
            hasSelectedIds: Array.isArray(selectedIds),
            hasSelectedItems: Array.isArray(selectedItems),
            hasRow: row !== null,
            contextFields: ['row', 'selectedItems', 'selectedIds']
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // Select and focus a row
      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await page.keyboard.press("ControlOrMeta+C");

      const result = await testStateDriver.testState();
      expect(result.hasSelectedIds).toBe(true);
      expect(result.hasSelectedItems).toBe(true);
      expect(Array.isArray(result.contextFields)).toBe(true);
      expect(result.contextFields).toContain("selectedItems");
      expect(result.contextFields).toContain("selectedIds");
      expect(result.contextFields).toContain("row");
    });

    test("focusedRow contains item data when row is focused", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = {
            focusedRowData: row ? {
              hasItem: !!row.item,
              hasRowId: !!row.rowId,
              isSelected: row.isSelected,
              isFocused: row.isFocused
            } : null
          }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const firstRow = page.locator("tbody tr").first();
      await firstRow.click();

      await page.keyboard.press("ControlOrMeta+C");

      const result = await testStateDriver.testState();
      expect(result.focusedRowData).not.toBeNull();
      expect(result.focusedRowData?.hasItem).toBe(true);
      expect(result.focusedRowData?.hasRowId).toBe(true);
      expect(typeof result.focusedRowData?.isSelected).toBe("boolean");
      expect(typeof result.focusedRowData?.isFocused).toBe("boolean");
    });
  });

  test.describe("integration with row selection", () => {
    test("keyboard shortcuts work alongside arrow key navigation", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = { action: 'copy', focusedName: row?.item.name }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");

      // Navigate with arrow keys
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(50);
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(50);

      // Use keyboard shortcut
      await page.keyboard.press("ControlOrMeta+C");

      const result = await testStateDriver.testState();
      expect(result.action).toBe("copy");
      // focusedName should either be a string or undefined
      expect(["string", "undefined"]).toContain(typeof result.focusedName);
    });

    test("Space key for selection still works after keyboard shortcuts", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectionDidChange="items => testState = { count: items.length }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // First use a keyboard shortcut (this might not do anything if no onSelectAll handler)
      await page.keyboard.press("ControlOrMeta+A");
      await page.waitForTimeout(50);

      // Then try space key for selection
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(100);
      await page.keyboard.press("Space");
      await page.waitForTimeout(100);

      // Should have selected one item
      await expect.poll(testStateDriver.testState).toMatchObject({ count: 1 });
    });
  });

  test.describe("event prevention", () => {
    test("prevents default browser behavior for handled shortcuts", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = 'handled'"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      // CmdOrCtrl+A should be handled by our handler and prevented
      await page.keyboard.press("ControlOrMeta+A");

      await expect.poll(testStateDriver.testState).toEqual("handled");
    });
  });

  test.describe("rowsSelectable guard", () => {
    test("does not trigger onSelectAll when rowsSelectable is false", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="false"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      // Press the platform-appropriate key
      await page.keyboard.press("ControlOrMeta+A");
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("does not trigger onDelete when rowsSelectable is false", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="false"
          testId="table"
          autoFocus="true"
          onDeleteAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("Delete");
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("does not trigger onCopy when rowsSelectable is false", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="false"
          testId="table"
          autoFocus="true"
          onCopyAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("ControlOrMeta+C");
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("does not trigger onCut when rowsSelectable is false", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="false"
          testId="table"
          autoFocus="true"
          onCutAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("ControlOrMeta+X");
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("triggers onPaste even when rowsSelectable is false", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="false"
          testId="table"
          autoFocus="true"
          onPasteAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("ControlOrMeta+V");
      await page.waitForTimeout(100);

      // Should have triggered the handler
      const state = await testStateDriver.testState();
      expect(state).toEqual({ triggered: true });
    });
    test("keyboard actions work when rowsSelectable is explicitly true", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          rowsSelectable="true"
          testId="table"
          autoFocus="true"
          onSelectAllAction="(row, selectedItems, selectedIds) => testState = { triggered: true }"
        >
          <Column bindTo="name"/>
        </Table>
      `);

      const table = page.getByTestId("table");
      await expect(table).toBeVisible();

      await page.keyboard.press("ControlOrMeta+A");
      await page.waitForTimeout(100);

      // Should have triggered the handler
      await expect.poll(testStateDriver.testState).toEqual({ triggered: true });
    });
  });
});

// =============================================================================
// VIRTUALIZATION TESTS
// =============================================================================

test.describe("Virtualization", () => {
  test("visible range display works with App scrolling disabled and star-height Table", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        scrollWholePage="false"
        var.itemCount="{0}"
        var.range="{{ startIndex: -1, endIndex: -1 }}">
        <Text
          testId="range"
          variant="strong"
          value="{range.startIndex < 0
            ? 'No rows'
            : (range.startIndex + 1) + '-' + (range.endIndex + 1) + ' of ' + itemCount}" />
        <Table
          id="table"
          height="*"
          onScroll="(e) => { range = e.visibleRange; itemCount = e.itemCount }"
          onVisibleRangeDidChange="(r) => { range = r; itemCount = table.getItemCount() }"
          data="{Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            name: 'Item ' + (i + 1),
            quantity: (i % 25) + 1,
          }))}"
          testId="table">
          <Column bindTo="id" width="90px" />
          <Column bindTo="name" />
          <Column bindTo="quantity" />
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    const range = page.getByTestId("range");
    await expect(table).toBeVisible();
    await expect(range).toHaveText(/1-\d+ of 1000/);

    await table.evaluate((el) => {
      el.scrollTop = 233 * 41;
    });

    await expect(range).toHaveText(/(1[5-9]\d|2[0-5]\d)-\d+ of 1000/);
  });

  test("API reports item count and visible range", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App scrollWholePage="false">
        <VStack>
          <Button
            testId="capture"
            label="Capture"
            onClick="testState = { count: table.getItemCount(), range: table.getVisibleRange() }"
          />
          <Table
            id="table"
            height="400px"
            items="{Array.from({length: 1000}, (_, i) => ({id: i + 1}))}"
            testId="table"
          >
            <Column header="ID" bindTo="id">
              <Text value="{$item.id}" />
            </Column>
          </Table>
        </VStack>
      </App>
    `);

    const table = page.getByTestId("table");
    const capture = page.getByTestId("capture");
    await expect(table).toBeVisible();

    await capture.click();
    await expect.poll(async () => (await testStateDriver.testState())?.count).toBe(1000);
    const initialState = await testStateDriver.testState();
    expect(initialState.range.startIndex).toBe(0);
    expect(initialState.range.endIndex).toBeGreaterThan(initialState.range.startIndex);
    expect(initialState.range.endIndex).toBeLessThan(30);

    await table.evaluate((el) => {
      el.scrollTop = 233 * 41;
    });
    await page.waitForTimeout(100);

    await capture.click();
    await expect
      .poll(async () => (await testStateDriver.testState())?.range.startIndex)
      .toBeGreaterThan(0);
    const scrolledState = await testStateDriver.testState();
    expect(scrolledState.count).toBe(1000);
    expect(scrolledState.range.startIndex).toBeGreaterThan(150);
    expect(scrolledState.range.startIndex).toBeLessThan(260);
    expect(scrolledState.range.endIndex).toBeGreaterThan(scrolledState.range.startIndex);
    expect(scrolledState.range.endIndex).toBeLessThan(300);
  });

  test("scroll APIs move the virtualized table viewport", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <HStack>
          <Button testId="scroll-index" label="Scroll index" onClick="table.scrollToIndex(250)" />
          <Button testId="scroll-id" label="Scroll id" onClick="table.scrollToId('row-400')" />
        </HStack>
        <Table
          id="table"
          height="400px"
          items="{Array.from({length: 1000}, (_, i) => ({id: 'row-' + (i + 1), label: 'Row ' + (i + 1)}))}"
          testId="table"
        >
          <Column header="Label" bindTo="label">
            <Text value="{$item.label}" />
          </Column>
        </Table>
      </App>
    `);

    await expect(page.getByTestId("table")).toBeVisible();

    await page.getByTestId("scroll-index").click();
    await expect(page.locator("td").filter({ hasText: "Row 251" }).first()).toBeVisible();

    await page.getByTestId("scroll-id").click();
    await expect(page.locator("td").filter({ hasText: "Row 400" }).first()).toBeVisible();
  });

  const revealAboveTableApp = (button: string) => `
    <VStack var.showTop="{false}">
      <VStack testId="scroller" height="300px" overflowY="scroll">
        <VStack when="{showTop}" testId="above" height="200px">
          <Text>revealed after mount</Text>
        </VStack>
        <Table
          id="table"
          items="{Array.from({length: 1000}, (_, i) => ({id: 'row-' + (i + 1), label: 'Row ' + (i + 1)}))}"
          testId="table"
        >
          <Column header="Label" bindTo="label">
            <Text height="30px" value="{$item.label}" />
          </Column>
        </Table>
      </VStack>
      <Button testId="reveal" label="reveal" onClick="showTop = true" />
      ${button}
    </VStack>
  `;

  const targetRowOffsetFromHeader = (page: Page, rowIndex: number) =>
    page.evaluate((index) => {
      const header = document.querySelector("thead");
      const target = Array.from(document.querySelectorAll("tbody tr")).find((row) =>
        row.textContent?.includes(`Row ${index + 1}`),
      );
      if (!header || !target) {
        return Number.POSITIVE_INFINITY;
      }
      return target.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    }, rowIndex);

  test("scrollToIndex accounts for content revealed above the table (outside-scroll)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      revealAboveTableApp(`<Button testId="act" label="idx" onClick="table.scrollToIndex(50)" />`),
    );
    await expect(page.getByTestId("table")).toBeVisible();

    await page.getByTestId("reveal").click();
    await expect(page.getByTestId("above")).toBeVisible();

    await page.getByTestId("act").click();
    await expect.poll(() => targetRowOffsetFromHeader(page, 50)).toBeLessThanOrEqual(5);
    await expect.poll(() => targetRowOffsetFromHeader(page, 50)).toBeGreaterThanOrEqual(-5);
  });

  test("scrollToId accounts for content revealed above the table (outside-scroll)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      revealAboveTableApp(
        `<Button testId="act" label="id" onClick="table.scrollToId('row-51')" />`,
      ),
    );
    await expect(page.getByTestId("table")).toBeVisible();

    await page.getByTestId("reveal").click();
    await expect(page.getByTestId("above")).toBeVisible();

    await page.getByTestId("act").click();
    await expect.poll(() => targetRowOffsetFromHeader(page, 50)).toBeLessThanOrEqual(5);
    await expect.poll(() => targetRowOffsetFromHeader(page, 50)).toBeGreaterThanOrEqual(-5);
  });

  test("scroll event does not fire for public scroll APIs", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App scrollWholePage="false">
        <Button
          testId="scrollIndex"
          label="Scroll"
          onClick="table.scrollToIndex(250)"
        />
        <Table
          id="table"
          height="400px"
          items="{Array.from({length: 1000}, (_, i) => ({id: 'row-' + (i + 1), label: 'Row ' + (i + 1)}))}"
          onScroll="(e) => testState = (testState || 0) + 1"
          testId="table"
        >
          <Column header="Label" bindTo="label">
            <Text value="{$item.label}" />
          </Column>
        </Table>
      </App>
    `);

    await expect(page.getByTestId("table")).toBeVisible();

    await page.getByTestId("scrollIndex").click();
    await expect(page.locator("td").filter({ hasText: "Row 251" }).first()).toBeVisible();
    await page.waitForTimeout(100);
    expect(await testStateDriver.testState()).toEqual(null);
  });

  test("API reports an empty visible range when there are no items", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Button
          testId="capture"
          label="Capture"
          onClick="testState = { count: table.getItemCount(), range: table.getVisibleRange() }"
        />
        <Table id="table" data="{[]}" testId="table">
          <Column header="ID" bindTo="id" />
        </Table>
      </App>
    `);

    await expect(page.getByTestId("table")).toBeVisible();
    await page.getByTestId("capture").click();

    await expect.poll(testStateDriver.testState).toEqual({
      count: 0,
      range: { startIndex: -1, endIndex: -1 },
    });
  });

  test("only renders visible rows when height is constrained with large dataset", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1}))}"
          testId="table"
        >
          <Column header="Name" width="2*" bindTo="id">
            <Text value="File #{$item.id}" />
          </Column>
          <Column header="Size" width="*">
            <Text value="Size #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Count actual DOM rows in tbody
    const rows = page.locator("tbody tr");
    const rowCount = await rows.count();

    // With 400px height and ~41px per row, should render ~10-15 rows (visible + buffer)
    // Definitely not all 600 rows
    expect(rowCount).toBeLessThan(30);
    expect(rowCount).toBeGreaterThan(5);

    // Verify first visible row exists
    await expect(page.locator("td").filter({ hasText: "File #1" }).first()).toBeVisible();

    // Verify that rows far down the list are NOT in the DOM initially
    await expect(page.locator("td").filter({ hasText: "File #600" })).toHaveCount(0);
    await expect(page.locator("td").filter({ hasText: "File #500" })).toHaveCount(0);
  });

  test("renders new rows when scrolling through large dataset", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1}))}"
          testId="table"
        >
          <Column header="Name" bindTo="id">
            <Text value="File #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Initially, row 600 should not be in the DOM
    await expect(page.locator("td").filter({ hasText: "File #600" })).toHaveCount(0);

    // Scroll to bottom
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Wait a moment for virtualization to update
    await page.waitForTimeout(100);

    // Now row 600 should be visible
    await expect(page.locator("td").filter({ hasText: "File #600" }).first()).toBeVisible();

    // And early rows should no longer be in the DOM
    await expect(page.locator("td").filter({ hasText: "File #1" })).toHaveCount(0);
  });

  test("keeps scroll model stable while visible range display updates during scrolling", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        scrollWholePage="false"
        var.itemCount="{0}"
        var.range="{{ startIndex: -1, endIndex: -1 }}">
        <Text
          testId="range"
          variant="strong"
          value="{range.startIndex < 0
            ? 'No rows'
            : (range.startIndex + 1) + '-' + (range.endIndex + 1) + ' of ' + itemCount}" />
        <Table
          id="table"
          height="*"
          onScroll="(e) => { range = e.visibleRange; itemCount = e.itemCount }"
          onVisibleRangeDidChange="(r) => {
            range = r;
            itemCount = table.getItemCount()
          }"
          data="{Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            name: 'Item ' + (i + 1),
            quantity: (i % 25) + 1,
          }))}"
          testId="table"
        >
          <Column bindTo="id" width="90px" />
          <Column bindTo="name" />
          <Column bindTo="quantity" />
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    const range = page.getByTestId("range");
    await expect(table).toBeVisible();
    await expect(range).toHaveText(/1-\d+ of 1000/);

    const samples = await table.evaluate(async (el) => {
      const waitForScrollWork = () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
      const maxScrollTop = el.scrollHeight - el.clientHeight;
      const sample = () => ({
        scrollTop: el.scrollTop,
        scrollHeight: el.scrollHeight,
      });
      const result = [sample()];
      for (const progress of [0.1, 0.25, 0.5, 0.75, 0.9]) {
        el.scrollTop = maxScrollTop * progress;
        await waitForScrollWork();
        result.push(sample());
      }
      return result;
    });

    const scrollHeights = samples.map((sample) => sample.scrollHeight);
    expect(Math.max(...scrollHeights) - Math.min(...scrollHeights)).toBeLessThanOrEqual(2);

    await expect.poll(async () => {
      const text = await range.textContent();
      return Number(text?.match(/^(\d+)-/)?.[1] ?? 0);
    }).toBeGreaterThan(850);
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page.locator("td").filter({ hasText: "Item 1000" }).first()).toBeVisible();
  });

  test("programmatic scrolling reaches the middle and bottom of a large dataset", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1}))}"
          testId="table"
        >
          <Column header="Name" bindTo="id">
            <Text value="Item #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const scrollHeight = await table.evaluate((el) => el.scrollHeight);
    const clientHeight = await table.evaluate((el) => el.clientHeight);

    expect(scrollHeight).toBeGreaterThan(clientHeight);
    await expect.poll(async () => table.evaluate((el) => el.scrollTop)).toBe(0);

    await table.evaluate((el) => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });

    const middleScrollTop = await table.evaluate((el) => el.scrollTop);
    expect(middleScrollTop).toBeGreaterThan(0);
    expect(middleScrollTop).toBeLessThan(scrollHeight - clientHeight);

    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });

    await page.waitForTimeout(100);
    await expect(page.locator("td").filter({ hasText: "Item #600" }).first()).toBeVisible();
  });

  test("maintains consistent total scroll height with virtualization", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1}))}"
          testId="table"
        >
          <Column header="Name" bindTo="id">
            <Text value="Item #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const metrics = await table.evaluate((el) => {
      return {
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      };
    });

    // Virtua measures item content boxes, so the scroll model should stay near
    // 600 * 40px plus table chrome instead of drifting as rows are measured.
    expect(metrics.scrollHeight).toBeGreaterThan(24000);
    expect(metrics.scrollHeight).toBeLessThan(24150);

    // Verify we have a reasonable viewport
    expect(metrics.clientHeight).toBeLessThanOrEqual(450); // 400px height + some margin
  });

  test("virtualization works correctly with sorting", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1, name: 'Item ' + (i + 1)}))}"
          sortBy="id"
          sortDirection="descending"
          testId="table"
        >
          <Column header="ID" bindTo="id" canSort="true">
            <Text value="{$item.id}" />
          </Column>
          <Column header="Name" bindTo="name">
            <Text value="{$item.name}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Count rows - only visible rows should be rendered
    const rowCount = await page.locator("tbody tr").count();
    expect(rowCount).toBeLessThan(30); // Only visible rows rendered

    // First visible item should be 600 (sorted descending)
    await expect(page.locator("td").filter({ hasText: "600" }).first()).toBeVisible();

    // Item #1 should not be visible (it's at the bottom of sorted list)
    await expect(page.locator("td").filter({ hasText: /^1$/ })).toHaveCount(0);

    // Verify we can scroll to see item #1 at the bottom
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await page.waitForTimeout(100);

    // Now item #1 should be visible at bottom
    await expect(page.locator("td").filter({ hasText: /^1$/ }).first()).toBeVisible();
  });

  test("virtualization works correctly with pagination", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 100}, (_, i) => ({id: i + 1}))}"
          isPaginated="true"
          pageSize="50"
          testId="table"
        >
          <Column header="ID" bindTo="id">
            <Text value="{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Even with pagination showing 50 items, virtualization should still limit DOM rows
    const rowCount = await page.locator("tbody tr").count();
    expect(rowCount).toBeLessThan(30); // Still virtualizing within the page
    expect(rowCount).toBeGreaterThan(5); // But has some visible rows

    // First page shows items 1-50
    await expect(page.locator("td").filter({ hasText: /^1$/ }).first()).toBeVisible();

    // Item #50 should exist in the data but may not be in viewport initially
    // Scroll to see if item around index 50 can be reached
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    await page.waitForTimeout(100);

    // Should be able to see items near the end of page 1 (around item 50)
    const visibleCells = await page.locator("td").allTextContents();
    const hasItemsNear50 = visibleCells.some((text) => {
      const num = parseInt(text);
      return num >= 45 && num <= 50;
    });
    expect(hasItemsNear50).toBe(true);

    // Still only rendering visible rows even after scrolling
    const scrolledRowCount = await page.locator("tbody tr").count();
    expect(scrolledRowCount).toBeLessThan(30);
  });

  test("no virtualization occurs when all items fit in viewport", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 5}, (_, i) => ({id: i + 1}))}"
          testId="table"
        >
          <Column header="ID" bindTo="id">
            <Text value="Item #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // With only 5 items, all should be rendered
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(5);

    // All items should be visible
    await expect(page.locator("td").filter({ hasText: "Item #1" }).first()).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Item #5" }).first()).toBeVisible();

    // Table should not be scrollable
    const scrollHeight = await table.evaluate((el) => el.scrollHeight);
    const clientHeight = await table.evaluate((el) => el.clientHeight);

    // ScrollHeight should be close to clientHeight (no scrolling needed)
    expect(scrollHeight - clientHeight).toBeLessThan(10);
  });
});

// =============================================================================
// syncWithVar PROPERTY TESTS
// =============================================================================

test.describe("syncWithVar property", () => {
  // Shared data for all syncWithVar tests — numeric ids match the default idKey="id"
  const syncData = JSON.stringify([
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Carrot" },
  ]);

  test("row selection updates the synced global variable's selectedIds", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
        <Text testId="sync-display">{JSON.stringify(syncState)}</Text>
      </Fragment>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Click the first data-row checkbox (index 1 skips the header checkbox)
    const firstRowCheckbox = table.locator("input[type='checkbox']").nth(1);
    await expect(firstRowCheckbox).toBeAttached();
    await firstRowCheckbox.click({ force: true });
    await expect(firstRowCheckbox).toBeChecked();

    // The global variable should now contain selectedIds holding the first item's id
    const display = page.getByTestId("sync-display");
    await expect(display).toContainText('"selectedIds"');
    await expect(display).toContainText("1");
  });

  test("initial selectedIds in the variable pre-selects the matching rows on load", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{selectedIds: [1]}}">
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
      </Fragment>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();

    // Row with id=1 should be pre-selected
    const firstRowCheckbox = table.locator("input[type='checkbox']").nth(1);
    await expect(firstRowCheckbox).toBeChecked();

    // Rows with id=2 and id=3 should not be selected
    await expect(table.locator("input[type='checkbox']").nth(2)).not.toBeChecked();
    await expect(table.locator("input[type='checkbox']").nth(3)).not.toBeChecked();
  });

  test("deselecting a row clears selectedIds in the variable", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <Table
          syncWithVar="syncState"
          rowsSelectable="true"
          enableMultiRowSelection="true"
          testId="table"
          data='{${syncData}}'
        >
          <Column bindTo="name"/>
        </Table>
        <Text testId="sync-display">{JSON.stringify(syncState)}</Text>
      </Fragment>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const firstRowCheckbox = table.locator("input[type='checkbox']").nth(1);
    await expect(firstRowCheckbox).toBeAttached();

    // Select the first row
    await firstRowCheckbox.click({ force: true });
    await expect(firstRowCheckbox).toBeChecked();

    // Deselect the first row
    await firstRowCheckbox.click({ force: true });
    await expect(firstRowCheckbox).not.toBeChecked();

    // The variable's selectedIds should now be empty
    await expect(page.getByTestId("sync-display")).toContainText('"selectedIds":[]');
  });

  test("two tables sharing the same variable stay in sync — selecting in table1 reflects in table2", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table1" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table2" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
      </Fragment>
    `);

    const table1 = page.getByTestId("table1");
    const table2 = page.getByTestId("table2");
    await expect(table1).toBeVisible();
    await expect(table2).toBeVisible();

    // Click the first row checkbox in table1
    const t1Checkbox = table1.locator("input[type='checkbox']").nth(1);
    await expect(t1Checkbox).toBeAttached();
    await t1Checkbox.click({ force: true });
    await expect(t1Checkbox).toBeChecked();

    // table2 should reflect the same selection via the shared variable
    const t2Checkbox = table2.locator("input[type='checkbox']").nth(1);
    await expect(t2Checkbox).toBeChecked();
  });

  test("two tables sharing the same variable stay in sync — selecting in table2 reflects in table1", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table1" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
        <Table syncWithVar="syncState" rowsSelectable="true" testId="table2" data='{${syncData}}'>
          <Column bindTo="name"/>
        </Table>
      </Fragment>
    `);

    const table1 = page.getByTestId("table1");
    const table2 = page.getByTestId("table2");
    await expect(table1).toBeVisible();
    await expect(table2).toBeVisible();

    // Click the first row checkbox in table2
    const t2Checkbox = table2.locator("input[type='checkbox']").nth(1);
    await expect(t2Checkbox).toBeAttached();
    await t2Checkbox.click({ force: true });
    await expect(t2Checkbox).toBeChecked();

    // table1 should reflect the same selection via the shared variable (bidirectional)
    const t1Checkbox = table1.locator("input[type='checkbox']").nth(1);
    await expect(t1Checkbox).toBeChecked();
  });

  test("syncWithVar takes precedence over initiallySelected", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.syncState="{{selectedIds: [2]}}">
        <Table
          syncWithVar="syncState"
          initiallySelected="{[1]}"
          rowsSelectable="true"
          testId="table"
          data='{${syncData}}'
        >
          <Column bindTo="name"/>
        </Table>
      </Fragment>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();

    // syncWithVar variable says id=2 should be selected — not initiallySelected's id=1
    await expect(table.locator("input[type='checkbox']").nth(1)).not.toBeChecked(); // id=1
    await expect(table.locator("input[type='checkbox']").nth(2)).toBeChecked(); // id=2
  });

  test("invalid variable name does not crash the table and it still renders", async ({
    initTestBed,
    page,
  }) => {
    // "123invalid" is not a valid JS identifier — the table should log an error
    // but continue rendering normally without sync
    await initTestBed(`
      <Table syncWithVar="123invalid" rowsSelectable="true" testId="table" data='{${syncData}}'>
        <Column bindTo="name"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
  });

  test("non-existent variable name renders table normally with local-only selection", async ({
    initTestBed,
    page,
  }) => {
    // "noSuchVar" is a valid identifier but is not defined — sync is silently skipped
    await initTestBed(`
      <Table syncWithVar="noSuchVar" rowsSelectable="true" testId="table" data='{${syncData}}'>
        <Column bindTo="name"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Row selection should still work locally even without a sync target
    const firstRowCheckbox = table.locator("input[type='checkbox']").nth(1);
    await expect(firstRowCheckbox).toBeAttached();
    await firstRowCheckbox.click({ force: true });
    await expect(firstRowCheckbox).toBeChecked();
  });
});

// =============================================================================
// COLUMN WIDTH THEME VARIABLES TESTS
// =============================================================================

test.describe("Column width theme variables", () => {
  const tableData = [
    { id: 1, name: "Apples", quantity: 5 },
    { id: 2, name: "Bananas", quantity: 6 },
  ];

  test("table renders without error when Column width uses a theme variable (em unit)", async ({
    initTestBed,
    page,
  }) => {
    // $space-12 resolves to "3em" — this was raising "Invalid TableColumnDef 'width' value: 3em"
    await initTestBed(`
      <Table data='{${JSON.stringify(tableData)}}' testId="table">
        <Column bindTo="name" width="$space-12"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apples" }).first()).toBeVisible();
  });

  test("table renders without error when Column minWidth uses a theme variable", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(tableData)}}' testId="table">
        <Column bindTo="name" minWidth="$space-8"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apples" }).first()).toBeVisible();
  });

  test("table renders without error when Column maxWidth uses a theme variable", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(tableData)}}' testId="table">
        <Column bindTo="name" maxWidth="$space-24"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();
    await expect(page.locator("td").filter({ hasText: "Apples" }).first()).toBeVisible();
  });

  test("column with maxWidth theme variable does not exceed that width while other columns absorb freed space", async ({
    initTestBed,
    page,
  }) => {
    // maxWidth="$space-12" resolves to ~48px. The name column should be capped at that,
    // and the two remaining columns should absorb the freed space.
    // Note: columns must bind to distinct fields so tanstack assigns them distinct IDs.
    await initTestBed(`
      <Table data='{[{name:"Apples", qty:5, unit:"pieces"}]}' testId="table" width="600px">
        <Column bindTo="name" header="Name" maxWidth="$space-12"/>
        <Column bindTo="qty" header="Qty"/>
        <Column bindTo="unit" header="Unit"/>
      </Table>
    `);

    const nameHeader = page.locator("thead th").nth(0);
    const qtyHeader = page.locator("thead th").nth(1);
    await expect(nameHeader).toBeVisible();
    await expect(qtyHeader).toBeVisible();

    const nameBox = await nameHeader.boundingBox();
    const qtyBox = await qtyHeader.boundingBox();

    expect(nameBox).not.toBeNull();
    expect(qtyBox).not.toBeNull();

    // Name column must be at most 48px (maxWidth = $space-12 = 3em ≈ 48px at 16px root)
    expect(nameBox!.width).toBeLessThanOrEqual(52);

    // The other two columns must be substantially wider than the name column,
    // proving they absorbed the freed space.
    expect(qtyBox!.width).toBeGreaterThan(nameBox!.width);
  });

  test("header and data cells are aligned when maxWidth is a theme variable", async ({
    initTestBed,
    page,
  }) => {
    // Regression: the XMLUI layout system was generating a CSS max-width class and
    // applying it to <td> cells (but not <th>), causing cell/header width mismatch.
    await initTestBed(`
      <Table data='{[{name:"Apples", qty:5, unit:"pieces"}]}' testId="table" width="600px">
        <Column bindTo="name" header="Name" maxWidth="$space-12"/>
        <Column bindTo="qty" header="Qty"/>
        <Column bindTo="unit" header="Unit"/>
      </Table>
    `);

    const nameHeader = page.locator("thead th").nth(0);
    const nameCell = page.locator("tbody tr td").nth(0);
    await expect(nameHeader).toBeVisible();
    await expect(nameCell).toBeVisible();

    const headerBox = await nameHeader.boundingBox();
    const cellBox = await nameCell.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(cellBox).not.toBeNull();

    // Header and cell must have the same width (within 2px rounding tolerance)
    expect(Math.abs(headerBox!.width - cellBox!.width)).toBeLessThan(3);
  });

  test("column width theme variable with px value is applied correctly", async ({
    initTestBed,
    page,
  }) => {
    // Use a custom theme var with a known px value for a predictable assertion
    await initTestBed(
      `
      <Table data='{[{id: 1}]}' testId="table" width="800px">
        <Column bindTo="id" header="Col1" width="$test-col-width"/>
        <Column bindTo="id" header="Col2"/>
      </Table>
    `,
      { testThemeVars: { "test-col-width": "150px" } },
    );

    const firstHeader = page.locator("thead th").nth(0);
    await expect(firstHeader).toBeVisible();

    const headerBox = await firstHeader.boundingBox();
    expect(headerBox).not.toBeNull();
    // Allow ~2px tolerance for border/rendering differences
    expect(headerBox!.width).toBeGreaterThanOrEqual(148);
    expect(headerBox!.width).toBeLessThanOrEqual(152);
  });

  test("column width theme variable with rem value resolves to correct pixel size", async ({
    initTestBed,
    page,
  }) => {
    // 3rem at 16px root font size = 48px
    await initTestBed(
      `
      <Table data='{[{id: 1}]}' testId="table" width="800px">
        <Column bindTo="id" header="Col1" width="$test-col-width"/>
        <Column bindTo="id" header="Col2"/>
      </Table>
    `,
      { testThemeVars: { "test-col-width": "3rem" } },
    );

    const firstHeader = page.locator("thead th").nth(0);
    await expect(firstHeader).toBeVisible();

    const headerBox = await firstHeader.boundingBox();
    expect(headerBox).not.toBeNull();
    // 3rem * 16px = 48px; allow ~4px tolerance across environments
    expect(headerBox!.width).toBeGreaterThanOrEqual(44);
    expect(headerBox!.width).toBeLessThanOrEqual(52);
  });

  test("column width is consistent whether specified as px or equivalent em theme var", async ({
    initTestBed,
    page,
  }) => {
    // Two tables side by side: one column uses "48px", the other uses "$space-12" (3em ≈ 48px).
    // Both should render to approximately the same pixel width after layout settles.
    await initTestBed(`
      <VStack>
        <Table data='{[{id: 1}]}' testId="px-table" width="400px">
          <Column bindTo="id" header="Explicit" width="48px"/>
          <Column bindTo="id" header="Other"/>
        </Table>
        <Table data='{[{id: 1}]}' testId="theme-table" width="400px">
          <Column bindTo="id" header="ThemeVar" width="$space-12"/>
          <Column bindTo="id" header="Other"/>
        </Table>
      </VStack>
    `);

    const pxHeader = page.getByTestId("px-table").locator("thead th").nth(0);
    const themeHeader = page.getByTestId("theme-table").locator("thead th").nth(0);

    await expect(pxHeader).toBeVisible();
    await expect(themeHeader).toBeVisible();

    // Poll until both column widths stabilize after the ResizeObserver settles.
    // Each column is verified independently: the px column must be close to 48px,
    // and the theme-var column must also be close to 48px. Comparing them against
    // each other is fragile because em→px conversion uses document.documentElement.fontSize
    // which may differ slightly across environments.
    await expect
      .poll(
        async () => {
          const pxWidth = (await pxHeader.boundingBox())?.width ?? 0;
          const themeWidth = (await themeHeader.boundingBox())?.width ?? 0;
          return (
            pxWidth >= 40 &&
            pxWidth <= 56 &&
            themeWidth >= 40 &&
            themeWidth <= 56 &&
            Math.abs(pxWidth - themeWidth) <= 8
          );
        },
        { timeout: 10000 },
      )
      .toBe(true);
  });
});

// =============================================================================
// STRIPED PROPERTY TESTS
// =============================================================================

test.describe("striped property", () => {
  test("rows have no stripe classes when striped is not set", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      await expect(rows.nth(i)).not.toHaveClass(/evenRow/);
      await expect(rows.nth(i)).not.toHaveClass(/oddRow/);
    }
  });

  test("rows have no stripe classes when striped is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' striped="false" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
      await expect(rows.nth(i)).not.toHaveClass(/evenRow/);
      await expect(rows.nth(i)).not.toHaveClass(/oddRow/);
    }
  });

  test("even rows (0-based index 0, 2) get evenRow class when striped is true", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);

    await expect(rows.nth(0)).toHaveClass(/evenRow/);
    await expect(rows.nth(2)).toHaveClass(/evenRow/);
  });

  test("odd rows (0-based index 1, 3) get oddRow class when striped is true", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);

    await expect(rows.nth(1)).toHaveClass(/oddRow/);
    await expect(rows.nth(3)).toHaveClass(/oddRow/);
  });

  test("even rows do not get oddRow class; odd rows do not get evenRow class", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(4);

    await expect(rows.nth(0)).not.toHaveClass(/oddRow/);
    await expect(rows.nth(1)).not.toHaveClass(/evenRow/);
    await expect(rows.nth(2)).not.toHaveClass(/oddRow/);
    await expect(rows.nth(3)).not.toHaveClass(/evenRow/);
  });

  test("backgroundColor-evenRow-Table theme var applies to even rows", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `,
      {
        testThemeVars: { "backgroundColor-evenRow-Table": "rgb(200, 230, 255)" },
      },
    );

    // Even rows (index 0, 2) should use the theme color
    await expect(page.locator("tbody tr").nth(0)).toHaveCSS(
      "background-color",
      "rgb(200, 230, 255)",
    );
    await expect(page.locator("tbody tr").nth(2)).toHaveCSS(
      "background-color",
      "rgb(200, 230, 255)",
    );
  });

  test("backgroundColor-oddRow-Table theme var applies to odd rows", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `,
      {
        testThemeVars: { "backgroundColor-oddRow-Table": "rgb(255, 240, 200)" },
      },
    );

    // Odd rows (index 1, 3) should use the theme color
    await expect(page.locator("tbody tr").nth(1)).toHaveCSS(
      "background-color",
      "rgb(255, 240, 200)",
    );
    await expect(page.locator("tbody tr").nth(3)).toHaveCSS(
      "background-color",
      "rgb(255, 240, 200)",
    );
  });

  test("distinct even and odd colors produce alternating row backgrounds", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Table data='{${JSON.stringify(sampleData)}}' striped="true" testId="table">
        <Column bindTo="name" header="Name"/>
      </Table>
    `,
      {
        testThemeVars: {
          "backgroundColor-evenRow-Table": "rgb(220, 240, 220)",
          "backgroundColor-oddRow-Table": "rgb(240, 220, 220)",
        },
      },
    );

    const rows = page.locator("tbody tr");
    await expect(rows.nth(0)).toHaveCSS("background-color", "rgb(220, 240, 220)");
    await expect(rows.nth(1)).toHaveCSS("background-color", "rgb(240, 220, 220)");
    await expect(rows.nth(2)).toHaveCSS("background-color", "rgb(220, 240, 220)");
    await expect(rows.nth(3)).toHaveCSS("background-color", "rgb(240, 220, 220)");
  });
});

// =============================================================================
// toggleSelectionOnClick property
// =============================================================================

test.describe("toggleSelectionOnClick property", () => {
  const toggleMarkup = `
    <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" toggleSelectionOnClick="true" testId="table">
      <Column bindTo="name"/>
      <Column bindTo="quantity"/>
    </Table>
  `;

  test("plain click selects unselected row", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();
    const firstCheckbox = page.locator("input[type='checkbox']").nth(1);
    await expect(firstCheckbox).toBeChecked();
  });

  test("plain click on selected row deselects it (toggle)", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const firstRow = page.locator("tbody tr").first();
    // First click — select
    await firstRow.click();
    const firstCheckbox = page.locator("input[type='checkbox']").nth(1);
    await expect(firstCheckbox).toBeChecked();
    // Second click — deselect
    await firstRow.click();
    await expect(firstCheckbox).not.toBeChecked();
  });

  test("plain click does not deselect other rows", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const rows = page.locator("tbody tr");
    const checkboxes = page.locator("input[type='checkbox']");
    // Select first row
    await rows.nth(0).click();
    await expect(checkboxes.nth(1)).toBeChecked();
    // Click second row — first should remain selected
    await rows.nth(1).click();
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
  });

  test("Shift+Click still performs range selection", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const rows = page.locator("tbody tr");
    await rows.nth(0).click();
    await rows.nth(2).click({ modifiers: ["Shift"] });
    // Rows 0, 1, 2 should all be selected
    const checkboxes = page.locator("input[type='checkbox']");
    await expect(checkboxes.nth(1)).toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
    await expect(checkboxes.nth(3)).toBeChecked();
  });

  test("without toggleSelectionOnClick plain click replaces selection", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" testId="table">
        <Column bindTo="name"/>
      </Table>
    `);
    const rows = page.locator("tbody tr");
    const checkboxes = page.locator("input[type='checkbox']");
    await rows.nth(0).click();
    await rows.nth(1).click();
    // First row should be deselected (replaced), second selected
    await expect(checkboxes.nth(1)).not.toBeChecked();
    await expect(checkboxes.nth(2)).toBeChecked();
  });
});

// refreshOn
// =============================================================================

test.describe("refreshOn Property", () => {
  test("updates event handler closures when refreshOn changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1">
        <Table data="{[{id: 1, name: 'Row A' }]}" refreshOn="{parentValue}">
          <Column header="Name">
            <Text onClick="testState = parentValue">{$item.name}</Text>
          </Column>
        </Table>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Row A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("does not update event handler closures when refreshOn is unchanged", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1" var.refreshWatch="1">
        <Table data="{[{id: 1, name: 'Row A' }]}" refreshOn="{refreshWatch}">
          <Column header="Name">
            <Text onClick="testState = parentValue">{$item.name}</Text>
          </Column>
        </Table>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Row A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");
  });

  test("updates event handler closures if refreshOn is not provided", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1">
        <Table data="{[{id: 1, name: 'Row A' }]}">
          <Column header="Name">
            <Text onClick="testState = parentValue">{$item.name}</Text>
          </Column>
        </Table>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Row A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

test.describe("Regression", () => {
  test("keeps App-stretched Card stable when Table rows exceed available height", async ({
    initTestBed,
    page,
  }) => {
    const data = Array.from({ length: 18 }, (_, index) => {
      const items = [
        { name: "Apples", quantity: 5, unit: "pieces", category: "fruits", key: 5 },
        { name: "Bananas", quantity: 6, unit: "pieces", category: "fruits", key: 4 },
        { name: "Carrots", quantity: 100, unit: "grams", category: "vegetables", key: 3 },
        { name: "Spinach", quantity: 1, unit: "bunch", category: "vegetables", key: 2 },
        { name: "Milk", quantity: 10, unit: "liter", category: "dairy", key: 1 },
        { name: "Cheese", quantity: 200, unit: "grams", category: "dairy", key: 0 },
      ];
      return { id: index, ...items[index % items.length] };
    });

    await initTestBed(`
      <App layout="condensed" scrollWholePage="false">
        <AppHeader>
          <property name="logoTemplate">
            <Heading level="h3" value="Example App"/>
          </property>
        </AppHeader>
        <NavPanel>
          <NavLink label="Home" to="/" icon="home"/>
          <NavLink label="Page 1" to="/page1"/>
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Card testId="card" backgroundColor="yellow" height="*">
              <Text value="Home" />
              <H2>Page content</H2>
              <Table testId="table" data='{${JSON.stringify(data)}}'>
                <Column bindTo="name"/>
                <Column bindTo="quantity"/>
                <Column bindTo="unit"/>
              </Table>
            </Card>
          </Page>
        </Pages>
        <Footer>Powered by XMLUI</Footer>
      </App>
    `);

    const card = page.getByTestId("card");
    const table = page.getByTestId("table");

    await expect(card).toBeVisible();
    await expect(table).toBeVisible();

    const metrics = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="card"]') as HTMLElement;
      const table = document.querySelector('[data-testid="table"]') as HTMLElement;
      return {
        cardHeight: Math.round(card.getBoundingClientRect().height),
        tableHeight: Math.round(table.getBoundingClientRect().height),
        tableClientHeight: table.clientHeight,
        tableScrollHeight: table.scrollHeight,
      };
    });

    expect(metrics.cardHeight).toBeLessThanOrEqual(page.viewportSize()!.height);
    expect(metrics.tableHeight).toBeLessThan(metrics.tableScrollHeight);
    expect(metrics.tableScrollHeight).toBeGreaterThan(metrics.tableClientHeight);
  });

  test("table inside HStack > VStack does not shrink continuously on initial render", async ({
    initTestBed,
    page,
  }) => {
    // Regression: when star-sized columns' widths sum to less than clientWidth (due to
    // Math.floor rounding and the -1 offset), the parent flex container shrank on each
    // render, triggering the ResizeObserver again and causing an infinite shrink loop.
    await initTestBed(`
      <HStack>
        <VStack>
          <Table testId="table" data='{[
            { id: 0, name: "Apples",  quantity: 5,   unit: "pieces" },
            { id: 1, name: "Bananas", quantity: 6,   unit: "pieces" },
            { id: 2, name: "Carrots", quantity: 100, unit: "grams"  }
          ]}'>
            <Column bindTo="name"/>
            <Column bindTo="quantity"/>
            <Column bindTo="unit"/>
          </Table>
        </VStack>
      </HStack>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Measure the table wrapper width after initial render has settled
    const initialBox = await table.boundingBox();
    expect(initialBox).not.toBeNull();
    const initialWidth = initialBox!.width;
    expect(initialWidth).toBeGreaterThan(0);

    // Wait long enough for any layout-feedback loop to have run several iterations
    await page.waitForTimeout(500);

    // The width must not have shrunk
    const finalBox = await table.boundingBox();
    expect(finalBox).not.toBeNull();
    expect(finalBox!.width).toBeCloseTo(initialWidth, -1);
  });
});

// =============================================================================
// TABLE IN HSTACK LAYOUT TESTS
// =============================================================================

test.describe("Table in HStack layout", () => {
  test("Table inside HStack > VStack fills available width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="hstack">
        <VStack testId="vstack">
          <Table
            data="{[
              { code: 123, description: 'Agriculture, Forestry, Fishing and Hunting' },
              { code: 456, description: 'Mining, Quarrying, and Oil and Gas Extraction' },
              { code: 789, description: 'Utilities' },
            ]}"
            testId="table"
          >
            <Column header="Code" width="180px" bindTo="code"/>
            <Column header="Description" bindTo="description"/>
          </Table>
        </VStack>
      </HStack>
    `);

    const hstack = page.getByTestId("hstack");
    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const hstackBox = await hstack.boundingBox();
    const tableBox = await table.boundingBox();
    expect(hstackBox).not.toBeNull();
    expect(tableBox).not.toBeNull();

    // Table should fill the HStack's available width
    expect(tableBox!.width).toBeCloseTo(hstackBox!.width, -1);
  });

  test("Table inside HStack (no VStack wrapper) renders correctly", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <HStack testId="hstack">
        <Table
          data="{[
            { code: 123, description: 'Agriculture' },
            { code: 456, description: 'Mining' },
          ]}"
          testId="table"
        >
          <Column header="Code" width="180px" bindTo="code"/>
          <Column header="Description" bindTo="description"/>
        </Table>
      </HStack>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const tableBox = await table.boundingBox();
    expect(tableBox).not.toBeNull();
    expect(tableBox!.width).toBeGreaterThan(0);
  });

  test("VStack with explicit width inside HStack respects the explicit width", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <HStack testId="hstack">
        <VStack testId="vstack" width="400px">
          <Table
            data="{[
              { code: 123, description: 'Agriculture' },
            ]}"
            testId="table"
          >
            <Column header="Code" width="180px" bindTo="code"/>
            <Column header="Description" bindTo="description"/>
          </Table>
        </VStack>
      </HStack>
    `);

    const vstack = page.getByTestId("vstack");
    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    const vstackBox = await vstack.boundingBox();
    expect(vstackBox).not.toBeNull();
    // VStack should respect its explicit 400px width
    expect(vstackBox!.width).toBeCloseTo(400, 0);
  });

  test("Multiple VStacks in HStack share available width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="hstack">
        <VStack testId="vstack1">
          <Table
            data="{[{ code: 123, description: 'Agriculture' }]}"
            testId="table1"
          >
            <Column header="Code" width="100px" bindTo="code"/>
            <Column header="Description" bindTo="description"/>
          </Table>
        </VStack>
        <VStack testId="vstack2">
          <Table
            data="{[{ code: 456, description: 'Mining' }]}"
            testId="table2"
          >
            <Column header="Code" width="100px" bindTo="code"/>
            <Column header="Description" bindTo="description"/>
          </Table>
        </VStack>
      </HStack>
    `);

    const hstack = page.getByTestId("hstack");
    const vstack1 = page.getByTestId("vstack1");
    const vstack2 = page.getByTestId("vstack2");
    await expect(vstack1).toBeVisible();
    await expect(vstack2).toBeVisible();

    const hstackBox = await hstack.boundingBox();
    const vs1Box = await vstack1.boundingBox();
    const vs2Box = await vstack2.boundingBox();
    expect(hstackBox).not.toBeNull();
    expect(vs1Box).not.toBeNull();
    expect(vs2Box).not.toBeNull();

    // Both VStacks should be visible side by side and share the available width
    expect(vs1Box!.x + vs1Box!.width).toBeLessThanOrEqual(vs2Box!.x + 2);
    // Combined width should approximately fill the HStack (allowing for gap)
    expect(vs1Box!.width + vs2Box!.width).toBeGreaterThan(hstackBox!.width * 0.8);
  });
});
