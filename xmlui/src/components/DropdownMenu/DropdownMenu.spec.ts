import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("renders with basic props", async ({ initTestBed, createDropdownMenuDriver }) => {
  await initTestBed(`<DropdownMenu label="Menu" />`);
  const driver = await createDropdownMenuDriver();

  await expect(driver.component).toBeVisible();
});

test("renders with menu items", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  await expect(driver.component).toBeVisible();
  await driver.open();

  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).toBeVisible();
});

test("opens and closes menu correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  await expect(page.getByRole("menuitem")).not.toBeVisible();

  await driver.open();
  await expect(page.getByRole("menuitem")).toBeVisible();

  await driver.close();
  await expect(page.getByRole("menuitem")).not.toBeVisible();
});

test("handles menu item clicks", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem onClick="testState = 'item1-clicked'">Item 1</MenuItem>
      <MenuItem onClick="testState = 'item2-clicked'">Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  await driver.open();
  await driver.clickMenuItem("Item 1");
  await expect.poll(testStateDriver.testState).toEqual("item1-clicked");

  // Menu should close after click
  await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).not.toBeVisible();
});

test("alignment='start' aligns popup menu left", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  await initTestBed(`
    <HStack width="50%">
      <DropdownMenu alignment="start" label="Menu">
        <MenuItem >Item 1</MenuItem>
        <MenuItem >Item 2</MenuItem>
      </DropdownMenu>
    </HStack>
  `);
  const driver = await createDropdownMenuDriver();

  await driver.open();
  const { x: triggerX } = await driver.component.boundingBox();
  const { x: menuX } = await page.getByRole("menu").boundingBox();
  expect(menuX).toBeCloseTo(triggerX);
});

test("alignment='end' aligns popup menu right", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  await initTestBed(`
    <HStack width="50%" reverse="true">
      <DropdownMenu alignment="end" label="Menu">
        <MenuItem >Item 1</MenuItem>
        <MenuItem >Item 2</MenuItem>
      </DropdownMenu>
    </HStack>
  `);
  const driver = await createDropdownMenuDriver();

  await driver.open();
  const { width: triggerWidth, x: triggerX } = await driver.component.boundingBox();
  const { width: menuWidth, x: menuX } = await page.getByRole("menu").boundingBox();
  const menuEndX = menuX + menuWidth;
  const triggerEndX = triggerX + triggerWidth;
  expect(menuEndX).toBeCloseTo(triggerEndX);
});

test("supports submenu functionality", async ({ initTestBed, createDropdownMenuDriver, page }) => {
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
  await expect(page.getByRole("menuitem", { name: "Submenu Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Submenu Item 2" })).toBeVisible();
});

test("supports menu separators", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem>Item 1</MenuItem>
      <MenuSeparator />
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  await driver.open();
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).toBeVisible();

  // Check that separator is rendered using driver method
  const separators = driver.getMenuSeparators();
  await expect(separators).toHaveCount(1);
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("has correct accessibility attributes", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  await initTestBed(`
    <DropdownMenu label="Accessible Menu">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  let btn = page.getByRole("button", { name: "Accessible Menu" });
  await expect(btn).toHaveAttribute("aria-haspopup", "menu");
  await expect(btn).toHaveAttribute("aria-expanded", "false");

  await driver.open();
  await page.getByRole("button", { includeHidden: true, expanded: true }).waitFor();
  await page.getByRole("menu").waitFor();
});

test("is keyboard accessible", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Keyboard Menu">
      <MenuItem onClick="testState = 'keyboard-activated'">Item 1</MenuItem>
    </DropdownMenu>
  `);

  const btn = page.getByRole("button");
  await expect(btn).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(btn).toBeFocused();

  // Open with Enter
  await expect(btn).toBeFocused();
  await page.keyboard.press("Enter");
  const menuItem = page.getByRole("menuitem", { name: "Item 1" });
  await expect(menuItem).toBeVisible();

  // Navigate and select with keyboard
  await expect(menuItem).toBeVisible();
  await page.keyboard.press("ArrowDown");

  // Verify the menu item is now focused
  await expect(menuItem).toBeFocused();

  // Press Enter to select
  await expect(menuItem).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual("keyboard-activated");
});

test("navigates between multiple menu items with arrow keys", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Menu">
      <MenuItem onClick="testState = 'item1-clicked'">Item 1</MenuItem>
      <MenuItem onClick="testState = 'item2-clicked'">Item 2</MenuItem>
      <MenuItem onClick="testState = 'item3-clicked'">Item 3</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  await driver.open();

  const item1 = page.getByRole("menuitem", { name: "Item 1" });
  const item2 = page.getByRole("menuitem", { name: "Item 2" });
  const item3 = page.getByRole("menuitem", { name: "Item 3" });

  // Press ArrowDown to focus first item
  await expect(item1).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(item1).toBeFocused();

  // Press ArrowDown to focus second item
  await expect(item1).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item2).toBeFocused();

  // Press ArrowDown to focus third item
  await expect(item2).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item3).toBeFocused();

  // Press ArrowDown again - should wrap to first item
  await expect(item3).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(item1).toBeFocused();

  // Press ArrowUp to go back to third item
  await expect(item1).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(item3).toBeFocused();

  // Press ArrowUp to go to second item
  await expect(item3).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(item2).toBeFocused();

  // Press Enter to select second item
  await expect(item2).toBeFocused();
  await page.keyboard.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual("item2-clicked");
});

test("disabled DropdownMenu can't be focused", async ({ initTestBed, page }) => {
  await initTestBed(`<DropdownMenu label="Disabled Menu" enabled="false" />`);
  const btn = page.getByRole("button");

  await expect(btn).toBeDisabled();

  // Should not be focusable when disabled
  await btn.focus();
  await expect(btn).not.toBeFocused();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("applies theme variables correctly", async ({ initTestBed, createDropdownMenuDriver }) => {
  await initTestBed(
    `<DropdownMenu label="Themed Menu">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>`,
    {
      testThemeVars: {
        "backgroundColor-DropdownMenu": "rgb(255, 0, 0)",
        "minWidth-DropdownMenu": "200px",
      },
    },
  );
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

test("handles null label gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<DropdownMenu label="{null}" />`);
  await expect(page.getByRole("button")).toBeVisible();
});

test("handles special characters in labels", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
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

test("doesn't show empty menu with no MenuItem", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  await initTestBed(`<DropdownMenu label="Empty Menu" />`);
  const driver = await createDropdownMenuDriver();
  await driver.open();

  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("handles disabled menu items", async ({ initTestBed, createDropdownMenuDriver, page }) => {
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
  await expect.poll(testStateDriver.testState).toEqual("enabled-clicked");

  // Reopen menu
  await driver.open();

  await page.getByText("Disabled Item").click();
  await expect.poll(testStateDriver.testState).not.toEqual("disabled-clicked");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("supports custom trigger template", async ({ initTestBed, page }) => {
  await initTestBed(`
    <DropdownMenu>
      <property name="triggerTemplate">
        <Button variant="solid" themeColor="secondary">Custom Trigger</Button>
      </property>
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </DropdownMenu>
  `);
  const btn = page.getByRole("button", { name: "Custom Trigger" });
  await expect(btn).toBeVisible();

  await btn.click();
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).toBeVisible();
});

test("handles onWillOpen event correctly", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
  const { testStateDriver } = await initTestBed(`
    <DropdownMenu label="Event Menu" onWillOpen="testState = 'willOpen-fired'">
      <MenuItem>Item 1</MenuItem>
    </DropdownMenu>
  `);
  const driver = await createDropdownMenuDriver();

  // Click to trigger onWillOpen event
  await driver.open();

  // Event should have fired
  await expect.poll(testStateDriver.testState).toEqual("willOpen-fired");

  // Menu should be open
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
});

test("prevents opening when onWillOpen returns false", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
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

test("API methods work correctly", async ({ initTestBed, createDropdownMenuDriver, page }) => {
  await initTestBed(`
    <HStack>
      <DropdownMenu id="apiMenu" label="API Menu">
        <MenuItem>Item 1</MenuItem>
        <MenuItem><Button testId="closeBtn" onGotFocus="apiMenu.close()" label="Close Menu" /></MenuItem>
      </DropdownMenu>
      <Button testId="openBtn" onClick="apiMenu.open()">Open Menu</Button>
    </HStack>
  `);
  const menuItem = page.getByRole("menuitem", { name: "Item 1" });
  await expect(menuItem).not.toBeVisible();

  await page.getByTestId("openBtn").click();
  await expect(menuItem).toBeVisible();

  await page.getByTestId("closeBtn").focus();
  await expect(menuItem).not.toBeVisible();
});

test("works with nested menu structures", async ({
  initTestBed,
  createDropdownMenuDriver,
  page,
}) => {
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
  await expect(page.getByText("Category 1 Item 1")).not.toBeVisible();
  await driver.openSubMenu("Category 1");
  await expect(page.getByText("Category 1 Item 1")).toBeVisible();
  await expect(page.getByText("Subcategory")).toBeVisible();

  // Navigate to nested submenu
  await expect(page.getByText("Deep Item 1")).not.toBeVisible();
  await driver.openSubMenu("Subcategory");
  await expect(page.getByText("Deep Item 1")).toBeVisible();
  await expect(page.getByText("Deep Item 2")).toBeVisible();
});
// Z-INDEX AND MODAL LAYERING TESTS
// =============================================================================

test.describe("Z-Index and Modal Layering", () => {
  test("DropdownMenu in modal is visible and clickable", async ({
    initTestBed,
    page,
    createDropdownMenuDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <ModalDialog when="{true}" title="Example Dialog">
        <DropdownMenu testId="dropdown">
          <property name="triggerTemplate">
            <Button
              size="sm"
              icon="plus"
              label="Add a member" />
          </property>
          <MenuItem icon="plus" onClick="testState = 'hello-clicked'">Hello</MenuItem>
          <MenuItem icon="plus" onClick="testState = 'invite-clicked'">Invite people</MenuItem>
        </DropdownMenu>
      </ModalDialog>
    `);

    const driver = await createDropdownMenuDriver("dropdown");

    // Dialog should be visible
    await expect(page.getByRole("dialog", { name: "Example Dialog" })).toBeVisible();

    // Open dropdown menu via custom trigger button
    await driver.open();

    // Menu items should be visible and not covered by the modal overlay
    const helloItem = page.getByRole("menuitem", { name: "Hello" });
    const inviteItem = page.getByRole("menuitem", { name: "Invite people" });

    await expect(helloItem).toBeVisible();
    await expect(inviteItem).toBeVisible();

    // Click both items to ensure they are fully interactive
    await helloItem.click();
    await expect.poll(testStateDriver.testState).toEqual("hello-clicked");

    // Re-open dropdown after it closes on item click
    await driver.open();
    await inviteItem.click();
    await expect.poll(testStateDriver.testState).toEqual("invite-clicked");
  });
});

test.describe("Nested DropdownMenu and Select", () => {
  test("ModalDialog > DropdownMenu > Select", async ({
    initTestBed,
    page,
    createDropdownMenuDriver,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="outerDialog.open()">Open Dialog</Button>
        <ModalDialog id="outerDialog" title="Outer Dialog">
          <DropdownMenu testId="nested-dropdown" modal="{true}">
            <property name="triggerTemplate">
              <Button label="Open actions" />
            </property>
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
            <Select modal="{true}" id="testSelect" testId="testSelect">
              <Option value="opt1" label="Option 1" />
              <Option value="opt2" label="Option 2" />
              <Button
                label="Confirm action"
                onClick="{
                  const result = confirm('Confirm action', 'Are you sure?', 'Yes');
                  testState = result ? 'confirmed' : 'canceled';
                }"
              />
            </Select>
          </DropdownMenu>
        </ModalDialog>
      </Fragment>
    `);

    const dropdownDriver = await createDropdownMenuDriver("nested-dropdown");

    await page.getByTestId("openBtn").click();

    const outerDialog = page.getByRole("dialog", { name: "Outer Dialog" });
    await expect(outerDialog).toBeVisible();

    await expect(dropdownDriver.component).toBeVisible();

    await dropdownDriver.open();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();

    const selectDriver = await createSelectDriver("testSelect");
    await expect(selectDriver.component).toBeVisible();

    await selectDriver.toggleOptionsVisibility();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();

    await page.getByText("Confirm action").nth(1).click();
    const confirmDialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(confirmDialog).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 }); // Click outside all dialogs
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Option 1")).not.toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Item 1")).not.toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Outer Dialog")).not.toBeVisible();
  });

  test("ModalDialog > Select > DropdownMenu", async ({
    initTestBed,
    page,
    createDropdownMenuDriver,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="outerDialog.open()">Open Dialog</Button>
        <ModalDialog id="outerDialog" title="Outer Dialog">
          <Select modal="{true}" id="testSelect" testId="testSelect">
            <Option value="opt1" label="Option 1" />
            <Option value="opt2" label="Option 2" />
            <DropdownMenu testId="nested-dropdown" modal="{true}">
              <property name="triggerTemplate">
                <Button label="Open actions" />
              </property>
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
              <Button
                label="Confirm action"
                onClick="{
                  const result = confirm('Confirm action', 'Are you sure?', 'Yes');
                  testState = result ? 'confirmed' : 'canceled';
                }"
              />
            </DropdownMenu>
          </Select>
        </ModalDialog>
      </Fragment>
    `);

    const selectDriver = await createSelectDriver("testSelect");

    await page.getByTestId("openBtn").click();

    const outerDialog = page.getByRole("dialog", { name: "Outer Dialog" });
    await expect(outerDialog).toBeVisible();

    await expect(selectDriver.component).toBeVisible();

    await selectDriver.toggleOptionsVisibility();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();

    const dropdownDriver = await createDropdownMenuDriver("nested-dropdown");

    await dropdownDriver.open();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();

    await page.getByText("Confirm action").click();
    const confirmDialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(confirmDialog).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 }); // Click outside all dialogs
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Item 1")).not.toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Option 1")).not.toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Outer Dialog")).not.toBeVisible();
  });
});

// =============================================================================
// SUBMENUITEM ICON TESTS
// =============================================================================

test.describe("SubMenuItem Icon Support", () => {
  test("renders SubMenuItem with icon", async ({ initTestBed, createDropdownMenuDriver, page }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Share" icon="home">
          <MenuItem>Share via link</MenuItem>
          <MenuItem>Share via email</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // Check that the submenu item is visible with its label
    await expect(page.getByText("Share")).toBeVisible();
    
    // Check that an icon is rendered (at least one SVG should exist in the submenu trigger)
    const submenuTrigger = page.getByText("Share").locator("..");
    const icons = submenuTrigger.locator("svg");
    // Should have at least 2 SVGs: the icon and the chevron
    await expect(icons).toHaveCount(2);
  });

  test("renders SubMenuItem with icon at start position (default)", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Actions" icon="home" iconPosition="start">
          <MenuItem>Action 1</MenuItem>
          <MenuItem>Action 2</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    await expect(page.getByText("Actions")).toBeVisible();
    const submenuTrigger = page.getByText("Actions").locator("..");
    const icons = submenuTrigger.locator("svg");
    
    // Should have 2 SVGs: the icon and the chevron
    await expect(icons).toHaveCount(2);
    
    // Verify icon is positioned at the start (first SVG before the label)
    const firstIcon = icons.first();
    const iconBox = await firstIcon.boundingBox();
    const labelBox = await page.getByText("Actions").boundingBox();
    
    expect(iconBox.x).toBeLessThan(labelBox.x);
  });

  test("renders SubMenuItem with icon at end position", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Export" icon="home" iconPosition="end">
          <MenuItem>Export as PDF</MenuItem>
          <MenuItem>Export as CSV</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    await expect(page.getByText("Export")).toBeVisible();
    const submenuTrigger = page.getByText("Export").locator("..");
    const icons = submenuTrigger.locator("svg");
    
    // Should have 2 SVGs: the icon and the chevron
    await expect(icons).toHaveCount(2);
    
    // Verify icon is positioned at the end (first SVG after the label, before chevron)
    const firstIcon = icons.first();
    const iconBox = await firstIcon.boundingBox();
    const labelBox = await page.getByText("Export").boundingBox();
    
    expect(iconBox.x).toBeGreaterThan(labelBox.x + labelBox.width);
  });

  test("renders SubMenuItem without icon", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="No Icon">
          <MenuItem>Item 1</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    await expect(page.getByText("No Icon")).toBeVisible();
    
    // Check that only the chevron is rendered (only one SVG)
    const submenuTrigger = page.getByText("No Icon").locator("..");
    const icons = submenuTrigger.locator("svg");
    await expect(icons).toHaveCount(1); // Only the chevron
  });

  test("renders multiple SubMenuItems with different icons", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="File" icon="folder">
          <MenuItem>Open</MenuItem>
          <MenuItem>Save</MenuItem>
        </SubMenuItem>
        <SubMenuItem label="Edit" icon="folder">
          <MenuItem>Cut</MenuItem>
          <MenuItem>Copy</MenuItem>
        </SubMenuItem>
        <SubMenuItem label="Settings" icon="folder">
          <MenuItem>Preferences</MenuItem>
          <MenuItem>Options</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // Verify all submenu items are visible
    await expect(page.getByText("File")).toBeVisible();
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Settings")).toBeVisible();
    
    // Each should have 2 SVGs (icon + chevron)
    const fileTrigger = page.getByText("File").locator("..");
    await expect(fileTrigger.locator("svg")).toHaveCount(2);
    
    const editTrigger = page.getByText("Edit").locator("..");
    await expect(editTrigger.locator("svg")).toHaveCount(2);
    
    const settingsTrigger = page.getByText("Settings").locator("..");
    await expect(settingsTrigger.locator("svg")).toHaveCount(2);
  });

  test("SubMenuItem icon works with nested submenus", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Parent" icon="folder">
          <MenuItem>Item 1</MenuItem>
          <SubMenuItem label="Nested" icon="folder">
            <MenuItem>Nested Item 1</MenuItem>
            <MenuItem>Nested Item 2</MenuItem>
          </SubMenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // Verify parent submenu has icon
    await expect(page.getByText("Parent")).toBeVisible();
    const parentTrigger = page.getByText("Parent").locator("..");
    await expect(parentTrigger.locator("svg")).toHaveCount(2); // icon + chevron
    
    // Open parent submenu
    await driver.openSubMenu("Parent");
    await expect(page.getByText("Nested")).toBeVisible();
    
    // Verify nested submenu has icon
    const nestedTrigger = page.getByText("Nested").locator("..");
    await expect(nestedTrigger.locator("svg")).toHaveCount(2); // icon + chevron
  });

  test("SubMenuItem with icon remains functional on hover and click", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Actions" icon="home">
          <MenuItem onClick="testState = 'action1'">Action 1</MenuItem>
          <MenuItem onClick="testState = 'action2'">Action 2</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // Open submenu with icon
    await driver.openSubMenu("Actions");
    
    // Verify submenu items are accessible
    await expect(page.getByRole("menuitem", { name: "Action 1" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Action 2" })).toBeVisible();
    
    // Click on submenu item and verify functionality
    await page.getByRole("menuitem", { name: "Action 1" }).click();
    await expect.poll(testStateDriver.testState).toEqual("action1");
  });

  test("SubMenuItem icon with custom triggerTemplate overrides default icon", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <SubMenuItem label="Custom" icon="home">
          <property name="triggerTemplate">
            <Button label="Custom Trigger" icon="star" />
          </property>
          <MenuItem>Item 1</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // The custom trigger should be visible
    await expect(page.getByText("Custom Trigger")).toBeVisible();
    
    // The custom trigger's icon should be visible (has an SVG)
    const customTrigger = page.getByText("Custom Trigger").locator("..");
    await expect(customTrigger.locator("svg").first()).toBeVisible();
    
    // The default label should NOT be visible
    await expect(page.getByText("Custom").and(page.getByText("Custom Trigger").locator("..").locator(".."))).not.toBeVisible();
  });

  test("SubMenuItem with icon and MenuItem with icon can coexist", async ({
    initTestBed,
    createDropdownMenuDriver,
    page,
  }) => {
    await initTestBed(`
      <DropdownMenu label="Menu">
        <MenuItem icon="home">Home</MenuItem>
        <SubMenuItem label="Share" icon="home">
          <MenuItem icon="home">Download</MenuItem>
          <MenuItem icon="email">Email</MenuItem>
        </SubMenuItem>
      </DropdownMenu>
    `);
    const driver = await createDropdownMenuDriver();

    await driver.open();
    
    // Verify MenuItem icon (has an SVG)
    const homeItem = page.getByRole("menuitem", { name: "Home" });
    await expect(homeItem).toBeVisible();
    await expect(homeItem.locator("svg")).toBeVisible();
    
    // Verify SubMenuItem icon (has 2 SVGs: icon + chevron)
    const shareTrigger = page.getByText("Share").locator("..");
    await expect(shareTrigger.locator("svg")).toHaveCount(2);
    
    // Open submenu
    await driver.openSubMenu("Share");
    
    // Verify nested MenuItem icons (each has an SVG)
    const downloadItem = page.getByRole("menuitem", { name: "Download" });
    await expect(downloadItem).toBeVisible();
    await expect(downloadItem.locator("svg")).toBeVisible();
    
    const emailItem = page.getByRole("menuitem", { name: "Email" });
    await expect(emailItem).toBeVisible();
    await expect(emailItem.locator("svg")).toBeVisible();
  });
});
