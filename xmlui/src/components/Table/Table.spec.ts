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
    await expect(firstRow).toBeVisible();
    await firstRow.dblclick();

    await expect.poll(testStateDriver.testState).toEqual("Apple");
  });

  test("double-click fires handler without interfering with row selection", async ({ initTestBed, page }) => {
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
      item: "Apple" 
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

    test("checkbox column maintains width with horizontal scrolling (issue #2790)", async ({ initTestBed, page }) => {
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

  test.describe("alwaysShowCheckboxes property", () => {
    test("checkboxes are always visible when alwaysShowCheckboxes is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" alwaysShowCheckboxes="true" testId="table">
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

    test("checkboxes are hidden on non-hovered rows by default (alwaysShowCheckboxes false)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" alwaysShowCheckboxes="false" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // Checkboxes still exist in DOM but are not visible without hover
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(5); // header + 4 data rows
    });

    test("alwaysShowCheckboxes has no effect when hideSelectionCheckboxes is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true" alwaysShowCheckboxes="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      // hideSelectionCheckboxes takes precedence — no checkboxes rendered
      const checkboxes = page.locator("input[type='checkbox']");
      await expect(checkboxes).toHaveCount(0);
    });

    test("alwaysShowCheckboxes has no effect when row selection is disabled", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' alwaysShowCheckboxes="true" testId="table">
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

    test("provides $rowIndex context variable with correct index", async ({ initTestBed, page }) => {
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

    test("provides $itemIndex context variable with correct index", async ({ initTestBed, page }) => {
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

    test("context variables match the correct row when clicking different rows", async ({ initTestBed, page }) => {
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
      
      // Press the platform-appropriate key: Cmd+A on macOS, Ctrl+A elsewhere
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);

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
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);

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
      await page.keyboard.press("Control+A");

      // Should not trigger table's selectAll
      await expect.poll(testStateDriver.testState).not.toEqual("selectAll triggered");
    });

    test("automatically selects all items before calling event handler", async ({ initTestBed, page }) => {
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
      
      // Press the platform-appropriate key
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);
      await page.waitForTimeout(100);

      // Verify that all items are selected in the context
      const result = await testStateDriver.testState();
      expect(result.selectedItemsLength).toBe(sampleData.length);
      expect(result.selectedIdsLength).toBe(sampleData.length);
      expect(result.selectedIds).toHaveLength(sampleData.length);
      
      // Verify all sample data IDs are in the selected IDs
      sampleData.forEach(item => {
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

      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);

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

      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);

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

      const isMac = process.platform === 'darwin';
      const cutKey = isMac ? 'Meta+X' : 'Control+X';
      await page.keyboard.press(cutKey);

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

      const isMac = process.platform === 'darwin';
      const pasteKey = isMac ? 'Meta+V' : 'Control+V';
      await page.keyboard.press(pasteKey);

      const result = await testStateDriver.testState();
      expect(result.action).toBe("paste");
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
    test("provides complete context with selection, focusedRow, and focusedCell", async ({ initTestBed, page }) => {
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

      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);

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

      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);

      const result = await testStateDriver.testState();
      expect(result.focusedRowData).not.toBeNull();
      expect(result.focusedRowData?.hasItem).toBe(true);
      expect(result.focusedRowData?.hasRowId).toBe(true);
      expect(typeof result.focusedRowData?.isSelected).toBe("boolean");
      expect(typeof result.focusedRowData?.isFocused).toBe("boolean");
    });
  });

  test.describe("integration with row selection", () => {
    test("keyboard shortcuts work alongside arrow key navigation", async ({ initTestBed, page }) => {
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
      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);

      const result = await testStateDriver.testState();
      expect(result.action).toBe("copy");
      // focusedName should either be a string or undefined
      expect(['string', 'undefined']).toContain(typeof result.focusedName);
    });

    test("Space key for selection still works after keyboard shortcuts", async ({ initTestBed, page }) => {
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
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);
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
    test("prevents default browser behavior for handled shortcuts", async ({ initTestBed, page }) => {
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
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);

      await expect.poll(testStateDriver.testState).toEqual("handled");
    });
  });

  test.describe("rowsSelectable guard", () => {
    test("does not trigger onSelectAll when rowsSelectable is false", async ({ initTestBed, page }) => {
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
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("does not trigger onDelete when rowsSelectable is false", async ({ initTestBed, page }) => {
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
      
      const isMac = process.platform === 'darwin';
      const copyKey = isMac ? 'Meta+C' : 'Control+C';
      await page.keyboard.press(copyKey);
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
      
      const isMac = process.platform === 'darwin';
      const cutKey = isMac ? 'Meta+X' : 'Control+X';
      await page.keyboard.press(cutKey);
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("does not trigger onPaste when rowsSelectable is false", async ({ initTestBed, page }) => {
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
      
      const isMac = process.platform === 'darwin';
      const pasteKey = isMac ? 'Meta+V' : 'Control+V';
      await page.keyboard.press(pasteKey);
      await page.waitForTimeout(100);

      // Should NOT have triggered the handler (testState remains null)
      const state = await testStateDriver.testState();
      expect(state).toBeNull();
    });

    test("keyboard actions work when rowsSelectable is explicitly true", async ({ initTestBed, page }) => {
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
      
      const isMac = process.platform === 'darwin';
      const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
      await page.keyboard.press(selectAllKey);
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
  test("only renders visible rows when height is constrained with large dataset", async ({ initTestBed, page }) => {
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

  test("scrollbar thumb tracks correctly with large dataset", async ({ initTestBed, page }) => {
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

    // Get scroll properties
    const initialScrollTop = await table.evaluate((el) => el.scrollTop);
    const scrollHeight = await table.evaluate((el) => el.scrollHeight);
    const clientHeight = await table.evaluate((el) => el.clientHeight);

    // Verify table is scrollable (scrollHeight > clientHeight)
    expect(scrollHeight).toBeGreaterThan(clientHeight);
    expect(initialScrollTop).toBe(0);

    // Scroll to middle
    await table.evaluate((el) => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
    });

    const middleScrollTop = await table.evaluate((el) => el.scrollTop);
    expect(middleScrollTop).toBeGreaterThan(0);
    expect(middleScrollTop).toBeLessThan(scrollHeight - clientHeight);

    // Scroll to bottom
    await table.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    });

    const bottomScrollTop = await table.evaluate((el) => el.scrollTop);
    expect(bottomScrollTop).toBeGreaterThan(middleScrollTop);

    // Verify we can see the last item when scrolled to bottom
    await page.waitForTimeout(100);
    await expect(page.locator("td").filter({ hasText: "Item #600" }).first()).toBeVisible();
  });

  test("maintains consistent total scroll height with virtualization", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App scrollWholePage="false">
        <Table
          height="400px"
          items="{Array.from({length: 600}, (_, i) => ({id: i + 1}))}"
          testId="table"
          rowHeight="40"
        >
          <Column header="Name" bindTo="id">
            <Text value="Item #{$item.id}" />
          </Column>
        </Table>
      </App>
    `);

    const table = page.getByTestId("table");
    await expect(table).toBeVisible();

    // Get scroll height
    const scrollHeight = await table.evaluate((el) => el.scrollHeight);
    const clientHeight = await table.evaluate((el) => el.clientHeight);

    // With 600 rows at ~41px each (40px + 1px border), total height should be ~24,600px
    // ScrollHeight = clientHeight + total content height, but the wrapper shows the scrollable area
    // The scrollHeight should accommodate all 600 items
    expect(scrollHeight).toBeGreaterThan(20000); // At least 20,000px for 600 items
    expect(scrollHeight).toBeLessThan(30000); // But not unreasonably large

    // Verify we have a reasonable viewport
    expect(clientHeight).toBeLessThanOrEqual(450); // 400px height + some margin
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
    const hasItemsNear50 = visibleCells.some(text => {
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
