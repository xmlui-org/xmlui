import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// Use low delay duration for faster tests as suggested
const LOW_DELAY = 10;

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders component", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip delayDuration="${LOW_DELAY}" text="I'm a tooltip!">
        <Button label="Hover me!" testId="tooltip-button" />
      </Tooltip>
    `);
    const button = page.getByTestId("tooltip-button");
    await expect(button).toBeVisible();
    // Hover over the button to trigger tooltip
    await button.hover();
    // Wait for tooltip to appear with low delay
    await expect(page.locator("[data-tooltip-container]")).toBeVisible();
  });

  // Note: This test is mainly to verify that the tooltip has the correct role for accessibility but
  // is placed here since we use getByRole for the content.
  // Fetching by data attribute is for the dimension tests below.
  test("has correct 'role' attribute", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip text="Tooltip" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `);
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Tooltip");
  });

  test("renders with tooltip property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip delayDuration="${LOW_DELAY}" text="I'm a tooltip!">
        <Button label="Hover me!" testId="tooltip-button" />
      </Tooltip>
    `);

    const button = page.getByTestId("tooltip-button");
    await expect(button).toBeVisible();

    // Hover over the button to trigger tooltip
    await button.hover();

    // Wait for tooltip to appear with low delay
    await expect(page.getByRole("tooltip")).toHaveText("I'm a tooltip!");

    // Note: We skip testing tooltip hiding as it's dependent on implementation details
    // and the main functionality test is that it appears correctly on hover
  });

  test("renders with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip delayDuration="${LOW_DELAY}" markdown="This *example* uses \`tooltipMarkdown\`">
        <Card title="Tooltip with markdown" testId="markdown-card" />
      </Tooltip>
    `);

    const card = page.getByTestId("markdown-card");
    await expect(card).toBeVisible();

    // Hover to show tooltip
    await card.hover();

    // Check that markdown is rendered (looking for emphasis and code elements)
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("em")).toContainText("example");
    await expect(tooltip.locator("code")).toContainText("tooltipMarkdown");
  });

  test("renders with 'side' property set to right", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CVStack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="I'm positioned right" side="right">
          <Button label="Hover me!" testId="right-tooltip-button" />
        </Tooltip>
      </CVStack>
    `);

    const button = page.getByTestId("right-tooltip-button");
    await button.hover();

    const tooltip = page.getByText("I'm positioned right");
    await expect(tooltip).toBeVisible();

    // Verify tooltip is positioned to the right of the button
    const buttonBox = await getBounds(button);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.left).toBeGreaterThan(buttonBox.right);
  });

  test("renders with 'side' property set to left", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CVStack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="I'm positioned left" side="left">
          <Button label="Hover me!" testId="left-tooltip-button" />
        </Tooltip>
      </CVStack>
    `);

    const button = page.getByTestId("left-tooltip-button");
    await button.hover();

    const tooltip = page.getByText("I'm positioned left");
    await expect(tooltip).toBeVisible();

    // Verify tooltip is positioned to the right of the button
    const buttonBox = await getBounds(button);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.right).toBeLessThan(buttonBox.left);
  });

  test("renders with 'side' property set to top", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CVStack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="I'm positioned top" side="top">
          <Button label="Hover me!" testId="top-tooltip-button" />
        </Tooltip>
      </CVStack>
    `);

    const button = page.getByTestId("top-tooltip-button");
    await button.hover();

    const tooltip = page.getByText("I'm positioned top");
    await expect(tooltip).toBeVisible();

    // Verify tooltip is positioned above the button
    const buttonBox = await getBounds(button);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.bottom).toBeLessThan(buttonBox.top);
  });

  test("renders with 'side' property set to bottom", async ({ page, initTestBed }) => {
    await initTestBed(`
      <CVStack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="I'm positioned bottom" side="bottom">
          <Button label="Hover me!" testId="bottom-tooltip-button" />
        </Tooltip>
      </CVStack>
    `);

    const button = page.getByTestId("bottom-tooltip-button");
    await button.hover();

    const tooltip = page.getByText("I'm positioned bottom");
    await expect(tooltip).toBeVisible();

    // Verify tooltip is positioned below the button
    const buttonBox = await getBounds(button);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.top).toBeGreaterThan(buttonBox.bottom);
  });

  test(`renders with 'sideOffset' property when side is top`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <CVStack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip side="top" text="Tooltip" sideOffset="28" delayDuration="${LOW_DELAY}">
          <Icon name="email" testId="tooltip-icon" />
        </Tooltip>
      </CVStack>
    `);
    const icon = page.getByTestId("tooltip-icon");
    await icon.hover();

    const tooltip = page.locator("[data-tooltip-container]");

    // Verify tooltip is positioned above the icon with the correct offset
    const iconBox = await getBounds(icon);
    const tooltipBox = await getBounds(tooltip);

    expect(iconBox.top - tooltipBox.bottom).toEqualWithTolerance(28, 4);
  });

  test(`renders with 'sideOffset' property when side is bottom`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip side="bottom" text="Tooltip" sideOffset="28" delayDuration="${LOW_DELAY}">
          <Icon name="email" testId="tooltip-icon" />
        </Tooltip>
      </Stack>
    `);
    const icon = page.getByTestId("tooltip-icon");
    await icon.hover();

    const tooltip = page.locator("[data-tooltip-container]");

    // Verify tooltip is positioned below the icon with the correct offset
    const iconBox = await getBounds(icon);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.top - iconBox.bottom).toBeGreaterThanOrEqual(28);
  });

  test(`renders with 'sideOffset' property when side is left`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip side="left" text="Tooltip" sideOffset="28" delayDuration="${LOW_DELAY}">
          <Icon name="email" testId="tooltip-icon-left" />
        </Tooltip>
      </Stack>
    `);
    const icon = page.getByTestId("tooltip-icon-left");
    await icon.hover();

    const tooltip = page.getByRole("tooltip");

    // Verify tooltip is positioned to the left of the icon with the correct offset
    const iconBox = await getBounds(icon);
    const tooltipBox = await getBounds(tooltip);

    expect(iconBox.left - tooltipBox.right).toBeGreaterThanOrEqual(28);
  });

  test(`renders with 'sideOffset' property when side is right`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack height="200px" horizontalAlignment="center" verticalAlignment="center">
        <Tooltip side="right" text="Tooltip" sideOffset="28" delayDuration="${LOW_DELAY}">
          <Icon name="email" testId="tooltip-icon-right" />
        </Tooltip>
      </Stack>
    `);
    const icon = page.getByTestId("tooltip-icon-right");
    await icon.hover();

    const tooltip = page.getByRole("tooltip");

    // Verify tooltip is positioned to the right of the icon with the correct offset
    const iconBox = await getBounds(icon);
    const tooltipBox = await getBounds(tooltip);

    expect(tooltipBox.left - iconBox.right).toBeGreaterThanOrEqual(28);
  });

  test("Tooltip is shown for all wrapped children", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip side="bottom" markdown="This *example* uses a \`Tooltip\` component" delayDuration="${LOW_DELAY}">
        <VStack horizontalAlignment="center">
          <Card title="Card 1: within a Tooltip" testId="tooltip-card-1" />
          <Card title="Card 2: within the same Tooltip" testId="tooltip-card-2" />
        </VStack>
      </Tooltip>
    `);

    const card1 = page.getByTestId("tooltip-card-1");
    const card2 = page.getByTestId("tooltip-card-2");

    await expect(card1).toBeVisible();
    await expect(card2).toBeVisible();

    // Hover over first card
    await card1.hover();

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip.locator("em")).toContainText("example");
    await expect(tooltip.locator("code")).toContainText("Tooltip");

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
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip.getByTestId("purple-square")).toBeVisible();
    await expect(tooltip.getByRole("heading", { level: 2 })).toContainText("This is a tooltip");
  });

  test("renders with start 'align' property value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack horizontalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="Start aligned" side="bottom" align="start">
          <Button label="Start aligned Start aligned" testId="start-button" />
        </Tooltip>
      </HStack>
    `);
    const startButton = page.getByTestId("start-button");
    await startButton.hover();

    const tooltipBox = await getBounds(page.locator("div[data-tooltip-container]"));
    const buttonBox = await getBounds(startButton);

    expect(tooltipBox.left + tooltipBox.width / 2).toBeLessThan(
      buttonBox.left + buttonBox.width / 2,
    );
  });

  test("renders with center 'align' property value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack horizontalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="Center aligned" side="bottom" align="center">
          <Button label="Center aligned Center aligned" testId="center-button" />
        </Tooltip>
      </HStack>
    `);
    const centerButton = page.getByTestId("center-button");
    await centerButton.hover();

    const tooltipBox = await getBounds(page.locator("div[data-tooltip-container]"));
    const buttonBox = await getBounds(centerButton);

    expect(tooltipBox.left + tooltipBox.width / 2).toEqualWithTolerance(
      buttonBox.left + buttonBox.width / 2,
      10,
    );
  });

  test("renders with end 'align' property value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack horizontalAlignment="center">
        <Tooltip delayDuration="${LOW_DELAY}" text="End aligned" side="bottom" align="end">
          <Button label="End aligned End aligned" testId="end-button" />
        </Tooltip>
      </HStack>
    `);
    const endButton = page.getByTestId("end-button");
    await endButton.hover();

    const tooltipBox = await getBounds(page.locator("div[data-tooltip-container]"));
    const buttonBox = await getBounds(endButton);

    expect(tooltipBox.left + tooltipBox.width / 2).toBeGreaterThan(
      buttonBox.left + buttonBox.width / 2,
    );
  });

  test("renders with 'defaultOpen' property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip text="Always visible tooltip" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" testId="default-open-button" />
      </Tooltip>
    `);
    await expect(page.locator("div[data-tooltip-container]")).toBeVisible();
    await expect(page.getByTestId("default-open-button")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("tooltip content is accessible via screen reader", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `);
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
  test("applies 'backgroundColor-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `,
      {
        testThemeVars: { "backgroundColor-Tooltip": "rgb(255, 0, 0)" },
      },
    );
    await expect(page.locator("div[data-tooltip-container]")).toHaveCSS(
      "background-color",
      "rgb(255, 0, 0)",
    );
  });

  test("applies 'textColor-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `,
      {
        testThemeVars: { "textColor-Tooltip": "rgb(0, 255, 0)" },
      },
    );
    await expect(page.locator("div[data-tooltip-container]")).toHaveCSS("color", "rgb(0, 255, 0)");
  });

  test("applies 'borderRadius-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `,
      {
        testThemeVars: { "borderRadius-Tooltip": "12px" },
      },
    );
    await expect(page.locator("div[data-tooltip-container]")).toHaveCSS("border-radius", "12px");
  });

  test("applies 'fontSize-Tooltip' theme variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `,
      {
        testThemeVars: { "fontSize-Tooltip": "20px" },
      },
    );
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCSS("font-size", "20px");
  });

  test("applies 'paddingLeft-Tooltip' and 'paddingRight-Tooltip' theme variables", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <Tooltip text="This tooltip is accessible" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with default open tooltip" />
      </Tooltip>
    `,
      {
        testThemeVars: {
          "paddingLeft-Tooltip": "20px",
          "paddingRight-Tooltip": "25px",
        },
      },
    );
    await expect(page.locator("div[data-tooltip-container]")).toHaveCSS("padding-left", "20px");
    await expect(page.locator("div[data-tooltip-container]")).toHaveCSS("padding-right", "25px");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles empty tooltip text", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Tooltip text="" defaultOpen="true" delayDuration="${LOW_DELAY}">
        <Button label="Button with empty tooltip" />
      </Tooltip>
    `);

    // There should be no visible tooltip with meaningful content
    const tooltips = page.getByRole("tooltip");
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
      <Tooltip>
        <Button label="Button in tooltip without content" testId="no-content-button" />
      </Tooltip>
    `);

    const button = page.getByTestId("no-content-button");
    await expect(button).toBeVisible();

    // Hover should not show tooltip since there's no content
    await button.hover();

    // Should not find any tooltip with content
    const tooltips = page.getByRole("tooltip");
    const count = await tooltips.count();
    expect(count).toBe(0);
  });
});
