import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SMOKE TESTS
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createTabsDriver }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);
    const driver = await createTabsDriver();
    await expect(driver.component).toBeAttached();
  });

  test("renders tab labels correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="First Tab">Content 1</TabItem>
        <TabItem label="Second Tab">Content 2</TabItem>
        <TabItem label="Third Tab">Content 3</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "First Tab" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Second Tab" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Third Tab" })).toBeVisible();
  });

  test("shows first tab content by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">First content</TabItem>
        <TabItem label="Tab 2">Second content</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByText("Second content")).not.toBeVisible();
  });
});

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("basic functionality", () => {
  test("switches tabs when clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">First content</TabItem>
        <TabItem label="Tab 2">Second content</TabItem>
        <TabItem label="Tab 3">Third content</TabItem>
      </Tabs>
    `);

    // Initially first tab is active
    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByText("Second content")).not.toBeVisible();

    // Click second tab
    await page.getByRole("tab", { name: "Tab 2" }).click();
    await expect(page.getByText("First content")).not.toBeVisible();
    await expect(page.getByText("Second content")).toBeVisible();

    // Click third tab
    await page.getByRole("tab", { name: "Tab 3" }).click();
    await expect(page.getByText("Second content")).not.toBeVisible();
    await expect(page.getByText("Third content")).toBeVisible();
  });

  test("activeTab prop sets initial active tab", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs activeTab="{1}">
        <TabItem label="Tab 1">First content</TabItem>
        <TabItem label="Tab 2">Second content</TabItem>
        <TabItem label="Tab 3">Third content</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("First content")).not.toBeVisible();
    await expect(page.getByText("Second content")).toBeVisible();
    await expect(page.getByText("Third content")).not.toBeVisible();
  });

  test("orientation prop changes tab layout", async ({ initTestBed, createTabsDriver }) => {
    await initTestBed(`
      <Tabs orientation="vertical">
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    const driver = await createTabsDriver();
    await expect(driver.component).toHaveAttribute("data-orientation", "vertical");
  });
});

// =============================================================================
// LABEL TEMPLATE TESTS
// =============================================================================

test.describe("labelTemplate functionality", () => {
  test("renders custom labelTemplate instead of label", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Simple Label">
          <property name="labelTemplate">
            <VStack gap="$space-1">
              <Text>Custom</Text>
              <Text>Label</Text>
            </VStack>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // Custom labelContent should be visible
    await expect(page.getByText("Custom")).toBeVisible();
    await expect(page.getByText("Label")).toBeVisible();

    // Simple label should be visible for second tab
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
  });

  test("labelTemplate takes priority over tabTemplate", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="tabTemplate">
          <Text>Global: {$item.label}</Text>
        </property>
        <TabItem label="Tab 1">
          <property name="labelTemplate">
            <Text>Custom Content</Text>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // First tab should use labelContent
    await expect(page.getByText("Custom Content")).toBeVisible();

    // Second tab should use tabTemplate
    await expect(page.getByText("Global: Tab 2")).toBeVisible();
  });

  test("complex labelTemplate with icons and badges", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">
          <property name="labelTemplate">
            <HStack gap="$space-2" alignItems="center">
              <Text>Custom: {$item.label}</Text>
              <Badge>{$item.isActive ? 'Active' : ''}</Badge>
            </HStack>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("Custom: Tab 1")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
  });
});

// =============================================================================
// TAB RENDERER TESTS
// =============================================================================

test.describe("tabTemplate functionality", () => {
  test("tabRenderer customizes all tab labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="tabTemplate">
          <Text>Custom: {$item.label}</Text>
        </property>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
        <TabItem label="Tab 3">Content 3</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("Custom: Tab 1")).toBeVisible();
    await expect(page.getByText("Custom: Tab 2")).toBeVisible();
    await expect(page.getByText("Custom: Tab 3")).toBeVisible();
  });

  test.fixme("tabRenderer receives isActive state", async ({ initTestBed, page, createTabsDriver }) => {
    await initTestBed(`
      <Tabs>
        <property name="tabTemplate">
          <Text>{$item.isActive ? 'Active: ' : ''}{$item.label}</Text>
        </property>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    const driver = await createTabsDriver();

    // First tab should be active initially
    await expect(page.getByText("Active: Tab 1")).toBeVisible();
    await expect(page.getByText("Tab 2")).toBeVisible();

    // Click second tab
    await driver.clickTab("Tab 2");
    await expect(page.getByText("Tab 1")).toBeVisible();
    await expect(page.getByText("Active: Tab 2")).toBeVisible();
  });

  test.fixme("tabTemplate with complex content", async ({ initTestBed, page, createTabsDriver }) => {
    const driver = await createTabsDriver();

    await initTestBed(`
      <Tabs>
        <property name="tabTemplate">
          <HStack>
            <Text>{$item.label} {$item.isActive ? 'active' : ''}</Text>
          </HStack>
        </property>
        <TabItem label="Home">Home content</TabItem>
        <TabItem label="Settings">Settings content</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("Home active")).toBeVisible();

    await driver.clickTab("Settings");
    await expect(page.getByText("Settings active")).toBeVisible();
  });
});

// =============================================================================
// FILLER ELEMENT TESTS
// =============================================================================

test.describe("filler element", () => {
  test("filler is hidden when distributeEvenly is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs distributeEvenly>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    const filler = page.locator('.filler');
    await expect(filler).not.toBeVisible();
  });

  test("filler is hidden when tabRenderer is used", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs tabRenderer="{(item) => item.label}">
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    const filler = page.locator('.filler');
    await expect(filler).not.toBeVisible();
  });
});

// =============================================================================
// EDGE CASES AND ERROR HANDLING
// =============================================================================

test.describe("edge cases", () => {
  test("handles empty tabs", async ({ initTestBed, createTabsDriver }) => {
    await initTestBed(`<Tabs></Tabs>`);
    const driver = await createTabsDriver();
    await expect(driver.component).toBeAttached();
  });

  test("handles single tab", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Only Tab">Only content</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "Only Tab" })).toBeVisible();
    await expect(page.getByText("Only content")).toBeVisible();
  });

  test("handles tabs with empty content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Empty Tab"></TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "Empty Tab" })).toBeVisible();
    await page.getByRole("tab", { name: "Tab 2" }).click();
    await expect(page.getByText("Content 2")).toBeVisible();
  });

  test("handles very long tab labels", async ({ initTestBed, page }) => {
    const longLabel = "This is a very long tab label that might cause layout issues";
    await initTestBed(`
      <Tabs>
        <TabItem label="${longLabel}">Content 1</TabItem>
        <TabItem label="Short">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: longLabel })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Short" })).toBeVisible();
  });

  test("handles activeTab out of bounds", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs activeTab="{5}">
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // Should default to first tab when activeTab is out of bounds
    await expect(page.getByText("Content 1")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("accessibility", () => {
  test("tabs have correct ARIA roles", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.getByRole("tab", { name: "Tab 1" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  });

  test("active tab has correct aria-selected", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("aria-selected", "false");

    await page.getByRole("tab", { name: "Tab 2" }).click();
    await expect(page.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("aria-selected", "false");
    await expect(page.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("aria-selected", "true");
  });

  test("keyboard navigation works", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
        <TabItem label="Tab 3">Content 3</TabItem>
      </Tabs>
    `);

    // Focus first tab
    await page.getByRole("tab", { name: "Tab 1" }).focus();

    // Arrow right to second tab
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeFocused();

    // Arrow right to third tab
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Tab 3" })).toBeFocused();

    // Arrow left back to second tab
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeFocused();
  });
});

// =============================================================================
// DYNAMIC CONTENT TESTS
// =============================================================================

test.describe("dynamic content", () => {
  test("works with Items component for dynamic tabs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <Items data="{['First', 'Second', 'Third']}">
          <TabItem label="{$item}">Content for {$item}</TabItem>
        </Items>
      </Tabs>
    `);

    await expect(page.getByRole("tab", { name: "First" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Second" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Third" })).toBeVisible();

    await page.getByRole("tab", { name: "Second" }).click();
    await expect(page.getByText("Content for Second")).toBeVisible();
  });
});
