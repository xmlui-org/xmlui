import { getBounds } from "../../testing/component-test-helpers";
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

  test.describe("tabAlignment property", () => {
    test("tabAlignment='start' positions tabs at the start of container (horizontal)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="start" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      
      const { left: containerLeft } = await getBounds(tabsContainer);
      const { left: tab1Left } = await getBounds(tab1);

      // Tab should be near the start of the container (within a small margin for padding)
      expect(tab1Left - containerLeft).toBeLessThan(50);
    });

    test("tabAlignment='end' positions tabs at the end of container (horizontal)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="end" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tabsContainer = page.getByTestId("tabs");
      const tab3 = page.getByRole("tab", { name: "Tab 3" });
      
      const { right: containerRight } = await getBounds(tabsContainer);
      const { right: tab3Right } = await getBounds(tab3);

      // Last tab should be near the end of the container (within a small margin for padding)
      expect(containerRight - tab3Right).toBeLessThan(50);
    });

    test("tabAlignment='center' positions tabs in center of container (horizontal)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="center" testId="tabs" style="width: 800px">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      const tab3 = page.getByRole("tab", { name: "Tab 3" });
      
      const { left: containerLeft, right: containerRight, width: containerWidth } = await getBounds(tabsContainer);
      const { left: tab1Left } = await getBounds(tab1);
      const { right: tab3Right } = await getBounds(tab3);

      const containerCenter = containerLeft + containerWidth / 2;
      const tabsCenter = tab1Left + (tab3Right - tab1Left) / 2;

      // Tabs should be centered (within a reasonable margin)
      expect(Math.abs(tabsCenter - containerCenter)).toBeLessThan(50);
    });

    test("tabAlignment='stretch' makes tabs fill container width (horizontal)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="stretch" testId="tabs" style="width: 600px">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      const tab3 = page.getByRole("tab", { name: "Tab 3" });
      
      const { left: containerLeft, right: containerRight } = await getBounds(tabsContainer);
      const { left: tab1Left } = await getBounds(tab1);
      const { right: tab3Right } = await getBounds(tab3);

      // First tab should start near container start
      expect(tab1Left - containerLeft).toBeLessThan(50);
      // Last tab should end near container end
      expect(containerRight - tab3Right).toBeLessThan(50);
    });

    test("tabAlignment can be dynamically changed", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Tabs tabAlignment="{testState ?? 'start'}" testId="tabs" style="width: 700px">
            <TabItem label="Tab 1">Content 1</TabItem>
            <TabItem label="Tab 2">Content 2</TabItem>
            <TabItem label="Tab 3">Content 3</TabItem>
          </Tabs>
          <Button testId="changeBtn" onClick="testState = 'end'" />
        </Fragment>
      `);

      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      
      // Initially with 'start' alignment
      const { left: containerLeft } = await getBounds(tabsContainer);
      const { left: initialTab1Left } = await getBounds(tab1);
      expect(initialTab1Left - containerLeft).toBeLessThan(50);

      // Change to 'end' alignment
      await page.getByTestId("changeBtn").click();
      await expect.poll(testStateDriver.testState).toEqual("end");

      // After changing to 'end', the last tab should be near the end
      const tab3 = page.getByRole("tab", { name: "Tab 3" });
      const { right: containerRight } = await getBounds(tabsContainer);
      const { right: tab3Right } = await getBounds(tab3);
      expect(containerRight - tab3Right).toBeLessThan(50);
    });

    test("tabAlignment works with single tab", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="center" testId="tabs" style="width: 600px">
          <TabItem label="Only Tab">Only Content</TabItem>
        </Tabs>
      `);

      const tab = page.getByRole("tab", { name: "Only Tab" });
      await expect(tab).toBeVisible();
      
      // Verify the tab renders and is functional
      await expect(page.getByText("Only Content")).toBeVisible();
    });

    test("tabAlignment='stretch' distributes multiple tabs evenly", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="stretch" testId="tabs" style="width: 600px">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      const tab2 = page.getByRole("tab", { name: "Tab 2" });
      const tab3 = page.getByRole("tab", { name: "Tab 3" });
      
      const { width: tab1Width } = await getBounds(tab1);
      const { width: tab2Width } = await getBounds(tab2);
      const { width: tab3Width } = await getBounds(tab3);

      // All tabs should have similar widths when stretched (within 20px tolerance for text differences)
      expect(Math.abs(tab1Width - tab2Width)).toBeLessThan(20);
      expect(Math.abs(tab2Width - tab3Width)).toBeLessThan(20);
    });

    test("tabAlignment handles null value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="{null}" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
        </Tabs>
      `);

      // Should fall back to default 'start' alignment
      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      
      await expect(tab1).toBeVisible();
      
      const { left: containerLeft } = await getBounds(tabsContainer);
      const { left: tab1Left } = await getBounds(tab1);
      
      // Should behave like 'start' alignment
      expect(tab1Left - containerLeft).toBeLessThan(50);
    });

    test("tabAlignment handles undefined value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="{undefined}" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
        </Tabs>
      `);

      // Should fall back to default 'start' alignment
      const tabsContainer = page.getByTestId("tabs");
      const tab1 = page.getByRole("tab", { name: "Tab 1" });
      
      await expect(tab1).toBeVisible();
      
      const { left: containerLeft } = await getBounds(tabsContainer);
      const { left: tab1Left } = await getBounds(tab1);
      
      // Should behave like 'start' alignment
      expect(tab1Left - containerLeft).toBeLessThan(50);
    });

    test("tabAlignment maintains functionality when tabs are clicked", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs tabAlignment="center" testId="tabs" style="width: 700px">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      // Verify all tabs are visible
      await expect(page.getByRole("tab", { name: "Tab 1" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Tab 3" })).toBeVisible();

      // Click different tabs and verify content changes
      await page.getByRole("tab", { name: "Tab 2" }).click();
      await expect(page.getByText("Content 2")).toBeVisible();
      await expect(page.getByText("Content 1")).not.toBeVisible();

      await page.getByRole("tab", { name: "Tab 3" }).click();
      await expect(page.getByText("Content 3")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();

      await page.getByRole("tab", { name: "Tab 1" }).click();
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();
    });
  });

  test.describe("accordionView property", () => {
    test("accordionView renders all tab headers when true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      // All tab headers should be visible
      await expect(page.getByRole("tab", { name: "Tab 1" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Tab 2" })).toBeVisible();
      await expect(page.getByRole("tab", { name: "Tab 3" })).toBeVisible();
    });

    test("accordionView shows only active tab content", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      // Only first tab content should be visible (default active)
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();
    });

    test("accordionView positions active tab header above its content", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tab1Header = page.getByRole("tab", { name: "Tab 1" });
      const tab1Content = page.getByText("Content 1");
      
      const { bottom: headerBottom } = await getBounds(tab1Header);
      const { top: contentTop } = await getBounds(tab1Content);

      // Header should be above content (header bottom should be less than or near content top)
      expect(headerBottom).toBeLessThanOrEqual(contentTop + 5);
    });

    test("accordionView positions active tab content above next tab header", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tab1Content = page.getByText("Content 1");
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      
      const { bottom: contentBottom } = await getBounds(tab1Content);
      const { top: nextHeaderTop } = await getBounds(tab2Header);

      // Content should be above next header (content bottom should be less than or near next header top)
      expect(contentBottom).toBeLessThanOrEqual(nextHeaderTop + 5);
    });

    test("accordionView maintains order: header1 -> content1 -> header2 -> content2 (when tab2 active)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" activeTab="1" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tab1Header = page.getByRole("tab", { name: "Tab 1" });
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      const tab2Content = page.getByText("Content 2");
      const tab3Header = page.getByRole("tab", { name: "Tab 3" });
      
      const { top: tab1Top } = await getBounds(tab1Header);
      const { top: tab2Top } = await getBounds(tab2Header);
      const { top: content2Top } = await getBounds(tab2Content);
      const { top: tab3Top } = await getBounds(tab3Header);

      // Verify vertical ordering
      expect(tab1Top).toBeLessThan(tab2Top);
      expect(tab2Top).toBeLessThan(content2Top);
      expect(content2Top).toBeLessThan(tab3Top);
    });

    test("accordionView switches content when different tab is clicked", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="true" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      // Initially Tab 1 is active
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();

      // Click Tab 2
      await page.getByRole("tab", { name: "Tab 2" }).click();
      await expect(page.getByText("Content 2")).toBeVisible();
      await expect(page.getByText("Content 1")).not.toBeVisible();

      // Verify Tab 2 content is below Tab 2 header
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      const tab2Content = page.getByText("Content 2");
      const { bottom: headerBottom } = await getBounds(tab2Header);
      const { top: contentTop } = await getBounds(tab2Content);
      expect(headerBottom).toBeLessThanOrEqual(contentTop + 5);
    });

    test("accordionView works with dynamic activeTab changes", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Tabs accordionView="true" activeTab="{testState ?? 0}" testId="tabs">
            <TabItem label="Tab 1">Content 1</TabItem>
            <TabItem label="Tab 2">Content 2</TabItem>
            <TabItem label="Tab 3">Content 3</TabItem>
          </Tabs>
          <Button testId="tab2Btn" onClick="testState = 1" />
          <Button testId="tab3Btn" onClick="testState = 2" />
        </Fragment>
      `);

      // Initially Content 1 is visible
      await expect(page.getByText("Content 1")).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();

      // Switch to Tab 2
      await page.getByTestId("tab2Btn").click();
      await expect(page.getByText("Content 2")).toBeVisible();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 3")).not.toBeVisible();

      // Verify ordering for Tab 2
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      const tab2Content = page.getByText("Content 2");
      const tab3Header = page.getByRole("tab", { name: "Tab 3" });
      
      const { top: tab2Top } = await getBounds(tab2Header);
      const { top: content2Top } = await getBounds(tab2Content);
      const { top: tab3Top } = await getBounds(tab3Header);
      
      expect(tab2Top).toBeLessThan(content2Top);
      expect(content2Top).toBeLessThan(tab3Top);

      // Switch to Tab 3
      await page.getByTestId("tab3Btn").click();
      await expect(page.getByText("Content 3")).toBeVisible();
      await expect(page.getByText("Content 1")).not.toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
    });

    test("accordionView=false renders standard tabs (non-accordion)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="false" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
          <TabItem label="Tab 3">Content 3</TabItem>
        </Tabs>
      `);

      const tab1Header = page.getByRole("tab", { name: "Tab 1" });
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      const tab1Content = page.getByText("Content 1");
      
      // In standard mode (non-accordion), all headers should be visible
      await expect(tab1Header).toBeVisible();
      await expect(tab2Header).toBeVisible();
      
      // Only active tab content should be visible
      await expect(tab1Content).toBeVisible();
      await expect(page.getByText("Content 2")).not.toBeVisible();
      
      // Tab content should NOT be interleaved between headers
      // (unlike accordion view where content appears between headers)
      const { bottom: tab1Bottom } = await getBounds(tab1Header);
      const { top: tab2Top } = await getBounds(tab2Header);
      const { top: contentTop } = await getBounds(tab1Content);
      
      // Content should NOT be between the two headers
      // Either tab2 is next to tab1 (horizontal) or below tab1 but before content (vertical)
      const isContentBetweenHeaders = contentTop > tab1Bottom && contentTop < tab2Top;
      expect(isContentBetweenHeaders).toBe(false);
    });

    test("accordionView handles null value gracefully (defaults to false)", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Tabs accordionView="{null}" testId="tabs">
          <TabItem label="Tab 1">Content 1</TabItem>
          <TabItem label="Tab 2">Content 2</TabItem>
        </Tabs>
      `);

      // Should render as standard horizontal tabs
      const tab1Header = page.getByRole("tab", { name: "Tab 1" });
      const tab2Header = page.getByRole("tab", { name: "Tab 2" });
      
      await expect(tab1Header).toBeVisible();
      await expect(tab2Header).toBeVisible();
      
      // Headers should be horizontally aligned
      const { top: tab1Top } = await getBounds(tab1Header);
      const { top: tab2Top } = await getBounds(tab2Header);
      expect(Math.abs(tab1Top - tab2Top)).toBeLessThan(10);
    });
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
    await expect(page.getByRole("tab", { name: "Tab 1" })).toBeFocused();

    // Arrow right to second tab
    await expect(page.getByRole("tab", { name: "Tab 1" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeFocused();

    // Arrow right to third tab
    await expect(page.getByRole("tab", { name: "Tab 2" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Tab 3" })).toBeFocused();

    // Arrow left back to second tab
    await expect(page.getByRole("tab", { name: "Tab 3" })).toBeFocused();
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
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Press ArrowRight again - should move to Support tab
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Press ArrowRight from last tab - should cycle back to Account tab
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();
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
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).not.toBeVisible();
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Press ArrowLeft again - should move to Stream tab
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Account Content")).not.toBeVisible();
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByText("Support Content")).not.toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Press ArrowLeft again - should move to Account tab
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();
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
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();

      // Go forward twice: Account -> Stream -> Support
      await expect(page.getByRole("tab", { name: "Account" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

      // Go back once: Support -> Stream
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(page.getByText("Stream Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Stream" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();

      // Go forward to cycle: Stream -> Support -> Account
      await expect(page.getByRole("tab", { name: "Stream" })).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(page.getByText("Support Content")).toBeVisible();
      await expect(page.getByRole("tab", { name: "Support" })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Support" })).toBeFocused();

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

test.describe("onDidChange callback functionality", () => {
  test("onDidChange callback is called when tab changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.tabChangeInfo="No change yet">
      <Tabs onDidChange="(index, id, label) => {
        tabChangeInfo = 'Tab: ' + index + ' - ' + label;
      }">
        <TabItem label="First Tab">
          <Text>First tab content</Text>
        </TabItem>
        <TabItem label="Second Tab">
          <Text>Second tab content</Text>
        </TabItem>
        <TabItem label="Third Tab">
          <Text>Third tab content</Text>
        </TabItem>
      </Tabs>
      <Text>{tabChangeInfo}</Text>
      </Fragment>
    `);

    // Initially should show no change
    await expect(page.getByText("No change yet")).toBeVisible();
    await expect(page.getByText("First tab content")).toBeVisible();

    // Click on second tab
    await page.getByRole("tab", { name: "Second Tab" }).click();
    await expect(page.getByText("Second tab content")).toBeVisible();
    await expect(page.getByText("Tab: 1 - Second Tab")).toBeVisible();

    // Click on third tab
    await page.getByRole("tab", { name: "Third Tab" }).click();
    await expect(page.getByText("Third tab content")).toBeVisible();
    await expect(page.getByText("Tab: 2 - Third Tab")).toBeVisible();

    // Click back to first tab
    await page.getByRole("tab", { name: "First Tab" }).click();
    await expect(page.getByText("First tab content")).toBeVisible();
    await expect(page.getByText("Tab: 0 - First Tab")).toBeVisible();
  });

  test("onDidChange callback is not called when same tab is clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.changeCount="{0}">
      <Tabs onDidChange="(index, id, label) => {
        changeCount = changeCount + 1;
      }">
        <TabItem label="Tab One">
          <Text>Content one</Text>
        </TabItem>
        <TabItem label="Tab Two">
          <Text>Content two</Text>
        </TabItem>
      </Tabs>
      <Text>Changes: {changeCount}</Text>
      </Fragment>
    `);

    // Initially should show 0 changes
    await expect(page.getByText("Changes: 0")).toBeVisible();
    await expect(page.getByText("Content one")).toBeVisible();
    
    // Click on second tab - should trigger onDidChange
    await page.getByRole("tab", { name: "Tab Two" }).click();
    await expect(page.getByText("Content two")).toBeVisible();
    await expect(page.getByText("Changes: 1")).toBeVisible();

    // Click on second tab again - should NOT trigger onDidChange
    await page.getByRole("tab", { name: "Tab Two" }).click();
    await expect(page.getByText("Changes: 1")).toBeVisible(); // Should still be 1
  });

  test("contextMenu event fires on right click", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="Not clicked">
        <Text testId="output" label="{message}" />
        <Tabs testId="tabs" onContextMenu="message = 'Context menu triggered'">
          <TabItem label="Tab One">
            <Text>Content one</Text>
          </TabItem>
          <TabItem label="Tab Two">
            <Text>Content two</Text>
          </TabItem>
        </Tabs>
      </App>
    `);

    const tabs = page.getByTestId("tabs");
    const output = page.getByTestId("output");

    await expect(output).toHaveText("Not clicked");
    await tabs.click({ button: "right" });
    await expect(output).toHaveText("Context menu triggered");
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

test.describe("regression tests", () => {
  test("tab labels have sufficient contrast and distinct colors (issue #2840, #2839)", async ({ initTestBed, page }) => {
    // This test verifies that tab labels have visible, distinct colors with proper contrast.
    // Issue #2839/#2840: After commit 03ab737b, tab text colors became nearly invisible
    // because new theme variables (textColor-trigger-Tabs--active, textColor-trigger-Tabs--hover)
    // defaulted to "none", causing color: initial instead of inheriting parent color.
    // 
    // The bug manifested as:
    // - Inactive tabs: very light color (rgb(224, 231, 255) in light mode, rgb(31, 41, 55) in dark)
    // - Active tabs: white text on white background, essentially invisible
    //
    // Expected behavior:
    // - Inactive tabs should have medium-dark text (e.g., rgb(79, 70, 229) ~ primary-100)
    // - Active tabs should have very dark or white text depending on theme (e.g., rgb(255, 255, 255) on dark bg)
    
    await initTestBed(`
      <Tabs testId="tabs" tabAlignment="center">
        <TabItem label="First">
          <Text>First tab content</Text>
        </TabItem>
        <TabItem label="Second">
          <Text>Second tab content</Text>
        </TabItem>
        <TabItem label="Third">
          <Text>Third tab content</Text>
        </TabItem>
      </Tabs>
    `);

    const firstTab = page.getByRole("tab", { name: "First" });
    const secondTab = page.getByRole("tab", { name: "Second" });
    const thirdTab = page.getByRole("tab", { name: "Third" });

    await expect(firstTab).toBeVisible();
    await expect(secondTab).toBeVisible();
    await expect(thirdTab).toBeVisible();

    // Helper to parse RGB values from color string
    const parseRgb = (colorStr: string): { r: number; g: number; b: number } => {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) throw new Error(`Invalid color format: ${colorStr}`);
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    };

     // Get colors for active and inactive tabs
    const activeTabColor = await firstTab.evaluate((el) => window.getComputedStyle(el).color);
    const inactiveTabColor = await secondTab.evaluate((el) => window.getComputedStyle(el).color);

    const activeRgb = parseRgb(activeTabColor);
    const inactiveRgb = parseRgb(inactiveTabColor);

    // 1. Verify inactive tabs are not washed out (brightness < 235)
    // With the bug: rgb(224, 231, 255) averages to ~237 - SHOULD FAIL
    // With the fix: should be noticeably darker - SHOULD PASS
    const inactiveBrightness = (inactiveRgb.r + inactiveRgb.g + inactiveRgb.b) / 3;
    expect(inactiveBrightness).toBeLessThan(235); // Catches the washed-out bug

    // 2. Verify active and inactive tabs have different colors
    const colorDifference = Math.abs(activeRgb.r - inactiveRgb.r) + 
                           Math.abs(activeRgb.g - inactiveRgb.g) + 
                           Math.abs(activeRgb.b - inactiveRgb.b);
    expect(colorDifference).toBeGreaterThan(30); // Should be visually distinct

    // 3. Click second tab and verify colors are still not washed out
    await secondTab.click();
    await expect(secondTab).toHaveAttribute("aria-selected", "true");
    
    const newActiveColor = await secondTab.evaluate((el) => window.getComputedStyle(el).color);
    const newActiveRgb = parseRgb(newActiveColor);
    
    // Verify the clicked tab also has proper color (not all white)
    expect(newActiveRgb.r).not.toBe(255);
    expect(newActiveRgb.g).not.toBe(255);
    expect(newActiveRgb.b).not.toBe(255);
  });

  test("tab labels with headerTemplate have proper contrast (issue #2840, #2839)", async ({ initTestBed, page }) => {
    // Verify that headerTemplate content also has visible colors with good contrast.
    // The bug affected both label attrare not washed out (issue #2840, #2839)", async ({ initTestBed, page }) => {
    // Verify that headerTemplate content also doesn't have washed-out colors
    await initTestBed(`
      <Tabs testId="tabs" tabAlignment="center">
        <TabItem>
          <property name="headerTemplate">
            <Text>XML</Text>
          </property>
          <Text>XML content</Text>
        </TabItem>
        <TabItem>
          <property name="headerTemplate">
            <Text>UI</Text>
          </property>
          <Text>UI content</Text>
        </TabItem>
        <TabItem>
          <property name="headerTemplate">
            <Icon name="info" size="16px" />
          </property>
          <Text>Info content</Text>
        </TabItem>
      </Tabs>
    `);

    const xmlTab = page.getByRole("tab", { name: "XML" });
    const uiTab = page.getByRole("tab", { name: "UI" });

    await expect(xmlTab).toBeVisible();
    await expect(uiTab).toBeVisible();

    // Parse RGB helper
    const parseRgb = (colorStr: string): { r: number; g: number; b: number } => {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) throw new Error(`Invalid color format: ${colorStr}`);
      return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    };

    const activeTabColor = await xmlTab.evaluate((el) => window.getComputedStyle(el).color);
    const inactiveTabColor = await uiTab.evaluate((el) => window.getComputedStyle(el).color);

    const activeRgb = parseRgb(activeTabColor);
    const inactiveRgb = parseRgb(inactiveTabColor);

    // Verify inactive tabs are not washed out
    const inactiveBrightness = (inactiveRgb.r + inactiveRgb.g + inactiveRgb.b) / 3;
    expect(inactiveBrightness).toBeLessThan(235);

    // Verify active and inactive are visually different
    const colorDifference = Math.abs(activeRgb.r - inactiveRgb.r) + 
                           Math.abs(activeRgb.g - inactiveRgb.g) + 
                           Math.abs(activeRgb.b - inactiveRgb.b);
    expect(colorDifference).toBeGreaterThan(30);
  });
});
