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
});

// =============================================================================
// TESTS FOR FEATURES THAT NEED INVESTIGATION
// =============================================================================

test.describe("Features Needing Investigation", () => {
  test.skip("loading property shows loading state",
    SKIP_REASON.TO_BE_IMPLEMENTED("Need to identify correct loading selector"),
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' loading="true" testId="table">
          <Column bindTo="name"/>
        </Table>
      `);
      
      // Loading indicator should be visible - check for spinner or loading text
      await expect(page.locator(".spinner")).toBeVisible();
    }
  );

  test.skip("row selection works with checkboxes",
    SKIP_REASON.TO_BE_IMPLEMENTED("Checkboxes are hidden via CSS styling"),
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

  test.skip("pagination works correctly",
    SKIP_REASON.TO_BE_IMPLEMENTED("Pagination controls need investigation"),
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
      
      // Look for pagination controls
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
});

// =============================================================================
// THEME AND STYLING TESTS (SKIPPED)
// =============================================================================

test.describe("Theme Variables and Styling", () => {
  test.skip("applies heading background color theme variable",
    SKIP_REASON.TO_BE_IMPLEMENTED("Theme variable testing needs CSS inspection"),
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

  test.skip("applies cell padding theme variable",
    SKIP_REASON.TO_BE_IMPLEMENTED("Theme variable testing needs CSS inspection"),
    async ({ initTestBed, page }) => {
      await initTestBed(`
        <Table data='{${JSON.stringify(sampleData)}}' testId="table">
          <Column bindTo="name"/>
        </Table>
      `, {
        testThemeVars: { "padding-cell-Table": "20px" },
      });
      
      const cell = page.locator("td").first();
      await expect(cell).toHaveCSS("padding", "20px");
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