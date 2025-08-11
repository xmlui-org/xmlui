import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SMOKE TESTS
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);
    // Check that tabs component is rendered
    await expect(page.getByRole('tablist')).toBeAttached();
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

    // Wait for tabs to be fully rendered
    await expect(page.getByRole('tablist')).toBeAttached();
    await expect(page.getByRole("tab", { name: "Tab 1" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Tab 3" })).toBeVisible();

    // Initially first tab is active
    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByText("Second content")).not.toBeVisible();
    await expect(page.getByText("Third content")).not.toBeVisible();
    await expect(page.getByRole("tab", { name: "Tab 1" })).toHaveAttribute("aria-selected", "true");

    // Click second tab and wait for transition
    await page.getByRole("tab", { name: "Tab 2" }).click();
    await expect(page.getByRole("tab", { name: "Tab 2" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("First content")).not.toBeVisible();
    await expect(page.getByText("Second content")).toBeVisible();
    await expect(page.getByText("Third content")).not.toBeVisible();

    // Click third tab and wait for transition
    await page.getByRole("tab", { name: "Tab 3" }).click();
    await expect(page.getByRole("tab", { name: "Tab 3" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("First content")).not.toBeVisible();
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

  test("orientation prop changes tab layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs orientation="vertical" testId="vertical-tabs">
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // Check that tabs component has vertical orientation
    const tabsRoot = page.getByTestId("vertical-tabs");
    await expect(tabsRoot).toHaveAttribute("data-orientation", "vertical");
  });
});

// =============================================================================
// HEADER TEMPLATE TESTS
// =============================================================================

test.describe("headerTemplate functionality", () => {
  test("renders custom headerTemplate instead of label", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Simple Label">
          <property name="headerTemplate">
            <VStack gap="$space-1">
              <Text>Custom</Text>
              <Text>Header</Text>
            </VStack>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // Custom header content should be visible
    await expect(page.getByText("Custom")).toBeVisible();
    await expect(page.getByText("Header")).toBeVisible();

    // Simple label should be visible for second tab
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
  });

  test("headerTemplate takes priority over global headerTemplate", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="headerTemplate">
          <Text>Global: {$header.label}</Text>
        </property>
        <TabItem label="Tab 1">
          <property name="headerTemplate">
            <Text>Custom Content</Text>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // First tab should use individual headerTemplate
    await expect(page.getByText("Custom Content")).toBeVisible();

    // Second tab should use global headerTemplate
    await expect(page.getByText("Global: Tab 2")).toBeVisible();
  });

  test("complex headerTemplate with icons and badges", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">
          <property name="headerTemplate">
            <HStack gap="$space-2" alignItems="center">
              <Text>Custom: {$header.label}</Text>
              <Badge>{$header.isActive ? 'Active' : ''}</Badge>
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

  test("headerTemplate receives correct context props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="First Tab">
          <property name="headerTemplate">
            <VStack gap="$space-1">
              <Text>Index: {$header.index}</Text>
              <Text>Label: {$header.label}</Text>
              <Text>Active: {$header.isActive ? 'Yes' : 'No'}</Text>
            </VStack>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Second Tab">Content 2</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("Index: 0")).toBeVisible();
    await expect(page.getByText("Label: First Tab")).toBeVisible();
    await expect(page.getByText("Active: Yes")).toBeVisible();
  });

  test("headerTemplate receives external id when provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <TabItem label="First Tab" id="custom-tab-1">
          <property name="headerTemplate">
            <VStack gap="$space-1">
              <Text>ID: {$header.id}</Text>
              <Text>Label: {$header.label}</Text>
              <Text>Has ID: {$header.id ? 'Yes' : 'No'}</Text>
            </VStack>
          </property>
          Content 1
        </TabItem>
        <TabItem label="Second Tab">
          <property name="headerTemplate">
            <VStack gap="$space-1">
              <Text>Label: {$header.label}</Text>
              <Text>Has ID: {$header.id ? 'Yes' : 'No'}</Text>
            </VStack>
          </property>
          Content 2
        </TabItem>
      </Tabs>
    `);

    // First tab should show the external id
    await expect(page.getByText("ID: custom-tab-1")).toBeVisible();
    await expect(page.getByText("Label: First Tab")).toBeVisible();
    await expect(page.getByText("Has ID: Yes")).toBeVisible();

    // Click second tab
    await page.getByRole("tab", { name: "Second Tab" }).click();

    // Second tab should not have id in context
    await expect(page.getByText("Label: Second Tab")).toBeVisible();
    await expect(page.getByText("Has ID: No")).toBeVisible();
  });
});

// =============================================================================
// GLOBAL HEADER TEMPLATE TESTS
// =============================================================================

test.describe("global headerTemplate functionality", () => {
  test("global headerTemplate customizes all tab headers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="headerTemplate">
          <Text>Custom: {$header.label}</Text>
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

  test("global headerTemplate receives isActive state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="headerTemplate">
          <Text>{$header.isActive ? 'Active: ' : ''}{$header.label}</Text>
        </property>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
      </Tabs>
    `);

    // First tab should be active initially
    await expect(page.getByText("Active: Tab 1")).toBeVisible();
    await expect(page.getByText("Tab 2")).toBeVisible();

    // Click second tab
    await page.getByText("Tab 2").click();
    await expect(page.getByText("Tab 1")).toBeVisible();
    await expect(page.getByText("Active: Tab 2")).toBeVisible();
  });

  test("global headerTemplate with complex content", async ({ initTestBed, page }) => {

    await initTestBed(`
      <Tabs>
        <property name="headerTemplate">
          <HStack>
            <Text>{$header.label} {$header.isActive ? 'active' : ''}</Text>
          </HStack>
        </property>
        <TabItem label="Home">Home content</TabItem>
        <TabItem label="Settings">Settings content</TabItem>
      </Tabs>
    `);

    await expect(page.getByText("Home active")).toBeVisible();

    await page.getByText("Settings").click();
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

  test("filler is hidden when headerRenderer is used", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs headerRenderer="{(item) => item.label}">
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
  test("handles empty tabs", async ({ initTestBed, page }) => {
    await initTestBed(`<Tabs></Tabs>`);
    // Check that empty tabs component is rendered
    await expect(page.getByRole('tablist')).toBeAttached();
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
  // =============================================================================

  test.describe("API functionality verification", () => {
    test("next() method cycles through all tabs correctly", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Fragment>
        <Tabs id="tabs">
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
        <Button onClick="tabs.next()" testId="next-btn">
          Next Tab
        </Button>
      </Fragment>
    `);

      // Initially Account tab should be active (first tab)
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

      // Call next() - should move to Stream tab
      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");

      // Call next() again - should move to Support tab
      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");

      // Call next() from last tab - should cycle back to Account tab
      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    });

    test("prev() method cycles through all tabs correctly in reverse", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Fragment>
        <Tabs id="tabs">
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
        <Button onClick="tabs.prev()" testId="prev-btn">
          Previous Tab
        </Button>
      </Fragment>
    `);

      // Initially Account tab should be active (first tab)
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

      // Call prev() from first tab - should cycle to Support tab (last tab)
      await page.getByTestId("prev-btn").click();
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");

      // Call prev() again - should move to Stream tab
      await page.getByTestId("prev-btn").click();
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");

      // Call prev() again - should move to Account tab
      await page.getByTestId("prev-btn").click();
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    });

    test("next() and prev() methods work together for full navigation", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Fragment>
        <Tabs id="tabs">
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
        <Button onClick="tabs.next()" testId="next-btn">
          Next Tab
        </Button>
        <Button onClick="tabs.prev()" testId="prev-btn">
          Previous Tab
        </Button>
      </Fragment>
    `);

      // Start at Account tab
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

      // Go forward twice: Account -> Stream -> Support
      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");

      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");

      // Go back once: Support -> Stream
      await page.getByTestId("prev-btn").click();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");

      // Go forward to cycle: Stream -> Support -> Account
      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");

      await page.getByTestId("next-btn").click();
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
    });

    test("tabs can be navigated programmatically (simulating next() behavior)", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
        <TabItem label="Tab 3">Content 3</TabItem>
      </Tabs>
    `);

      // Initially first tab is active
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();

      // Simulate next() - move to second tab
      await page.getByRole("tab", { name: "Tab 2" }).click();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();

      // Simulate next() - move to third tab
      await page.getByRole("tab", { name: "Tab 3" }).click();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).toBeVisible();

      // Simulate next() - should cycle back to first tab
      await page.getByRole("tab", { name: "Tab 1" }).click();
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();
    });

    test("tabs can be navigated backwards programmatically (simulating prev() behavior)", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Tabs>
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
        <TabItem label="Tab 3">Content 3</TabItem>
      </Tabs>
    `);

      // Initially first tab is active
      await expect(page.getByText("Content 1")).toBeVisible();

      // Simulate prev() from first tab - should cycle to last tab
      await page.getByRole("tab", { name: "Tab 3" }).click();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).toBeVisible();

      // Simulate prev() - move to second tab
      await page.getByRole("tab", { name: "Tab 2" }).click();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();

      // Simulate prev() - move to first tab
      await page.getByRole("tab", { name: "Tab 1" }).click();
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();
    });

    test("activeTab prop sets initial tab correctly (simulating setActiveTabIndex())", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Tabs activeTab="{2}">
        <TabItem label="Tab 1">Content 1</TabItem>
        <TabItem label="Tab 2">Content 2</TabItem>
        <TabItem label="Tab 3">Content 3</TabItem>
      </Tabs>
    `);

      // Third tab should be active initially (index 2)
      await expect(page.getByText("Content 3")).toBeVisible();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
    });

    test("ArrowRight key cycles through all tabs correctly (keyboard navigation)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs>
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
      `);

      // Initially Account tab should be active and focused
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

      // Focus the first tab
      await page.getByRole("tab", { name: "Account" }).focus();
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();

      // Press ArrowRight - should move to Stream tab
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Press ArrowRight again - should move to Support tab
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Press ArrowRight from last tab - should cycle back to Account tab
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
    });

    test("ArrowLeft key cycles through all tabs correctly in reverse (keyboard navigation)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs>
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
      `);

      // Initially Account tab should be active
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");

      // Focus the first tab
      await page.getByRole("tab", { name: "Account" }).focus();
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();

      // Press ArrowLeft from first tab - should cycle to Support tab (last tab)
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Press ArrowLeft again - should move to Stream tab
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Press ArrowLeft again - should move to Account tab
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
    });

    test("ArrowRight and ArrowLeft keys work together for full keyboard navigation", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs>
          <TabItem label="Account">
            <Text>Account Content</Text>
          </TabItem>
          <TabItem label="Stream">
            <Text>Stream Content</Text>
          </TabItem>
          <TabItem label="Support">
            <Text>Support Content</Text>
          </TabItem>
        </Tabs>
      `);

      // Start at Account tab and focus it
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
      await page.getByRole("tab", { name: "Account" }).focus();

      // Go forward twice: Account -> Stream -> Support
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Go back once: Support -> Stream
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Go forward to cycle: Stream -> Support -> Account
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Account" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
    });

    test("API methods work with headerTemplate (visual verification)", async ({ initTestBed, page }) => {
      await initTestBed(`
      <Fragment>
        <Tabs id="tabs">
          <property name="headerTemplate">
            <Text>{$header.isActive ? 'Active: ' : ''}{$header.label}</Text>
          </property>
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
        <Button onClick="tabs.prev()">Prev</Button>
        <Button onClick="tabs.next()">Next</Button>
      </Fragment>
    `);

      // Initially first tab is active
      await expect(page.getByText("Active: Tab 1")).toBeVisible();
      await expect(page.getByText("Tab 2")).toBeVisible();
      await expect(page.getByText("Tab 3")).toBeVisible();

      // Simulate next() behavior by clicking second tab
      await page.getByRole("button", { name: "Next" }).click();
      await expect(page.getByText("Active: Tab 2")).toBeVisible();
      await expect(page.getByText("Tab 1")).toBeVisible();
      await expect(page.getByText("Tab 3")).toBeVisible();

      // Simulate prev() behavior by clicking first tab
      await page.getByRole("button", { name: "Prev" }).click();
      await expect(page.getByText("Active: Tab 1")).toBeVisible();
      await expect(page.getByText("Tab 2")).toBeVisible();
      await expect(page.getByText("Tab 3")).toBeVisible();
    });
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

  test("headerTemplate works with dynamic content from Items", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tabs>
        <property name="headerTemplate">
          <Text color="red">Account {$header.label}</Text>
        </property>
        <Items data="{[1, 2, 3, 4, 5]}">
          <TabItem label="Account {$item}">
            <property name="headerTemplate">
              <Text when="true" color="blue">{$header.label} | {$item}</Text>
            </property>
            Content for account {$item}
          </TabItem>
        </Items>
      </Tabs>
    `);

    // Check that individual headerTemplate takes priority and has access to both $header and $item
    await expect(page.getByText("Account 1 | 1")).toBeVisible();
    await expect(page.getByText("Account 2 | 2")).toBeVisible();
    await expect(page.getByText("Account 3 | 3")).toBeVisible();
    await expect(page.getByText("Account 4 | 4")).toBeVisible();
    await expect(page.getByText("Account 5 | 5")).toBeVisible();

    // Test clicking on different tabs
    await page.getByText("Account 3 | 3").click();
    await expect(page.getByText("Content for account 3")).toBeVisible();
  });
});
