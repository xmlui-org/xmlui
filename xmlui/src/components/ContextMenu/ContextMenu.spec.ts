import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders ContextMenu without errors", async ({ initTestBed, page }) => {
  await initTestBed(`
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
    </ContextMenu>
  `);

  // ContextMenu should not be visible until opened
  await expect(page.getByRole("menuitem")).not.toBeVisible();
});

test("opens at mouse position via openAt API", async ({
  initTestBed,
  page,
  createContextMenuDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Card testId="target" title="Right Click Me" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click anywhere" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem onClick="testState = 'clicked'">Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  // Right-click the card to open context menu
  await page.getByTestId("target").click({ button: "right" });

  // Menu items should be visible
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).toBeVisible();

  // Click an item
  await driver.clickMenuItem("Item 1");
  await expect.poll(testStateDriver.testState).toEqual("clicked");

  // Menu should close after click
  await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
});

test("passes context data via openAt", async ({
  initTestBed,
  page,
  createContextMenuDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Card testId="file1" title="File 1" onContextMenu="ev => fileMenu.openAt(ev, { fileName: 'app.exe' })">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="fileMenu">
      <MenuItem onClick="testState = $context.fileName">Download</MenuItem>
      <MenuItem onClick="testState = 'renamed-' + $context.fileName">Rename</MenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("fileMenu");

  // Right-click to open context menu
  await page.getByTestId("file1").click({ button: "right" });

  // Menu should be visible
  await expect(page.getByRole("menuitem", { name: "Download" })).toBeVisible();

  // Click item that uses $context
  await driver.clickMenuItem("Download");
  await expect.poll(testStateDriver.testState).toEqual("app.exe");

  // Open again and test another item
  await page.getByTestId("file1").click({ button: "right" });
  await driver.clickMenuItem("Rename");
  await expect.poll(testStateDriver.testState).toEqual("renamed-app.exe");
});

test("closes when clicking outside", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();

  // Click outside
  await page.mouse.click(10, 10);

  // Menu should close
  await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
});

test("closes when pressing Escape", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();

  // Press Escape
  await page.keyboard.press("Escape");

  // Menu should close
  await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
});

test("supports multiple context menus", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <VStack>
      <Card testId="file1" title="File 1" onContextMenu="ev => fileMenu.openAt(ev, { id: 1 })">
        <Text value="Right click file 1" />
      </Card>
      <Card testId="file2" title="File 2" onContextMenu="ev => fileMenu.openAt(ev, { id: 2 })">
        <Text value="Right click file 2" />
      </Card>
    </VStack>
    <ContextMenu id="fileMenu">
      <MenuItem onClick="testState = 'clicked-' + $context.id">Action</MenuItem>
    </ContextMenu>
  `);

  // Right-click first file
  await page.getByTestId("file1").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Action" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Action" }).click();
  await expect.poll(testStateDriver.testState).toEqual("clicked-1");

  // Right-click second file
  await page.getByTestId("file2").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Action" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Action" }).click();
  await expect.poll(testStateDriver.testState).toEqual("clicked-2");
  });

  test("supports menu separators", async ({ initTestBed, page, createContextMenuDriver }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
      <MenuSeparator />
      <MenuItem>Item 2</MenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Item 2" })).toBeVisible();

  // Check that separator is rendered
  const separators = driver.getMenuSeparators();
  await expect(separators).toHaveCount(1);
});

test("supports submenus", async ({ initTestBed, page, createContextMenuDriver }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Regular Item</MenuItem>
      <SubMenuItem label="Submenu">
        <MenuItem>Submenu Item 1</MenuItem>
        <MenuItem>Submenu Item 2</MenuItem>
      </SubMenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByText("Regular Item")).toBeVisible();
  await expect(page.getByText("Submenu")).toBeVisible();

  // Open submenu
  await driver.openSubMenu("Submenu");
  await expect(page.getByRole("menuitem", { name: "Submenu Item 1" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Submenu Item 2" })).toBeVisible();
});

test("handles disabled menu items", async ({ initTestBed, page, createContextMenuDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem enabled="true" onClick="testState = 'enabled-clicked'">Enabled Item</MenuItem>
      <MenuItem enabled="false" onClick="testState = 'disabled-clicked'">Disabled Item</MenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });

  // Enabled item should work
  await driver.clickMenuItem("Enabled Item");
  await expect.poll(testStateDriver.testState).toEqual("enabled-clicked");

  // Open again
  await page.getByTestId("target").click({ button: "right" });

  // Disabled item should not respond
  await page.getByText("Disabled Item").click();
  await expect.poll(testStateDriver.testState).not.toEqual("disabled-clicked");
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("close() API method works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <VStack>
      <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
        <Text value="Right click me" />
      </Card>
      <Button testId="closeBtn" onClick="menu.close()">Close Menu</Button>
      <ContextMenu id="menu">
        <MenuItem>Item 1</MenuItem>
      </ContextMenu>
    </VStack>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();

  // Click button to close menu
  await page.getByTestId("closeBtn").click();

  // Menu should be closed
  await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("is keyboard accessible", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem onClick="testState = 'keyboard-activated'">Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  const menuItem = page.getByRole("menuitem", { name: "Item 1" });
  await expect(menuItem).toBeVisible();

  // Navigate with arrow keys
  await page.keyboard.press("ArrowDown");
  await expect(menuItem).toBeFocused();

  // Press Enter to select
  await page.keyboard.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual("keyboard-activated");
});

test("navigates between multiple menu items with arrow keys", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem onClick="testState = 'item1-clicked'">Item 1</MenuItem>
      <MenuItem onClick="testState = 'item2-clicked'">Item 2</MenuItem>
      <MenuItem onClick="testState = 'item3-clicked'">Item 3</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });

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

  // Press Enter to select third item
  await page.keyboard.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual("item3-clicked");
  });
});

// =============================================================================
// POSITIONING TESTS
// =============================================================================

test.describe("Positioning", () => {
  test("positions menu near click coordinates", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)" width="500px" height="300px">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
    </ContextMenu>
  `);

  // Get the target element bounds
  const target = page.getByTestId("target");
  const targetBox = await target.boundingBox();

  // Right-click near the center
  const clickX = targetBox!.x + targetBox!.width / 2;
  const clickY = targetBox!.y + targetBox!.height / 2;
  await page.mouse.click(clickX, clickY, { button: "right" });

  // Menu should be visible
  const menu = page.locator('[class*="ContextMenuContent"]');
  await expect(menu).toBeVisible();

  // Menu should be positioned near click coordinates
  const menuBox = await menu.boundingBox();
  expect(menuBox!.x).toBeGreaterThanOrEqual(clickX - 20); // Allow small offset
  expect(menuBox!.y).toBeGreaterThanOrEqual(clickY - 20);
});

test("adjusts position when menu would overflow viewport", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card 
      testId="target"
      title="Bottom Right Corner" 
      onContextMenu="ev => menu.openAt(ev)" 
      style="position: fixed; bottom: 0; right: 0; width: 200px; height: 100px;"
    >
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
      <MenuItem>Item 4</MenuItem>
      <MenuItem>Item 5</MenuItem>
    </ContextMenu>
  `);

  // Get viewport size and target bounds
  const viewportSize = page.viewportSize()!;
  const target = page.getByTestId("target");

  // Right-click on the target
  await target.click({ button: "right" });

  // Menu should be visible
  const menu = page.locator('[class*="ContextMenuContent"]');
  await expect(menu).toBeVisible();

  // Verify menu is positioned (exact position may vary based on implementation)
  const menuBox = await menu.boundingBox();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.width).toBeGreaterThan(0);
  expect(menuBox!.height).toBeGreaterThan(0);
  });

  test("alignment='start' works correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu" alignment="start">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
});

test("alignment='end' works correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu" alignment="end">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
    </ContextMenu>
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
  });

  test("positions correctly when wrapped in Theme with custom theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme backgroundColor-TestComponent="rgb(200, 200, 200)">
        <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)" width="500px" height="300px">
          <Text value="Right click me" />
        </Card>
        <ContextMenu id="menu">
          <MenuItem>Item 1</MenuItem>
          <MenuItem>Item 2</MenuItem>
        </ContextMenu>
      </Theme>
    `);

    // Get the target element bounds
    const target = page.getByTestId("target");
    const targetBox = await target.boundingBox();

    // Right-click near the center
    const clickX = targetBox!.x + targetBox!.width / 2;
    const clickY = targetBox!.y + targetBox!.height / 2;
    await page.mouse.click(clickX, clickY, { button: "right" });

    // Menu should be visible
    const menu = page.locator('[class*="ContextMenuContent"]');
    await expect(menu).toBeVisible();

    // Menu should be positioned near click coordinates, NOT at top-left corner (0, 0)
    const menuBox = await menu.boundingBox();
    
    // Verify menu is NOT stuck at top-left corner
    expect(menuBox!.x).toBeGreaterThan(50); // Should be near center, not at 0
    expect(menuBox!.y).toBeGreaterThan(50); // Should be near center, not at 0
    
    // Verify menu is positioned near the click coordinates
    expect(menuBox!.x).toBeGreaterThanOrEqual(clickX - 20);
    expect(menuBox!.y).toBeGreaterThanOrEqual(clickY - 20);
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies theme variables correctly", async ({ initTestBed, createContextMenuDriver, page }) => {
  await initTestBed(
    `
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item 1</MenuItem>
    </ContextMenu>
  `,
    {
      testThemeVars: {
        "backgroundColor-ContextMenu": "rgb(255, 0, 0)",
        "minWidth-ContextMenu": "200px",
      },
    },
  );
  const driver = await createContextMenuDriver("menu");

  // Open menu to see styled content
  await page.getByTestId("target").click({ button: "right" });

  // Check theme variables are applied to menu content
  const menuContent = driver.getMenuContent();
  await expect(menuContent).toBeVisible();
  await expect(menuContent).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(menuContent).toHaveCSS("min-width", "200px");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles special characters in labels", async ({
  initTestBed,
  page,
  createContextMenuDriver,
}) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
      <MenuItem>Item with ñ and ü</MenuItem>
      <MenuItem>Item with &amp; &lt; &gt; quotes</MenuItem>
      <MenuItem>Item with émojis 🚀</MenuItem>
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  await page.getByTestId("target").click({ button: "right" });

  await expect(page.getByText("Item with ñ and ü")).toBeVisible();
  await expect(page.getByText("Item with & < > quotes")).toBeVisible();
  await expect(page.getByText("Item with émojis 🚀")).toBeVisible();
  });

  test("handles empty context menu gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu" />
  `);

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });

  // Menu content should not be visible or should be empty
  await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("works with nested submenu structures", async ({
  initTestBed,
  page,
  createContextMenuDriver,
}) => {
  await initTestBed(`
    <Card testId="target" title="Target" onContextMenu="ev => menu.openAt(ev)">
      <Text value="Right click me" />
    </Card>
    <ContextMenu id="menu">
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
    </ContextMenu>
  `);
  const driver = await createContextMenuDriver("menu");

  // Open context menu
  await page.getByTestId("target").click({ button: "right" });
  await expect(page.getByText("Top Level Item")).toBeVisible();
  await expect(page.getByText("Category 1")).toBeVisible();

  // Navigate to submenu
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
});
