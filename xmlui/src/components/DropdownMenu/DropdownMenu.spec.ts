import { expect, test } from "../../testing/fixtures";
import { DropdownMenuDriver } from "../../testing/ComponentDrivers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic props", async ({ initTestBed, createDropdownMenuDriver }) => {
  await initTestBed(`<DropdownMenu label="Menu" />`);
  const driver = await createDropdownMenuDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Menu");
});

test("component renders with menu items", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Trigger should be visible
  await expect(driver.component).toBeVisible();
  
  // Open menu using driver method
  await driver.open();
  
  // Menu items should be visible after opening
  await expect(page.getByText("Item 1")).toBeVisible();
  await expect(page.getByText("Item 2")).toBeVisible();
});

test("component opens and closes menu correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Initially menu should not be visible
  await expect(driver.isOpen()).resolves.toBe(false);
  
  // Open menu
  await driver.open();
  await expect(driver.isOpen()).resolves.toBe(true);
  await expect(page.getByText("Item 1")).toBeVisible();
  
  // Close menu
  await driver.close();
  await expect(driver.isOpen()).resolves.toBe(false);
  await expect(page.getByText("Item 1")).not.toBeVisible();
});

test("component handles menu item clicks", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem onClick="testState = 'item1-clicked'">Item 1</MenuItem>
      <MenuItem onClick="testState = 'item2-clicked'">Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Open menu and click first item using driver method
  await driver.open();
  await driver.clickMenuItem("Item 1");
  await expect.poll(testStateDriver.testState).toEqual('item1-clicked');
  
  // Menu should close after click
  await expect(driver.isOpen()).resolves.toBe(false);
});

test("component handles different alignment options", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  // Test start alignment (default)
  await initTestBed(`
    <DropdownMenu label="Start Menu" alignment="start">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const startDriver = await createDropdownMenuDriver();
  await startDriver.open();
  await expect(page.getByText("Item 1")).toBeVisible();
  await startDriver.close();
  
  // Test end alignment
  await initTestBed(`
    <DropdownMenu label="End Menu" alignment="end">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const endDriver = await createDropdownMenuDriver();
  await endDriver.open();
  await expect(page.getByText("Item 1")).toBeVisible();
});

test("component supports submenu functionality", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Regular Item</MenuItem>
      <SubMenuItem label="Submenu">
        <MenuItem>Submenu Item 1</MenuItem>
        <MenuItem>Submenu Item 2</MenuItem>
      </SubMenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Open main menu
  await driver.open();
  await expect(page.getByText("Regular Item")).toBeVisible();
  await expect(page.getByText("Submenu")).toBeVisible();
  
  // Open submenu using driver method
  await driver.openSubMenu("Submenu");
  await expect(page.getByText("Submenu Item 1")).toBeVisible();
  await expect(page.getByText("Submenu Item 2")).toBeVisible();
});

test("component supports menu separators", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuSeparator />
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  await driver.open();
  await expect(page.getByText("Item 1")).toBeVisible();
  await expect(page.getByText("Item 2")).toBeVisible();
  
  // Check that separator is rendered using driver method
  const separators = driver.getMenuSeparators();
  await expect(separators).toHaveCount(1);
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`<DropdownMenu label="Accessible Menu" />`);
  const driver = await createDropdownMenuDriver();
  
  // Trigger button should have button role
  const trigger = driver.getTrigger();
  await expect(trigger).toHaveRole('button');
  
  // Should be accessible by label
  const button = page.getByRole('button', { name: 'Accessible Menu' });
  await expect(button).toBeVisible();
});

test("component is keyboard accessible", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Keyboard Menu">
      <MenuItem onClick="testState = 'keyboard-activated'">Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Focus and open with keyboard
  const trigger = driver.getTrigger();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  
  // Open with Enter
  await trigger.press('Enter');
  await expect(page.getByText("Item 1")).toBeVisible();
  
  // Navigate and select with keyboard
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('keyboard-activated');
});

test("component supports screen reader navigation", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Screen Reader Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  await driver.open();
  
  // Menu items should have menuitem role
  const menuItems = driver.getMenuItems();
  await expect(menuItems).toHaveCount(2);
  
  // Menu should have menu role
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
});

test("disabled component is not keyboard accessible", async ({ initTestBed, createDropdownMenuDriver }) => {
  await initTestBed(`<DropdownMenu label="Disabled Menu" enabled="false" />`);
  const driver = await createDropdownMenuDriver();
  
  const trigger = driver.getTrigger();
  // Should be disabled
  await expect(trigger).toBeDisabled();
  
  // Should not be focusable when disabled
  await trigger.focus();
  await expect(trigger).not.toBeFocused();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component applies different trigger button variants", async ({ initTestBed, createDropdownMenuDriver }) => {
  // Test default ghost variant
  await initTestBed(`<DropdownMenu label="Ghost Menu" triggerButtonVariant="ghost" />`);
  const ghostDriver = await createDropdownMenuDriver();
  await expect(ghostDriver.component).toBeVisible();
  
  // Test solid variant
  await initTestBed(`<DropdownMenu label="Solid Menu" triggerButtonVariant="solid" />`);
  const solidDriver = await createDropdownMenuDriver();
  await expect(solidDriver.component).toBeVisible();
  
  // Test outline variant
  await initTestBed(`<DropdownMenu label="Outline Menu" triggerButtonVariant="outline" />`);
  const outlineDriver = await createDropdownMenuDriver();
  await expect(outlineDriver.component).toBeVisible();
});

test("component applies different trigger button theme colors", async ({ initTestBed, createDropdownMenuDriver }) => {
  // Test primary theme
  await initTestBed(`<DropdownMenu label="Primary Menu" triggerButtonThemeColor="primary" />`);
  const primaryDriver = await createDropdownMenuDriver();
  await expect(primaryDriver.component).toBeVisible();
  
  // Test secondary theme
  await initTestBed(`<DropdownMenu label="Secondary Menu" triggerButtonThemeColor="secondary" />`);
  const secondaryDriver = await createDropdownMenuDriver();
  await expect(secondaryDriver.component).toBeVisible();
});

test("component displays trigger button icon correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`<DropdownMenu label="Menu with Icon" triggerButtonIcon="test" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  const driver = await createDropdownMenuDriver();
  
  await expect(driver.component).toBeVisible();
  // Icon should be present in the button
  const icon = driver.component.locator('svg, img').first();
  await expect(icon).toBeVisible();
});

test("component handles icon position correctly", async ({ initTestBed, createDropdownMenuDriver }) => {
  // Test icon at end (default)
  await initTestBed(`<DropdownMenu label="Menu" triggerButtonIcon="test" triggerButtonIconPosition="end" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  const endDriver = await createDropdownMenuDriver();
  await expect(endDriver.component).toBeVisible();
  
  // Test icon at start
  await initTestBed(`<DropdownMenu label="Menu" triggerButtonIcon="test" triggerButtonIconPosition="start" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  const startDriver = await createDropdownMenuDriver();
  await expect(startDriver.component).toBeVisible();
});

test("component applies theme variables correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Themed Menu">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `, {
    testThemeVars: {
      "backgroundColor-DropdownMenu": "rgb(255, 0, 0)",
      "minWidth-DropdownMenu": "200px",
    },
  });
  const driver = await createDropdownMenuDriver();
  
  // Open menu to see styled content
  await driver.open();
  
  // Check theme variables are applied to menu content
  const menuContent = driver.getMenuContent();
  await expect(menuContent).toBeVisible();
  await expect(menuContent).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(menuContent).toHaveCSS("min-width", "200px");
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles null and undefined props gracefully", async ({ initTestBed, createDropdownMenuDriver }) => {
  // Test with minimal props
  await initTestBed(`<DropdownMenu />`);
  const driver1 = await createDropdownMenuDriver();
  await expect(driver1.component).toBeVisible();
  
  // Test with empty label
  await initTestBed(`<DropdownMenu label="" />`);
  const driver2 = await createDropdownMenuDriver();
  await expect(driver2.component).toBeVisible();
  
  // Test with undefined label (should still render)
  await initTestBed(`<DropdownMenu label="{undefined}" />`);
  const driver3 = await createDropdownMenuDriver();
  await expect(driver3.component).toBeVisible();
});

test("component handles special characters in labels", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu with émojis 🚀">
      <MenuItem>Item with ñ and ü</MenuItem>
      <MenuItem>Item with &amp; &lt; &gt; quotes</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Menu with émojis 🚀");
  
  await driver.open();
  await expect(page.getByText("Item with ñ and ü")).toBeVisible();
  await expect(page.getByText("Item with & < > quotes")).toBeVisible();
});

test("component handles empty menu gracefully", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`<DropdownMenu label="Empty Menu" />`);
  const driver = await createDropdownMenuDriver();
  
  await expect(driver.component).toBeVisible();
  
  // Should still be able to open even with no items
  await driver.open();
  
  // Menu should be closed since there are no items to show
  // This is actually correct behavior for an empty menu
  await expect(driver.isOpen()).resolves.toBe(false);
});

test("component handles very long labels", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const longLabel = "This is a very long label that might cause issues with component rendering or layout. It contains many words and should test how the component handles text overflow and wrapping scenarios.";
  
  await initTestBed(`
    <DropdownMenu label="${longLabel}">
      <MenuItem>Short item</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  await expect(driver.component).toBeVisible();
  await driver.open();
  await expect(page.getByText("Short item")).toBeVisible();
});

test("component handles disabled menu items", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem enabled="true" onClick="testState = 'enabled-clicked'">Enabled Item</MenuItem>
      <MenuItem enabled="false" onClick="testState = 'disabled-clicked'">Disabled Item</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  await driver.open();
  
  // Enabled item should work
  await driver.clickMenuItem("Enabled Item");
  await expect.poll(testStateDriver.testState).toEqual('enabled-clicked');
  
  // Reopen menu
  await driver.open();
  
  // Disabled item should not trigger onClick (click should be prevented)
  await page.getByText("Disabled Item").click();
  await expect.poll(testStateDriver.testState).not.toEqual('disabled-clicked');
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly in different layout contexts", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <VStack>
      <HStack>
        <DropdownMenu label="Layout Test Menu">
          <MenuItem>Item 1</MenuItem>
        </DropdownMenu>
        <Text>Adjacent content</Text>
      </HStack>
    </VStack>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Component should render correctly in layout
  await expect(driver.component).toBeVisible();
  
  // Test bounding box and dimensions
  const boundingBox = await driver.component.boundingBox();
  expect(boundingBox).not.toBeNull();
  expect(boundingBox!.width).toBeGreaterThan(0);
  expect(boundingBox!.height).toBeGreaterThan(0);
  
  // Menu should still work in layout context
  await driver.open();
  await expect(page.getByText("Item 1")).toBeVisible();
});

test("component supports custom trigger template", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  // TODO: Review custom trigger template implementation
  // Current behavior shows default trigger text instead of custom template content
  await initTestBed(`
    <DropdownMenu>
      <property name="triggerTemplate">
        <Button variant="solid" themeColor="secondary">Custom Trigger</Button>
      </property>
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Custom trigger should be visible - use a more general approach
  await expect(driver.component).toBeVisible();
  
  // The trigger template will be the component itself
  const customTrigger = driver.component;
  await expect(customTrigger).toBeVisible();
  await expect(customTrigger).toContainText('Custom Trigger');
  
  // Custom trigger should work
  await customTrigger.click();
  await expect(page.getByText("Item 1")).toBeVisible();
  await expect(page.getByText("Item 2")).toBeVisible();
});

test("component handles onWillOpen event correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Event Menu" onWillOpen="testState = 'willOpen-fired'; return true">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Click to trigger onWillOpen event
  await driver.open();
  
  // Event should have fired
  await expect.poll(testStateDriver.testState).toEqual('willOpen-fired');
  
  // Menu should be open
  await expect(page.getByText("Item 1")).toBeVisible();
});

test("component prevents opening when onWillOpen returns false", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Prevented Menu" onWillOpen="return false">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Click should not open menu due to onWillOpen returning false
  await driver.open();
  await expect(page.getByText("Item 1")).not.toBeVisible();
});

test("component API methods work correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <DropdownMenu id="apiMenu" label="API Menu">
        <MenuItem>Item 1</MenuItem>
      </DropdownMenu>
      <Button testId="openBtn" onClick="apiMenu.open()">Open Menu</Button>
      <Button testId="closeBtn" onClick="apiMenu.close()">Close Menu</Button>
    </Fragment>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Initially closed
  await expect(driver.isOpen()).resolves.toBe(false);
  
  // Open via API
  await page.getByTestId("openBtn").click({ force: true });
  await expect(page.getByText("Item 1")).toBeVisible();
  
  // Close via API
  await page.getByTestId("closeBtn").click({ force: true });
  await expect(page.getByText("Item 1")).not.toBeVisible();
});

test("component works with nested menu structures", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Main Menu">
      <MenuItem>Top Level Item</MenuItem>
      <SubMenuItem label="Category 1">
        <MenuItem>Category 1 Item 1</MenuItem>
        <SubMenuItem label="Subcategory">
          <MenuItem>Deep Item 1</MenuItem>
          <MenuItem>Deep Item 2</MenuItem>
        </SubMenuItem>
      </SubMenuItem>
      <MenuSeparator />
      <SubMenuItem label="Category 2">
        <MenuItem>Category 2 Item 1</MenuItem>
        <MenuItem>Category 2 Item 2</MenuItem>
      </SubMenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();
  
  // Open main menu
  await driver.open();
  await expect(page.getByText("Top Level Item")).toBeVisible();
  await expect(page.getByText("Category 1")).toBeVisible();
  
  // Navigate to submenu using driver method
  await driver.openSubMenu("Category 1");
  await expect(page.getByText("Category 1 Item 1")).toBeVisible();
  await expect(page.getByText("Subcategory")).toBeVisible();
  
  // Navigate to nested submenu
  await driver.openSubMenu("Subcategory");
  await expect(page.getByText("Deep Item 1")).toBeVisible();
  await expect(page.getByText("Deep Item 2")).toBeVisible();
});
