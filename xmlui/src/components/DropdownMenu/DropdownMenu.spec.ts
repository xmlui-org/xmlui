import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("component renders with default properties", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DropdownMenu label="Menu" />`, {});
  
  // Check that the dropdown button is visible
  await expect(page.locator("button")).toBeVisible();
  await expect(page.locator("button")).toHaveText("Menu");
});

test.skip("component opens menu when clicked", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Click on the dropdown button
  await page.locator("button").click();
  
  // Check that the menu is visible
  await expect(page.locator(".dropdown-content")).toBeVisible();
  
  // Check that menu items are visible
  await expect(page.locator(".menu-item").first()).toHaveText("Item 1");
  await expect(page.locator(".menu-item").nth(1)).toHaveText("Item 2");
});

test.skip("component closes menu when item is clicked", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem onClick="testState = 'clicked'">Click Me</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Click on the dropdown button to open menu
  await page.locator("button").click();
  
  // Click on the menu item
  await page.locator(".menu-item").click();
  
  // Check that the menu closed
  await expect(page.locator(".dropdown-content")).not.toBeVisible();
  
  // Check that the onClick event fired
  await expect.poll(() => testStateDriver.testState).toEqual("clicked");
});

test.skip("component renders with custom trigger template", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu triggerTemplate={<Button variant="primary">Custom Trigger</Button>}>
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Check that the custom trigger is visible
  await expect(page.locator("button")).toBeVisible();
  await expect(page.locator("button")).toHaveText("Custom Trigger");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct ARIA attributes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Actions">
      <MenuItem>Action 1</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Check that the button has correct ARIA attributes
  await expect(page.locator("button")).toHaveAttribute("aria-haspopup", "true");
  
  // Open the menu
  await page.locator("button").click();
  
  // Check that the menu has correct ARIA attributes
  await expect(page.locator("[role='menu']")).toBeVisible();
  await expect(page.locator(".menu-item")).toHaveAttribute("role", "menuitem");
});

test.skip("component is keyboard navigable", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Focus the dropdown button
  await page.locator("button").focus();
  await expect(page.locator("button")).toBeFocused();
  
  // Press Enter to open menu
  await page.keyboard.press("Enter");
  await expect(page.locator(".dropdown-content")).toBeVisible();
  
  // Check that first menu item is focused
  await expect(page.locator(".menu-item").first()).toBeFocused();
  
  // Press Arrow Down to navigate to second item
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(".menu-item").nth(1)).toBeFocused();
  
  // Press Escape to close menu
  await page.keyboard.press("Escape");
  await expect(page.locator(".dropdown-content")).not.toBeVisible();
});

test.skip("component closes menu when clicking outside", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <VStack>
      <DropdownMenu label="Menu">
        <MenuItem>Item 1</MenuItem>
      </DropdownMenu>
      <Text>Click outside target</Text>
    </VStack>
  `, {});
  
  // Open the menu
  await page.locator("button").click();
  await expect(page.locator(".dropdown-content")).toBeVisible();
  
  // Click outside the menu
  await page.locator("text=Click outside target").click();
  
  // Check that the menu closed
  await expect(page.locator(".dropdown-content")).not.toBeVisible();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.skip("component shows different button variants", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  // Test primary variant
  await initTestBed(`<DropdownMenu label="Menu" triggerButtonVariant="primary" />`, {});
  await expect(page.locator("button")).toHaveClass(/primary/);
  
  // Test secondary variant
  await initTestBed(`<DropdownMenu label="Menu" triggerButtonVariant="secondary" />`, {});
  await expect(page.locator("button")).toHaveClass(/secondary/);
  
  // Test ghost variant (default)
  await initTestBed(`<DropdownMenu label="Menu" />`, {});
  await expect(page.locator("button")).toHaveClass(/ghost/);
});

test.skip("component applies theme variables correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DropdownMenu label="Menu" />`, {
    testThemeVars: {
      "backgroundColor-DropdownMenu": "rgb(240, 240, 240)",
      "borderColor-DropdownMenu": "rgb(255, 0, 0)"
    }
  });
  
  // Open the menu
  await page.locator("button").click();
  
  // Check that theme variables are applied to the dropdown content
  await expect(page.locator(".dropdown-content")).toHaveCSS("background-color", "rgb(240, 240, 240)");
  await expect(page.locator(".dropdown-content")).toHaveCSS("border-color", "rgb(255, 0, 0)");
});

test.skip("component respects alignment property", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  // Test start alignment (default)
  await initTestBed(`
    <DropdownMenu label="Menu" alignment="start">
      <MenuItem>Item</MenuItem>
    </DropdownMenu>
  `, {});
  
  await page.locator("button").click();
  await expect(page.locator(".dropdown-content")).toHaveClass(/start/);
  
  // Test end alignment
  await initTestBed(`
    <DropdownMenu label="Menu" alignment="end">
      <MenuItem>Item</MenuItem>
    </DropdownMenu>
  `, {});
  
  await page.locator("button").click();
  await expect(page.locator(".dropdown-content")).toHaveClass(/end/);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("component handles disabled state correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Menu" enabled={false}>
      <MenuItem>Item</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Check that the button is disabled
  await expect(page.locator("button")).toBeDisabled();
  
  // Try to click the disabled button
  await page.locator("button").click({ force: true });
  
  // Check that the menu didn't open
  await expect(page.locator(".dropdown-content")).not.toBeVisible();
});

test.skip("component handles empty menu gracefully", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DropdownMenu label="Empty Menu" />`, {});
  
  // Click on the dropdown button
  await page.locator("button").click();
  
  // Check that an empty menu is displayed
  await expect(page.locator(".dropdown-content")).toBeVisible();
  await expect(page.locator(".menu-item")).toHaveCount(0);
});

test.skip("component handles menu separators correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuSeparator />
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `, {});
  
  // Open the menu
  await page.locator("button").click();
  
  // Check that separator is displayed
  await expect(page.locator(".menu-separator")).toBeVisible();
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.skip("component handles rapid open/close actions", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `, {});
  
  const button = page.locator("button");
  
  // Open and close the menu multiple times rapidly
  // First cycle
  await button.click();
  await expect(page.locator(".dropdown-content")).toBeVisible();
  await button.click();
  
  // Second cycle
  await button.click();
  await expect(page.locator(".dropdown-content")).toBeVisible();
  await button.click();
  
  // Third cycle
  await button.click();
  await expect(page.locator(".dropdown-content")).toBeVisible();
  
  // Check that menu items are still accessible
  await expect(page.locator(".menu-item").first()).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component works with nested submenus", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <DropdownMenu label="Main Menu">
      <MenuItem>Item 1</MenuItem>
      <SubMenuItem label="Submenu">
        <MenuItem>Sub Item 1</MenuItem>
        <MenuItem>Sub Item 2</MenuItem>
      </SubMenuItem>
    </DropdownMenu>
  `, {});
  
  // Open the main menu
  await page.locator("button").click();
  
  // Hover over the submenu
  await page.locator(".submenu-trigger").hover();
  
  // Check that the submenu is visible
  await expect(page.locator(".submenu-content")).toBeVisible();
  
  // Check submenu items
  await expect(page.locator(".submenu-content .menu-item").first()).toHaveText("Sub Item 1");
});

test.skip("component works when dynamically changing menu items", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <State initial={["Item 1", "Item 2"]}>
      <DropdownMenu ref="menu" label="Dynamic Menu">
        <ForEach in={$value}>
          <MenuItem>{$item}</MenuItem>
        </ForEach>
      </DropdownMenu>
      <Button onClick="$value = ['New Item 1', 'New Item 2', 'New Item 3']">Change Items</Button>
    </State>
  `, {});
  
  // Open the menu
  await page.locator("button").filter({ hasText: "Dynamic Menu" }).click();
  
  // Check initial items
  await expect(page.locator(".menu-item")).toHaveCount(2);
  
  // Close the menu
  await page.keyboard.press("Escape");
  
  // Click the button to change items
  await page.locator("button").filter({ hasText: "Change Items" }).click();
  
  // Open the menu again
  await page.locator("button").filter({ hasText: "Dynamic Menu" }).click();
  
  // Check updated items
  await expect(page.locator(".menu-item")).toHaveCount(3);
});
