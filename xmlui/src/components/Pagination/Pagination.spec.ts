import { xmlUiMarkupToComponent } from "../../components-core/xmlui-parser";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("does not render if no props are set", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination />`);

    // Should not show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Previous page" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Next page" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Last page" })).not.toBeVisible();

    // Should show page info by default
    await expect(page.getByText("Page 1 of 10 (100 items)")).not.toBeVisible();
  });

  test("controls are disabled if enabled=false", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination enabled="false" itemCount="100" pageSize="10" pageIndex="0" />`);

    // Should not show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeDisabled();
  });

  test("controls are disabled if enabled=false #2", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination enabled="false" itemCount="100" pageSize="10" pageIndex="0" maxVisiblePages="3" />`);

    // Should not show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Page 1" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Page 2" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Page 3" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeDisabled();
  });

  test("renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="100" pageSize="10" pageIndex="0" />`);
    
    // Should show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next page" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Last page" })).toBeVisible();

    // Should show page info by default
    await expect(page.getByText("Page 1 of 10 (100 items)")).toBeVisible();
  });

  test("does not render when itemCount is zero", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="0"/>`);
    
    // Component should not be visible
    await expect(page.getByRole("button", { name: "First page" })).not.toBeVisible();
    await expect(page.getByText(/Page \d+ of \d+/)).not.toBeVisible();
  });

  test("handles itemCount property correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="25" pageSize="5"/>`);
    
    // Should calculate correct total pages (25 items / 5 per page = 5 pages)
    await expect(page.getByText("Page 1 of 5 (25 items)")).toBeVisible();
  });

  test("handles pageSize property correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="100" pageSize="20"/>`);
    
    // Should calculate correct total pages (100 items / 20 per page = 5 pages)
    await expect(page.getByText("Page 1 of 5 (100 items)")).toBeVisible();
  });

  test("handles hasPageInfo property correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" hasPageInfo="false"/>`);
    
    // Should not show page info when hasPageInfo is false
    await expect(page.getByText(/Page \d+ of \d+/)).not.toBeVisible();
    
    // But should still show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).toBeVisible();
  });

  test("handles pageIndex property correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageIndex="2" hasPageInfo="false" />`);
    
    // Should show page 3 (0-based index 2)
    await expect(page.getByText("3")).toBeVisible();
  });

  test.skip("handles maxVisiblePages property correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="100" pageSize="10" maxVisiblePages="3"/>`);
    
    // With maxVisiblePages=3, should only show 3 page buttons
    const pageButtons = page.getByRole("button").filter({ hasText: /^\d+$/ });
    await expect(pageButtons).toHaveCount(3);
    
    // Should show pages 1, 2, 3
    await expect(page.getByRole("button", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 2" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 3" })).toBeVisible();
  });

  test.skip("handles maxVisiblePages when there's only one page", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="5" pageSize="10" maxVisiblePages="1"/>`);
    
    // Should show just the page number as text, not a button
    await expect(page.getByText("1")).toBeVisible();
    // Should not have clickable page buttons
    const pageButtons = page.getByRole("button").filter({ hasText: /^\d+$/ });
    await expect(pageButtons).toHaveCount(0);
  });

  test("navigation buttons are disabled correctly on first page", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageIndex="0"/>`);
    
    // First and Previous buttons should be disabled
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
    
    // Next and Last buttons should be enabled
    await expect(page.getByRole("button", { name: "Next page" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeEnabled();
  });

  test("navigation buttons are disabled correctly on last page", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageIndex="4"/>`);
    
    // Next and Last buttons should be disabled
    await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeDisabled();
    
    // First and Previous buttons should be enabled
    await expect(page.getByRole("button", { name: "First page" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  test("handles edge case with single item", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="1" pageSize="10"/>`);
    
    await expect(page.getByText("Page 1 of 1 (1 items)")).toBeVisible();
    await expect(page.getByRole("button", { name: "First Page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous Page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next Page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last Page" })).toBeDisabled();

  });

  test("handles negative itemCount gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="-5" pageSize="10" pageIndex="0"/>`);
    
    // Should handle negative itemCount gracefully - component should show safe defaults
    await expect(page.getByText('1', { exact: true })).toBeVisible();
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
  });

  test("handles negative pageIndex gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="10" pageSize="5" pageIndex="-1"/>`);
    
    // Should clamp pageIndex to 0 and render first page
    await expect(page.getByText("Page 1 of 2 (10 items)")).toBeVisible();
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  test("handles negative pageSize gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="10" pageSize="-5" pageIndex="0"/>`);

    // Should clamp pageSize to 1 and render first page
    await expect(page.getByText("Page 1 of 1 (10 items)")).toBeVisible();
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });
});

// =============================================================================
// PAGE SIZE SELECTOR TESTS  
// =============================================================================

test.describe("Page Size Selector", () => {
  test("does not show page size selector when pageSizeOptions is not provided", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10"/>`);
    
    // Should not show page size selector
    await expect(page.getByText("Rows per page")).not.toBeVisible();
  });

  test("does not show page size selector when pageSizeOptions has only one option", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageSizeOptions="{[10]}"/>`);
    
    // Should not show page size selector for single option
    await expect(page.getByText("Rows per page")).not.toBeVisible();
  });

  test("shows page size selector when multiple pageSizeOptions are provided", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageSizeOptions="{[5, 10, 20]}"/>`);
    
    // Should show page size selector
    await expect(page.getByText("Rows per page")).toBeVisible();
    
    // Should show select dropdown with current value
    const select = page.locator('select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue("10");
    
    // Check that all options exist in the DOM (even if not visible)
    await expect(select.locator('option[value="5"]')).toHaveCount(1);
    await expect(select.locator('option[value="10"]')).toHaveCount(1);
    await expect(select.locator('option[value="20"]')).toHaveCount(1);
  });

  test("page size selector is disabled when component is disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination enabled="false" itemCount="50" pageSize="10" pageSizeOptions="{[5, 10, 20]}"/>`);
    
    // Select should be disabled
    const select = page.locator('select');
    await expect(select).toBeDisabled();
  });

  test("page size selector allows changing selection", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageSizeOptions="{[5, 10, 20]}"/>`);
    
    // Should show page size selector
    await expect(page.getByText("Rows per page")).toBeVisible();
    
    // Should start with correct value
    const select = page.locator('select');
    await expect(select).toHaveValue("10");
    
    // Should be able to interact with the select (this triggers the event)
    await select.selectOption('20');
    
    // Note: In a real application, the parent would update the pageSize prop
    // which would cause the select to show the new value. For this test,
    // we're just verifying the interaction is possible.
  });

  test("page size selector reflects current pageSize", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="100" pageSize="20" pageSizeOptions="{[5, 10, 20, 50]}"/>`);
    
    // Select should show current page size
    const select = page.locator('select');
    await expect(select).toHaveValue("20");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("component container has correct role", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" />`);    
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("navigation buttons have correct accessibility attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10"/>`);
    
    // Check button roles and labels
    await expect(page.getByLabel("First page")).toBeVisible();
    await expect(page.getByLabel("Previous page")).toBeVisible();
    await expect(page.getByLabel("Next page")).toBeVisible();
    await expect(page.getByLabel("Last page")).toBeVisible();
  });

  test("page indicator has correct aria attribute if maxVisiblePages=1", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" maxVisiblePages="1"/>`);
    await expect(page.getByText("1", { exact: true })).toHaveAttribute("aria-current", "true");
  });

  test("page buttons have correct accessibility attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" maxVisiblePages="5"/>`);
    
    // Page buttons should have appropriate labels
    await expect(page.getByLabel("Page 1")).toBeVisible();
    await expect(page.getByLabel("Page 2")).toBeVisible();
    await expect(page.getByLabel("Page 3")).toBeVisible();
    await expect(page.getByLabel("Page 4")).toBeVisible();
    await expect(page.getByLabel("Page 5")).toBeVisible();
  });

  test("current page button has correct aria attribute if maxVisiblePages>1", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" maxVisiblePages="5"/>`);
    await expect(page.getByLabel("Page 1 (current)", { exact: true })).toBeVisible();
  });

  test("disabled buttons are properly marked as disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageIndex="0"/>`);
    
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next page" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeEnabled();
  });

  test("disabled buttons are properly marked as disabled #2", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" pageIndex="5"/>`);
    
    await expect(page.getByRole("button", { name: "First page" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Previous page" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeDisabled();
  });

  test("buttons are focusable and keyboard navigable", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" maxVisiblePages="3"/>`);
    
    // Test tab navigation through buttons
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Page 1" })).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Page 2" })).toBeFocused();
  });
});

// =============================================================================
// INTERACTION TESTS
// =============================================================================

test.describe("User Interactions", () => {
  test("page button click triggers pageDidChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="0" 
        maxVisiblePages="5"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    await page.getByRole("button", { name: "Page 3" }).click();
    await expect.poll(testStateDriver.testState).toBe(2); // 0-based index
  });

  test("next button click triggers pageDidChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="0"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    await page.getByRole("button", { name: "Next page" }).click();
    await expect.poll(testStateDriver.testState).toBe(1);
  });

  test("previous button click triggers pageDidChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="2"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    await page.getByRole("button", { name: "Previous page" }).click();
    await expect.poll(testStateDriver.testState).toBe(1);
  });

  test("first page button click triggers pageDidChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="3"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    await page.getByRole("button", { name: "First page" }).click();
    await expect.poll(testStateDriver.testState).toBe(0);
  });

  test("last page button click triggers pageDidChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="0"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    await page.getByRole("button", { name: "Last page" }).click();
    await expect.poll(testStateDriver.testState).toBe(4); // Last page index
  });

  test("keyboard navigation works on page buttons", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Pagination
        var.current="0"
        pageIndex="{current}"
        onPageDidChange="(next) => current = next"
        itemCount="50"
        pageSize="10"
        maxVisiblePages="5" />
    `);
    
    const pageButton = page.getByRole("button", { name: "Page 2" });
    await pageButton.click();
    // Should navigate to page 2 (button should become active)
    await expect(pageButton).toHaveAttribute("aria-label", "Page 2 (current)");
    await expect(pageButton).toHaveAttribute("aria-current", "true");
  });

  test("space key activates page buttons", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="0"
        maxVisiblePages="5"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    const pageButton = page.getByRole("button", { name: "Page 3" });
    await pageButton.focus();
    await pageButton.press("Space");
    
    await expect.poll(testStateDriver.testState).toBe(2);
  });

  test("enter key activates page buttons", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination 
        itemCount="50" 
        pageSize="10" 
        pageIndex="0"
        maxVisiblePages="5"
        onPageDidChange="arg => testState = arg"
      />
    `);
    
    const pageButton = page.getByRole("button", { name: "Page 3" });
    await pageButton.focus();
    await pageButton.press("Enter");
    
    await expect.poll(testStateDriver.testState).toBe(2);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Component APIs", () => {
  test("moveFirst API method works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="3"
          onPageDidChange="arg => testState = arg"
        />
        <Button onClick="pagination.moveFirst()">Move First</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Move First" }).click();
    await expect.poll(testStateDriver.testState).toBe(0);
  });

  test("moveLast API method works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="0"
          onPageDidChange="arg => testState = arg"
        />
        <Button onClick="pagination.moveLast()">Move Last</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Move Last" }).click();
    await expect.poll(testStateDriver.testState).toBe(4);
  });

  test("movePrev API method works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="2"
          onPageDidChange="arg => testState = arg"
        />
        <Button onClick="pagination.movePrev()">Move Previous</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Move Previous" }).click();
    await expect.poll(testStateDriver.testState).toBe(1);
  });

  test("moveNext API method works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="1"
          onPageDidChange="arg => testState = arg"
        />
        <Button onClick="pagination.moveNext()">Move Next</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Move Next" }).click();
    await expect.poll(testStateDriver.testState).toBe(2);
  });

  test("currentPage API method returns correct value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="2"
        />
        <Button onClick="testState = pagination.currentPage()">Get Current Page</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Get Current Page" }).click();
    await expect.poll(testStateDriver.testState).toBe(3); // 1-based page number
  });

  test("currentPageSize API method returns correct value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="15"
        />
        <Button onClick="testState = pagination.currentPageSize()">Get Page Size</Button>
      </Fragment>
    `);
    
    await page.getByRole("button", { name: "Get Page Size" }).click();
    await expect.poll(testStateDriver.testState).toBe(15);
  });

  test("API methods handle boundary conditions correctly (moveFirst, movePrev)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="0"
          onPageDidChange="arg => testState = testState == null ? [arg] : [...testState, arg]"
        />
        <Button onClick="pagination.movePrev()">Move Previous From First</Button>
        <Button onClick="pagination.moveFirst()">Move First From First</Button>
      </Fragment>
    `);
    
    // Try to move previous from first page - should not trigger event
    await page.getByRole("button", { name: "Move Previous From First" }).click();
    await page.getByRole("button", { name: "Move First From First" }).click();
    
    // Should not have triggered any page changes since we're already on first page
    await expect.poll(testStateDriver.testState).toBeNull();
  });

  test("API methods handle boundary conditions correctly (moveLast, moveNext)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Pagination 
          id="pagination"
          itemCount="50" 
          pageSize="10" 
          pageIndex="5"
          onPageDidChange="arg => testState = testState == null ? [arg] : [...testState, arg]"
        />
        <Button onClick="pagination.moveNext()">Move Next From Last</Button>
        <Button onClick="pagination.moveLast()">Move Last From Last</Button>
      </Fragment>
    `);

    // Try to move next from last page - should not trigger event
    await page.getByRole("button", { name: "Move Next From Last" }).click();
    await page.getByRole("button", { name: "Move Last From Last" }).click();

    // Should not have triggered any page changes since we're already on last page
    await expect.poll(testStateDriver.testState).toBeNull();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("visible pages adjust correctly when navigating", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Pagination 
        itemCount="100" 
        pageSize="10" 
        pageIndex="5"
        maxVisiblePages="3"
      />
    `);
    
    // Should show pages around current page (page 6: index 5)
    await expect(page.getByRole("button", { name: "Page 5" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 6" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 7" })).toBeVisible();
  });

  test("visible pages handle edge case near beginning", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Pagination 
        itemCount="100" 
        pageSize="10" 
        pageIndex="0"
        maxVisiblePages="3"
      />
    `);
    
    // Should show first 3 pages when on first page
    await expect(page.getByRole("button", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 2" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 3" })).toBeVisible();
  });

  test("visible pages handle edge case near end", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Pagination 
        itemCount="100" 
        pageSize="10" 
        pageIndex="9"
        maxVisiblePages="3"
      />
    `);
    
    // Should show last 3 pages when on last page
    await expect(page.getByRole("button", { name: "Page 8" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 9" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 10" })).toBeVisible();
  });

  test("shows all pages when total pages less than maxVisiblePages", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Pagination 
        itemCount="30" 
        pageSize="10" 
        maxVisiblePages="5"
      />
    `);
    
    // Should show all 3 pages since 3 < 5
    await expect(page.getByRole("button", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 2" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 3" })).toBeVisible();
    
    // Should not show page 4 or 5
    await expect(page.getByRole("button", { name: "Page 4" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Page 5" })).not.toBeVisible();
  });

  test("handles extremely large numbers", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="9999999" pageSize="1000"/>`);
    
    // Should handle large numbers without crashing
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible();
    await expect(page.getByRole("button", { name: "First page" })).toBeVisible();
  });

  test("handles page size larger than item count", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="5" pageSize="20"/>`);
    
    // Should show only 1 page when page size exceeds item count
    await expect(page.getByText("Page 1 of 1 (5 items)")).toBeVisible();
    await expect(page.getByRole("button", { name: "First page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Last page" })).toBeDisabled();
  });

  test("handles pageIndex beyond valid range", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="30" pageSize="10" pageIndex="999"/>`);
    
    // Should clamp to valid range - last page should be shown
    await expect(page.getByText("Page 3 of 3 (30 items)")).toBeVisible();
  });

  test("handles maxVisiblePages of 1 correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="50" pageSize="10" maxVisiblePages="1"/>`);
    
    // Should show only current page as text, not as button
    await expect(page.getByText("1", { exact: true })).toBeVisible();

    // Should still show navigation buttons
    await expect(page.getByRole("button", { name: "First page" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next page" })).toBeVisible();
  });

  test("handles maxVisiblePages larger than total pages", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="20" pageSize="10" maxVisiblePages="10"/>`);
    
    // Invalid maxVisiblePages (10) should fall back to default (1)
    // With maxVisiblePages=1, should show current page as text, not buttons
    await expect(page.getByText("1", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Page 1" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Page 2" })).not.toBeVisible();
  });

  test("works correctly with fractional page calculations", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="17" pageSize="5"/>`);
    
    // 17 items / 5 per page = 3.4 -> should round up to 4 pages
    await expect(page.getByText("Page 1 of 4 (17 items)")).toBeVisible();
  });
});
