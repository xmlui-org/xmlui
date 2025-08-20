import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  // Use low delay duration for faster tests as suggested
  const LOW_DELAY = 10;

  test("renders with tooltip property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CHStack height="100px" verticalAlignment="center">
        <Button
          label="Hover me!"
          tooltip="I'm a tooltip!"
          tooltipOptions="delayDuration: ${LOW_DELAY}"
          testId="tooltip-button"
        />
      </CHStack>
    `);

    const button = page.getByTestId("tooltip-button");
    await expect(button).toBeVisible();
    
    // Hover over the button to trigger tooltip
    await button.hover();
    
    // Wait for tooltip to appear with low delay
    await expect(page.getByText("I'm a tooltip!")).toBeVisible();
    
    // Note: We skip testing tooltip hiding as it's dependent on implementation details
    // and the main functionality test is that it appears correctly on hover
  });

  test("renders with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack height="80px" width="fit-content">
        <Card
          title="Tooltip with markdown"
          tooltipMarkdown="This *example* uses \`tooltipMarkdown\`"
          tooltipOptions="delayDuration: ${LOW_DELAY}"
          testId="markdown-card"
        />
      </VStack>
    `);

    const card = page.getByTestId("markdown-card");
    await expect(card).toBeVisible();
    
    // Hover to show tooltip
    await card.hover();
    
    // Check that markdown is rendered (looking for emphasis and code elements)
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('em')).toContainText('example');
    await expect(tooltip.locator('code')).toContainText('tooltipMarkdown');
  });

  test("renders with 'side' property set to right", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CHStack height="100px" verticalAlignment="center">
        <Button
          label="Hover me!"
          tooltip="I'm positioned right"
          tooltipOptions="right; sideOffset: 32; delayDuration: ${LOW_DELAY}"
          testId="right-tooltip-button"
        />
      </CHStack>
    `);

    const button = page.getByTestId("right-tooltip-button");
    await button.hover();
    
    const tooltip = page.getByText("I'm positioned right");
    await expect(tooltip).toBeVisible();
    
    // Verify tooltip is positioned to the right of the button
    const buttonBox = await button.boundingBox();
    const tooltipBox = await tooltip.boundingBox();
    
    expect(tooltipBox!.x).toBeGreaterThan(buttonBox!.x + buttonBox!.width);
  });

  test("renders with object-style 'tooltipOptions'", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CHStack height="100px" verticalAlignment="center">
        <Button
          label="Hover me!"
          tooltip="My options use an object"
          tooltipOptions="{{ showArrow: false, side: 'bottom', align: 'start', delayDuration: ${LOW_DELAY} }}"
          testId="object-options-button"
        />
      </CHStack>
    `);

    const button = page.getByTestId("object-options-button");
    await button.hover();
    
    const tooltip = page.getByText("My options use an object");
    await expect(tooltip).toBeVisible();
    
    // Verify tooltip is positioned below the button (bottom side)
    const buttonBox = await button.boundingBox();
    const tooltipBox = await tooltip.boundingBox();
    
    expect(tooltipBox!.y).toBeGreaterThan(buttonBox!.y + buttonBox!.height);
  });

  test("renders with string-style 'tooltipOptions'", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack height="100px" horizontalAlignment="center" gap="3rem">
        <Card
          title="Tooltip to the left with no arrow"
          tooltip="I'm a Tooltip"
          tooltipOptions="left; delayDuration: ${LOW_DELAY}; !showArrow"
          testId="left-tooltip-card"
        />
      </VStack>
    `);

    const card = page.getByTestId("left-tooltip-card");
    await card.hover();
    
    const tooltip = page.getByText("I'm a Tooltip");
    await expect(tooltip).toBeVisible();
    
    // Verify tooltip is positioned to the left of the card
    const cardBox = await card.boundingBox();
    const tooltipBox = await tooltip.boundingBox();
    
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThan(cardBox!.x);
  });

  test("renders with 'sideOffset' property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack>
        <Icon
          name="email"
          width="48px"
          height="48px"
          tooltipMarkdown="**Tooltip** to the bottom with arrows, 28 pixels away"
          tooltipOptions="bottom; showArrow; sideOffset: 28; delayDuration: ${LOW_DELAY}"
          testId="bottom-tooltip-icon"
        />
      </HStack>
    `);

    const icon = page.getByTestId("bottom-tooltip-icon");
    await icon.hover();
    
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('strong')).toContainText('Tooltip');
    
    // Verify tooltip is positioned below the icon
    const iconBox = await icon.boundingBox();
    const tooltipBox = await tooltip.boundingBox();
    
    expect(tooltipBox!.y).toBeGreaterThan(iconBox!.y + iconBox!.height);
  });

  test("renders as direct Tooltip component", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack height="100px" horizontalAlignment="center">
        <Tooltip side="bottom" markdown="This *example* uses a \`Tooltip\` component" delayDuration="${LOW_DELAY}">
          <Card title="Card 1: within a Tooltip" testId="tooltip-card-1" />
          <Card title="Card 2: within the same Tooltip" testId="tooltip-card-2" />
        </Tooltip>
      </VStack>
    `);

    const card1 = page.getByTestId("tooltip-card-1");
    const card2 = page.getByTestId("tooltip-card-2");
    
    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();
    
    // Hover over first card
    await card1.hover();
    
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator('em')).toContainText('example');
    await expect(tooltip.locator('code')).toContainText('Tooltip');
    
    // Move to second card - tooltip should still be visible
    await card2.hover();
    await expect(tooltip).toBeVisible();
  });

  test("renders with 'tooltipTemplate' property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack height="100px" horizontalAlignment="center">
        <Tooltip side="bottom" delayDuration="${LOW_DELAY}">
          <property name="tooltipTemplate">
            <HStack>
              <Stack width="24px" height="24px" backgroundColor="purple" testId="purple-square" />
              <H2>This is a tooltip</H2>
            </HStack>
          </property>
          <Card title="I have a templated Tooltip!" testId="template-card" />
        </Tooltip>
      </VStack>
    `);

    const card = page.getByTestId("template-card");
    await card.hover();
    
    // Check that custom template elements are present
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.getByTestId("purple-square")).toBeVisible();
    await expect(tooltip.getByRole("heading", { level: 2 })).toContainText("This is a tooltip");
  });

  test("handles multiple tooltips", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack gap="2rem">
        <Button
          label="First button"
          tooltip="First tooltip"
          tooltipOptions="delayDuration: ${LOW_DELAY}"
          testId="first-button"
        />
        <Button
          label="Second button"
          tooltip="Second tooltip"
          tooltipOptions="delayDuration: ${LOW_DELAY}"
          testId="second-button"
        />
      </VStack>
    `);

    const firstButton = page.getByTestId("first-button");
    const secondButton = page.getByTestId("second-button");
    
    // Hover first button
    await firstButton.hover();
    await expect(page.getByText("First tooltip")).toBeVisible();
    
    // Move to second button
    await secondButton.hover();
    
    // First tooltip should disappear, second should appear
    await expect(page.getByText("First tooltip")).not.toBeVisible();
    await expect(page.getByText("Second tooltip")).toBeVisible();
  });

  test("renders with different 'align' property values", async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack gap="4rem" horizontalAlignment="center">
        <Button
          label="Start aligned"
          tooltip="Start aligned tooltip"
          tooltipOptions="bottom; start; delayDuration: ${LOW_DELAY}"
          testId="start-button"
        />
        <Button
          label="Center aligned"
          tooltip="Center aligned tooltip"
          tooltipOptions="bottom; center; delayDuration: ${LOW_DELAY}"
          testId="center-button"
        />
        <Button
          label="End aligned"
          tooltip="End aligned tooltip"
          tooltipOptions="bottom; end; delayDuration: ${LOW_DELAY}"
          testId="end-button"
        />
      </HStack>
    `);

    // Test start alignment
    const startButton = page.getByTestId("start-button");
    await startButton.hover();
    await expect(page.getByText("Start aligned tooltip")).toBeVisible();
    
    await page.locator('body').hover(); // Clear hover
    
    // Test center alignment
    const centerButton = page.getByTestId("center-button");
    await centerButton.hover();
    await expect(page.getByText("Center aligned tooltip")).toBeVisible();
    
    await page.locator('body').hover(); // Clear hover
    
    // Test end alignment
    const endButton = page.getByTestId("end-button");
    await endButton.hover();
    await expect(page.getByText("End aligned tooltip")).toBeVisible();
  });

  test("renders with 'defaultOpen' property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip text="Always visible tooltip" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" testId="default-open-button" />
      </Tooltip>
    `);

    // Tooltip should be visible immediately without hovering
    await expect(page.getByText("Always visible tooltip")).toBeVisible();
    
    const button = page.getByTestId("default-open-button");
    await expect(button).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  const LOW_DELAY = 10;

  test("has correct 'role' attribute", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="tooltip-trigger"
      />
    `);

    const button = page.getByTestId("tooltip-trigger");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Test tooltip");
  });

  test("tooltip content is accessible via screen reader", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Accessible button"
        tooltip="This tooltip is accessible"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="accessible-button"
      />
    `);

    const button = page.getByTestId("accessible-button");
    await button.hover();
    
    // Check that tooltip has proper accessibility attributes
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    
    // Verify tooltip content is properly exposed
    await expect(tooltip).toHaveText("This tooltip is accessible");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  const LOW_DELAY = 10;

  test.skip("applies 'backgroundColor-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="theme-button"
      />
    `, {
      testThemeVars: { "backgroundColor-Tooltip": "rgb(255, 0, 0)" },
    });

    const button = page.getByTestId("theme-button");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.skip("applies 'textColor-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="text-color-button"
      />
    `, {
      testThemeVars: { "textColor-Tooltip": "rgb(0, 255, 0)" },
    });

    const button = page.getByTestId("text-color-button");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("color", "rgb(0, 255, 0)");
  });

  test.skip("applies 'borderRadius-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="border-radius-button"
      />
    `, {
      testThemeVars: { "borderRadius-Tooltip": "12px" },
    });

    const button = page.getByTestId("border-radius-button");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("border-radius", "12px");
  });

  test.skip("applies 'fontSize-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="font-size-button"
      />
    `, {
      testThemeVars: { "fontSize-Tooltip": "20px" },
    });

    const button = page.getByTestId("font-size-button");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("font-size", "20px");
  });

  test.skip("applies 'paddingLeft-Tooltip' and 'paddingRight-Tooltip' theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Test button"
        tooltip="Test tooltip"
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="padding-button"
      />
    `, {
      testThemeVars: { 
        "paddingLeft-Tooltip": "20px",
        "paddingRight-Tooltip": "25px"
      },
    });

    const button = page.getByTestId("padding-button");
    await button.hover();
    
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("padding-left", "20px");
    await expect(tooltip).toHaveCSS("padding-right", "25px");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS  
// =============================================================================

test.describe("Other Edge Cases", () => {
  const LOW_DELAY = 10;

  test("handles empty tooltip text", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button
        label="Button with empty tooltip"
        tooltip=""
        tooltipOptions="delayDuration: ${LOW_DELAY}"
        testId="empty-tooltip-button"
      />
    `);

    const button = page.getByTestId("empty-tooltip-button");
    await expect(button).toBeVisible();
    
    // Hover should not show any tooltip content
    await button.hover();
    
    // Wait a bit to ensure tooltip would appear if it was going to
    await page.waitForTimeout(50);
    
    // There should be no visible tooltip with meaningful content
    const tooltips = page.locator('[role="tooltip"]');
    const count = await tooltips.count();
    if (count > 0) {
      // If tooltip exists, it should be empty or not visible
      const tooltip = tooltips.first();
      const text = await tooltip.textContent();
      expect(text?.trim()).toBe("");
    }
  });

  test("handles tooltip without any content properties", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip delayDuration="${LOW_DELAY}">
        <Button label="Button in tooltip without content" testId="no-content-button" />
      </Tooltip>
    `);

    const button = page.getByTestId("no-content-button");
    await expect(button).toBeVisible();
    
    // Hover should not show tooltip since there's no content
    await button.hover();
    await page.waitForTimeout(50);
    
    // Should not find any tooltip with content
    const tooltips = page.locator('[role="tooltip"]');
    const count = await tooltips.count();
    expect(count).toBe(0);
  });
});
