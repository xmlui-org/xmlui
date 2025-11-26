/**
 * Table Component End-to-End Tests
 * 
 * This test suite provides comprehensive coverage for the Table component following
 * XMLUI testing conventions. The tests validate all documented properties, events,
 * accessibility features, and edge cases.
 * 
 * Test Results Summary:
 * - ✅ 25 tests passing
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
        </Table>
      `);
      
      const nameHeader = page.getByRole("button").filter({ hasText: "Name" }).first();
      const quantityHeader = page.getByRole("button").filter({ hasText: "Quantity" }).first();
      
      // Click to sort by name
      await nameHeader.click();
      
      // Both indicators should still be visible
      await expect(nameHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
      await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).toBeVisible();
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
      await expect(quantityHeader.locator("[data-part-id='orderIndicator']")).toHaveCount(0);
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

  test("pagination works correctly",
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table 
          data='{${JSON.stringify(sampleData)}}' 
          isPaginated="true" 
          testId="table"
        >
          <Column bindTo="name"/>
        </Table>
      `);
      await expect(page.locator("button[aria-label*='Previous page']")).toBeVisible();
      await expect(page.locator("button[aria-label*='Next page']")).toBeVisible();
    }
  );
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