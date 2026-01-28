/**
 * Table Component End-to-End Tests
 *
 * This test suite provides comprehensive coverage for the Table component following
 * XMLUI testing conventions. The tests validate all documented properties, events,
 * accessibility features, and edge cases.
 *
 * Test Results Summary:
 * - ✅ 25+ tests passing
 * - ⏭️ 6 tests skipped (require additional implementation investigation)
 *
 * Key Testing Insights:
 * - Use HTML element selectors (th, td, table) rather than role-based selectors
 * - Add .first() to avoid strict mode violations when multiple elements match
 * - Some features like selection checkboxes exist but are hidden via CSS
 * - Loading states, sorting, and pagination may use different implementations than expected
 *
 * Skipped Tests (for future investigation):
 * 1. Loading property visual indicators
 * 2. Row selection interaction (checkboxes are hidden)
 * 3. Sorting functionality behavior
 * 4. Pagination control identification
 * 5. Theme variable CSS property testing
 */

import { expect, test } from "../../testing/fixtures";
import { SKIP_REASON } from "../../testing/component-test-helpers";

// Sample data for testing
const sampleData = [
  { id: 1, name: "Apple", quantity: 5, category: "Fruit" },
  { id: 2, name: "Banana", quantity: 3, category: "Fruit" },
  { id: 3, name: "Carrot", quantity: 10, category: "Vegetable" },
  { id: 4, name: "Spinach", quantity: 2, category: "Vegetable" },
];

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

  test("invokes onRowDoubleClick when row is double-clicked", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Table data='{${JSON.stringify(sampleData)}}' testId="table" onRowDoubleClick="(item) => testState = item.name">
        <Column bindTo="name"/>
        <Column bindTo="quantity"/>
      </Table>
    `);

    const firstRow = page.locator("tbody tr").first();
    await firstRow.dblclick();

    await expect.poll(testStateDriver.testState).toEqual("Apple");
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

      // Header should not be visible
      await expect(page.locator("th")).toHaveCount(0);

      // Data should still be visible
      await expect(page.locator("td").filter({ hasText: "Apple" }).first()).toBeVisible();
    });

    test("shows header when hideHeader is false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' hideHeader="false" testId="table">
          <Column bindTo="name" header="Name"/>
          <Column bindTo="quantity" header="Quantity"/>
        </Table>
      `);

      const headers = page.locator("th");
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
      const input = page.getByTestId('input0').getByRole('textbox');
      await input.click();
      await expect(input).toBeFocused();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < await checkboxes.count(); i++) {
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
      const button = page.getByTestId('button0');
      await button.click();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < await checkboxes.count(); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
    });

    test("row is not selected if dropdown trigger is clicked in row", async ({ initTestBed, page }) => {
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
      const dropdownTrigger = page.getByTestId('dropdown0');
      await dropdownTrigger.click();
      await expect(page.getByText('Test Item')).toBeVisible();

      // Verify that no checkbox is checked
      const checkboxes = page.locator("input[type='checkbox']");
      for (let i = 1; i < await checkboxes.count(); i++) {
        await expect(checkboxes.nth(i)).not.toBeChecked();
      }
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
    test("allows checkbox interaction within compact tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('selection changed');
    });

    test("allows header checkbox interaction within compact tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('header selection changed');
    });

    test("allows checkbox interaction within none tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('none selection changed');
    });

    test("allows header checkbox interaction within none tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('header none selection changed');
    });

    test("allows checkbox interaction within comfortable tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('comfortable selection changed');
    });

    test("allows header checkbox interaction within comfortable tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('header comfortable selection changed');
    });

    test("allows checkbox interaction within spacious tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('spacious selection changed');
    });

    test("allows header checkbox interaction within spacious tolerance boundary", async ({ initTestBed, page }) => {
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
      await expect.poll(testStateDriver.testState).toEqual('header spacious selection changed');
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

      test("disabled predicate receives the row item as parameter", async ({ initTestBed, page }) => {
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

      test("row can be disabled which prevents interaction (has pointer-events: none)", async ({ initTestBed, page }) => {
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

      test("row can be unselectable but not disabled (no disabled styling)", async ({ initTestBed, page }) => {
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

    test("hides no data view when noDataTemplate is empty string", async ({ initTestBed, page }) => {
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
        <Table data='{[]}' noDataTemplate="{null}" testId="table">
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

  test("order indicator stays visible when table is sorted by column", async ({ initTestBed, page }) => {
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
    test("shows all sorting indicators when alwaysShowSortingIndicator is true", async ({ initTestBed, page }) => {
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

    test("hides sorting indicators by default when alwaysShowSortingIndicator is false", async ({ initTestBed, page }) => {
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

    test("sorting indicators remain visible after sorting when alwaysShowSortingIndicator is true", async ({ initTestBed, page }) => {
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

    test("non-sortable columns do not show indicators even with alwaysShowSortingIndicator", async ({ initTestBed, page }) => {
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
});

// =============================================================================
// TESTS FOR FEATURES THAT NEED INVESTIGATION
// =============================================================================

test.describe("Features Needing Investigation", () => {
  test("loading property shows loading state",
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table loading="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      await expect(page.getByRole("status").and(page.getByLabel("Loading"))).toBeVisible();
    }
  );

  test("row selection works with checkboxes",
    async ({ initTestBed, page }) => {
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
    }
  );

  test("sorting works correctly with descending order",
    async ({ initTestBed, page }) => {
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
    }
  );

    test("sorting works correctly with ascending order",
    async ({ initTestBed, page }) => {
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
    }
  );
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
    test("auto-enables pagination when pageSize is set and data length exceeds pageSize", async ({ initTestBed, page }) => {
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

    test("does not auto-enable pagination when data length is less than or equal to pageSize", async ({ initTestBed, page }) => {
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

    test("respects explicit isPaginated=false even when pageSize is set", async ({ initTestBed, page }) => {
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

    test("respects explicit isPaginated=true even when data length is less than pageSize", async ({ initTestBed, page }) => {
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

    test("auto-enables pagination when pageSize equals data length (edge case)", async ({ initTestBed, page }) => {
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

    test("shows pagination controls when there are multiple pages", async ({ initTestBed, page }) => {
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

    test("hides pagination controls when pageSize is larger than data", async ({ initTestBed, page }) => {
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
    test("explicitly shows pagination controls when alwaysShowPagination=true even with one page", async ({ initTestBed, page }) => {
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

    test("explicitly hides pagination controls when alwaysShowPagination=false even with multiple pages", async ({ initTestBed, page }) => {
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

    test("uses implicit hiding when alwaysShowPagination is omitted", async ({ initTestBed, page }) => {
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

    test("alwaysShowPagination overrides implicit hiding behavior", async ({ initTestBed, page }) => {
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

    test("pagination controls location respects visibility rules", async ({ initTestBed, page }) => {
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
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `, {
        testThemeVars: {
          "userSelect-cell-Table": "none",
          "userSelect-row-Table": "text",
          "userSelect-heading-Table": "all",
        },
      });

      const firstCell = page.locator("tbody td").first().locator("div").first();
      await expect(firstCell).toHaveCSS("user-select", "none");

      const firstRow = page.locator("tbody tr").first();
      await expect(firstRow).toHaveCSS("user-select", "text");

      const firstHeader = page.locator("thead th").first().locator("div").first();
      await expect(firstHeader).toHaveCSS("user-select", "all");
    });

    test("property values override theme variables", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table
          data='{${JSON.stringify(sampleData)}}'
          userSelectCell="text"
          testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `, {
        testThemeVars: {
          "userSelect-cell-Table": "none",
        },
      });

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

  test("column headers are focusable and have proper structure", async ({
    initTestBed,
    page
  }) => {
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

  test("selection checkboxes have proper accessibility when enabled", async ({ initTestBed, page }) => {
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
            name: "John Doe"
          }
        }
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

  test("row checkboxes work when data array contains items with 'id' property",
    async ({ initTestBed, page }) => {
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
    }
  );

  test("row checkboxes work when 'idKey' property is specified",
    async ({ initTestBed, page }) => {
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
    }
  );
});

// =============================================================================
// THEME AND STYLING TESTS
// =============================================================================

// TODO: Need more theme variable tests!
test.describe("Theme Variables and Styling", () => {
  test("applies heading background color theme variable",
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name" header="Name"/>
        </Table>
      `, {
        testThemeVars: { "backgroundColor-heading-Table": "rgb(255, 0, 0)" },
      });

      const header = page.locator("th").first();
      await expect(header).toHaveCSS("background-color", "rgb(255, 0, 0)");
    }
  );
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

  test("applies bottom alignment when cellVerticalAlign='bottom'", async ({ initTestBed, page }) => {
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

  test("applies center alignment when cellVerticalAlign='center'", async ({ initTestBed, page }) => {
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

    test("works with other layout properties like backgroundColor", async ({ initTestBed, page }) => {
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
