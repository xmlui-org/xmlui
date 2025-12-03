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
  await page.keyboard.press("Tab");
  await expect(btn).toBeFocused();

  // Open with Enter
  await page.keyboard.press("Enter");
  const menuItem = page.getByRole("menuitem", { name: "Item 1" });
  await expect(menuItem).toBeVisible();

  // Navigate and select with keyboard
  await page.keyboard.press("ArrowDown");

  // Verify the menu item is now focused
  await expect(menuItem).toBeFocused();

  // Press Enter to select
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
  await page.keyboard.press("ArrowDown");
  await expect(item1).toBeFocused();

  // Press ArrowDown to focus second item
  await page.keyboard.press("ArrowDown");
  await expect(item2).toBeFocused();

  // Press ArrowDown to focus third item
  await page.keyboard.press("ArrowDown");
  await expect(item3).toBeFocused();

  // Press ArrowDown again - should wrap to first item
  await page.keyboard.press("ArrowDown");
  await expect(item1).toBeFocused();

  // Press ArrowUp to go back to third item
  await page.keyboard.press("ArrowUp");
  await expect(item3).toBeFocused();

  // Press ArrowUp to go to second item
  await page.keyboard.press("ArrowUp");
  await expect(item2).toBeFocused();

  // Press Enter to select second item
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
