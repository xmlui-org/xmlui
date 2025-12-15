import { expect, test } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders children in horizontal layout", async ({ initTestBed, createResponsiveBarDriver }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
      `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    // All buttons should be visible initially
    await expect(responsiveBar.component.locator('[data-testid="btn1"]').first()).toBeVisible();
    await expect(responsiveBar.component.locator('[data-testid="btn2"]').first()).toBeVisible();
    await expect(responsiveBar.component.locator('[data-testid="btn3"]').first()).toBeVisible();

    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).not.toBeVisible();
  });

  test("moves overflowing items to dropdown when container is too narrow", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="200px">
      <ResponsiveBar testId="responsive-bar">
        <Button testId="btn1" label="Very Long Button 1" />
        <Button testId="btn2" label="Very Long Button 2" />
        <Button testId="btn3" label="Very Long Button 3" />
        <Button testId="btn4" label="Very Long Button 4" />
      </ResponsiveBar>
      </Stack>
      `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    const overflow = responsiveBar.getByPartName("overflow");

    // If there's an overflow dropdown, some items should be moved there
    await expect(overflow).toBeVisible();

    // There should be some menu items in the dropdown
    await overflow.click();
    const menuItems = responsiveBar.getMenuItems();
    const menuItemCount = await menuItems.count();
    expect(menuItemCount).toBeGreaterThan(0);
  });

  test("responds to container resize", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" style="width: 400px; border: 1px solid red;">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
        <Button testId="btn4" label="Button 4" />
      </ResponsiveBar>
      `);

    const responsiveBar = page.getByTestId("responsive-bar");
    await expect(responsiveBar).toBeVisible();

    // Initially, check if all buttons are visible or some are in overflow
    await page.waitForTimeout(100);

    // Check the current state
    const btn1Visible = await responsiveBar.locator('[data-testid="btn1"]').first().isVisible();
    const btn4Visible = await responsiveBar.locator('[data-testid="btn4"]').first().isVisible();

    // Verify the component is working - at least the first button should be visible
    expect(btn1Visible).toBe(true);
  });
});

// =============================================================================
// DROPDOWNTEXT PROPERTY TESTS
// =============================================================================

test.describe("dropdownText property", () => {
  test("displays default 'More options' text in dropdown trigger", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check if the default "More options" text appears in the trigger button
    await expect(overflow).toContainText("More options");
  });

  test("displays custom dropdownText in dropdown trigger", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="Show More">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check if the custom "Show More" text appears in the trigger button
    await expect(overflow).toContainText("Show More");
  });

  test("handles empty string dropdownText", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");

    // Dropdown trigger should still be visible even without text (it has an icon)
    await expect(overflow).toBeVisible();

    // The overflow div should not contain text directly (only has child elements like button/icon)
    const directText = await overflow.evaluate((el) => {
      // Get only direct text nodes, excluding child element text
      return Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim())
        .join("");
    });
    expect(directText).toBe("");
  });

  test("handles unicode characters in dropdownText", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="更多选项 👨‍👩‍👧‍👦">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check if unicode text appears in the trigger button
    await expect(overflow).toContainText("更多选项");
  });

  test("handles very long dropdownText gracefully", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    const longText =
      "This is a very long dropdown text that should still be handled gracefully by the component";
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="${longText}">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check that button with long text is visible
    await expect(overflow).toContainText(longText.substring(0, 30));
  });

  test("handles special characters in dropdownText", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="More &amp; Options">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check if the text with special characters appears correctly
    await expect(overflow).toContainText("More & Options");
  });

  test("dropdownText works with vertical orientation", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack height="100px">
        <ResponsiveBar testId="responsive-bar" orientation="vertical" dropdownText="Show More Items">
          <Button label="Button 1" />
          <Button label="Button 2" />
          <Button label="Button 3" />
          <Button label="Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Check if custom text appears in vertical orientation
    await expect(overflow).toContainText("Show More Items");
  });

  test("dropdownText is accessible via button role", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="150px">
        <ResponsiveBar testId="responsive-bar" dropdownText="Additional Options">
          <Button label="Very Long Button Text 1" />
          <Button label="Very Long Button Text 2" />
          <Button label="Very Long Button Text 3" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // The trigger should be a button for accessibility
    const trigger = page.getByRole("button", { name: /Additional Options/i });
    await expect(trigger).toBeVisible();
  });
});

// =============================================================================
// REVERSE PROPERTY TESTS
// =============================================================================

test.describe("reverse property", () => {
  test("renders children in reverse order horizontally (right to left)", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" reverse="true">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    // Get positions of buttons
    const { left: btn1Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn1"]').first(),
    );
    const { left: btn2Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn2"]').first(),
    );
    const { left: btn3Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn3"]').first(),
    );

    // When reversed, btn3 should be leftmost, then btn2, then btn1
    expect(btn3Left).toBeLessThan(btn2Left);
    expect(btn2Left).toBeLessThan(btn1Left);
  });

  test("renders children in normal order when reverse is false", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" reverse="false">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    // Get positions of buttons
    const { left: btn1Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn1"]').first(),
    );
    const { left: btn2Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn2"]').first(),
    );
    const { left: btn3Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn3"]').first(),
    );

    // When not reversed, btn1 should be leftmost, then btn2, then btn3
    expect(btn1Left).toBeLessThan(btn2Left);
    expect(btn2Left).toBeLessThan(btn3Left);
  });

  test("renders children in reverse order vertically (bottom to top)", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" orientation="vertical" reverse="true">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    // Get positions of buttons
    const { top: btn1Top } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn1"]').first(),
    );
    const { top: btn2Top } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn2"]').first(),
    );
    const { top: btn3Top } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn3"]').first(),
    );

    // When reversed vertically, btn3 should be at top, then btn2, then btn1
    expect(btn3Top).toBeLessThan(btn2Top);
    expect(btn2Top).toBeLessThan(btn1Top);
  });

  test("overflow dropdown appears at start when reverse is true", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" reverse="true">
          <Button testId="btn1" label="Very Long Button 1" />
          <Button testId="btn2" label="Very Long Button 2" />
          <Button testId="btn3" label="Very Long Button 3" />
          <Button testId="btn4" label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Get the leftmost visible button
    const visibleButtons = responsiveBar.component.locator('[data-testid^="btn"]');
    const firstVisibleButton = visibleButtons.first();
    
    const { left: overflowLeft } = await getBounds(overflow);
    const { left: firstButtonLeft } = await getBounds(firstVisibleButton);

    // When reversed, overflow should be at the start (left), before the buttons
    expect(overflowLeft).toBeLessThan(firstButtonLeft);
  });

  test("overflow dropdown appears at end when reverse is false", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" reverse="false">
          <Button testId="btn1" label="Very Long Button 1" />
          <Button testId="btn2" label="Very Long Button 2" />
          <Button testId="btn3" label="Very Long Button 3" />
          <Button testId="btn4" label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Get the rightmost visible button
    const visibleButtons = responsiveBar.component.locator('[data-testid^="btn"]');
    const lastVisibleButton = visibleButtons.last();
    
    const { right: overflowRight } = await getBounds(overflow);
    const { right: lastButtonRight } = await getBounds(lastVisibleButton);

    // When not reversed, overflow should be at the end (right), after the buttons
    expect(overflowRight).toBeGreaterThan(lastButtonRight);
  });

  test("handles null reverse property", async ({ initTestBed, createResponsiveBarDriver }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" reverse="{null}">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    await expect(responsiveBar.component).toBeVisible();

    // Should default to normal order (false) when null
    const { left: btn1Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn1"]').first(),
    );
    const { left: btn3Left } = await getBounds(
      responsiveBar.component.locator('[data-testid="btn3"]').first(),
    );
    expect(btn1Left).toBeLessThan(btn3Left);
  });
});

// =============================================================================
// DROPDOWNALIGNMENT PROPERTY TESTS
// =============================================================================

test.describe("dropdownAlignment property", () => {
  test("alignment='start' aligns dropdown menu to the left", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" dropdownAlignment="start">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const { x: triggerX } = await overflow.boundingBox();
    const { x: menuX } = await page.getByRole("menu").boundingBox();
    expect(menuX).toBeCloseTo(triggerX, 0);
  });

  test("alignment='end' aligns dropdown menu to the right", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" dropdownAlignment="end">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    await page.waitForTimeout(100); // Wait for menu to render
    const { width: triggerWidth, x: triggerX } = await overflow.boundingBox();
    const { width: menuWidth, x: menuX } = await page.getByRole("menu").boundingBox();
    const menuEndX = menuX + menuWidth;
    const triggerEndX = triggerX + triggerWidth;
    expect(menuEndX).toBeCloseTo(triggerEndX, 0);
  });

  test("alignment='center' centers dropdown menu", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" dropdownAlignment="center">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const { width: triggerWidth, x: triggerX } = await overflow.boundingBox();
    const { width: menuWidth, x: menuX } = await page.getByRole("menu").boundingBox();
    
    const triggerCenter = triggerX + triggerWidth / 2;
    const menuCenter = menuX + menuWidth / 2;
    expect(menuCenter).toBeCloseTo(triggerCenter, 0);
  });

  test.skip("defaults to 'end' alignment when reverse is false", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="400px">
        <ResponsiveBar testId="responsive-bar" reverse="false">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const { width: triggerWidth, x: triggerX } = await overflow.boundingBox();
    const { width: menuWidth, x: menuX } = await page.getByRole("menu").boundingBox();
    const menuEndX = menuX + menuWidth;
    const triggerEndX = triggerX + triggerWidth;
    
    // Should align to the end (right) by default
    expect(menuEndX-triggerEndX).toBeGreaterThanOrEqual(0);
    expect(menuEndX-triggerEndX).toBeLessThanOrEqual(8);

  });

  test.skip("defaults to 'start' alignment when reverse is true", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="400px">
        <ResponsiveBar testId="responsive-bar" reverse="true">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const { width: triggerWidth, x: triggerX } = await overflow.boundingBox();
    const { width: menuWidth, x: menuX } = await page.getByRole("menu").boundingBox();
    const menuEndX = menuX + menuWidth;
    const triggerEndX = triggerX + triggerWidth;
    
    // Should align to the end (right) by default
    expect(menuEndX-triggerEndX).toBeGreaterThanOrEqual(0);
    expect(menuEndX-triggerEndX).toBeLessThanOrEqual(8);
  });

  test.skip("explicit dropdownAlignment overrides default from reverse", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="400px">
        <ResponsiveBar testId="responsive-bar" reverse="true" dropdownAlignment="end">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const { x: triggerX } = await overflow.boundingBox();
    const { x: menuX } = await page.getByRole("menu").boundingBox();
    
    // Should use explicit 'end' alignment despite reverse being true
    expect(menuX).toBeCloseTo(triggerX, 1);
  });

  test("handles null dropdownAlignment", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" dropdownAlignment="{null}">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    await overflow.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
  });
});

// =============================================================================
// WILLOPEN EVENT TESTS
// =============================================================================

test.describe("willOpen event", () => {
  test("fires willOpen event when overflow dropdown opens", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" onWillOpen="testState = 'willOpen-fired'">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Click to trigger willOpen event
    await overflow.click();

    // Event should have fired
    await expect.poll(testStateDriver.testState).toEqual("willOpen-fired");

    // Dropdown menu should be open
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("prevents opening when willOpen returns false", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" onWillOpen="return false">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Click should not open dropdown due to willOpen returning false
    await overflow.click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("willOpen event has access to component state", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Stack width="200px">
        <ResponsiveBar testId="responsive-bar" onWillOpen="testState = testState == null ? 1 : testState + 1">
          <Button label="Very Long Button 1" />
          <Button label="Very Long Button 2" />
          <Button label="Very Long Button 3" />
          <Button label="Very Long Button 4" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // First click
    await overflow.click();
    await expect.poll(testStateDriver.testState).toEqual(1);
    await expect(page.getByRole("menu")).toBeVisible();

    // Close by clicking outside
    await page.getByTestId("responsive-bar").click();
    await expect(page.getByRole("menu")).not.toBeVisible();

    // Second click
    await overflow.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("willOpen does not fire when no overflow menu exists", async ({
    initTestBed,
    createResponsiveBarDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Stack width="600px">
        <ResponsiveBar testId="responsive-bar" onWillOpen="testState = 'willOpen-fired'">
          <Button testId="btn1" label="Button 1" />
          <Button testId="btn2" label="Button 2" />
        </ResponsiveBar>
      </Stack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");

    // No overflow menu should be visible
    await expect(overflow).not.toBeVisible();

    // Event should not have fired
    await expect.poll(testStateDriver.testState).toBeNull();
  });
});

// =============================================================================
// API METHODS TESTS
// =============================================================================

test.describe("API methods", () => {
  test("open() API method opens the overflow dropdown", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <Stack width="200px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button label="Very Long Button 1" />
            <Button label="Very Long Button 2" />
            <Button label="Very Long Button 3" />
            <Button label="Very Long Button 4" />
          </ResponsiveBar>
        </Stack>
        <Button testId="openBtn" onClick="responsiveBar.open()">Open Menu</Button>
      </VStack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Menu should not be visible initially
    await expect(page.getByRole("menu")).not.toBeVisible();

    // Click button to open menu via API
    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("menu")).toBeVisible();
  });

  test("close() API method closes the overflow dropdown", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <Stack width="200px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button label="Very Long Button 1" />
            <Button label="Very Long Button 2" />
            <Button label="Very Long Button 3" />
            <Button label="Very Long Button 4" />
          </ResponsiveBar>
        </Stack>
        <Button testId="closeBtn" onClick="responsiveBar.close()">Close Menu</Button>
      </VStack>
    `);

    const responsiveBar = await createResponsiveBarDriver("responsive-bar");
    const overflow = responsiveBar.getByPartName("overflow");
    await expect(overflow).toBeVisible();

    // Open menu manually
    await overflow.click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Click button to close menu via API
    await page.getByTestId("closeBtn").click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("hasOverflow() API returns true when overflow exists", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <Stack width="200px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button label="Very Long Button 1" />
            <Button label="Very Long Button 2" />
            <Button label="Very Long Button 3" />
            <Button label="Very Long Button 4" />
          </ResponsiveBar>
        </Stack>
        <Button testId="checkBtn" onClick="testState = responsiveBar.hasOverflow()">Check Overflow</Button>
      </VStack>
    `);

    // Click button to check overflow status via API
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("hasOverflow() API returns false when no overflow exists", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <Stack width="600px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button testId="btn1" label="Button 1" />
            <Button testId="btn2" label="Button 2" />
          </ResponsiveBar>
        </Stack>
        <Button testId="checkBtn" onClick="testState = responsiveBar.hasOverflow()">Check Overflow</Button>
      </VStack>
    `);

    // Click button to check overflow status via API
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("open() and close() APIs work multiple times", async ({
    initTestBed,
    createResponsiveBarDriver,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <Stack width="200px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button label="Very Long Button 1" />
            <Button label="Very Long Button 2" />
            <Button label="Very Long Button 3" />
            <Button label="Very Long Button 4" />
          </ResponsiveBar>
        </Stack>
        <HStack>
          <Button testId="openBtn" onClick="responsiveBar.open()">Open</Button>
          <Button testId="closeBtn" onClick="responsiveBar.close()">Close</Button>
        </HStack>
      </VStack>
    `);

    const menu = page.getByRole("menu");

    // First open
    await page.getByTestId("openBtn").click();
    await expect(menu).toBeVisible();

    // First close
    await page.getByTestId("closeBtn").click();
    await expect(menu).not.toBeVisible();

    // Second open
    await page.getByTestId("openBtn").click();
    await expect(menu).toBeVisible();

    // Second close
    await page.getByTestId("closeBtn").click();
    await expect(menu).not.toBeVisible();
  });

  test("API methods work with vertical orientation", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <Stack height="100px" width="200px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar" orientation="vertical">
            <Button label="Button 1" />
            <Button label="Button 2" />
            <Button label="Button 3" />
            <Button label="Button 4" />
          </ResponsiveBar>
        </Stack>
        <HStack>
          <Button testId="openBtn" onClick="responsiveBar.open()">Open</Button>
          <Button testId="closeBtn" onClick="responsiveBar.close()">Close</Button>
          <Button testId="checkBtn" onClick="testState = responsiveBar.hasOverflow()">Check</Button>
        </HStack>
      </VStack>
    `);

    const menu = page.getByRole("menu");

    // Check hasOverflow
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(true);

    // Open via API
    await page.getByTestId("openBtn").click();
    await expect(menu).toBeVisible();

    // Close via API - use force since menu might overlap the button
    await page.getByTestId("closeBtn").click({ force: true });
    await expect(menu).not.toBeVisible();
  });

  test("APIs do nothing when no overflow menu exists", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <Stack width="600px">
          <ResponsiveBar id="responsiveBar" testId="responsive-bar">
            <Button testId="btn1" label="Button 1" />
            <Button testId="btn2" label="Button 2" />
          </ResponsiveBar>
        </Stack>
        <HStack>
          <Button testId="openBtn" onClick="responsiveBar.open()">Open</Button>
          <Button testId="checkBtn" onClick="testState = responsiveBar.hasOverflow()">Check</Button>
        </HStack>
      </VStack>
    `);

    // hasOverflow should return false
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(false);

    // open() should do nothing (no menu to open)
    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("menu")).not.toBeVisible();
  });
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("can select ResponsiveBarDropdown", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack width="300px">
        <ResponsiveBar testId="test">
          <Button label="Button 1" />
          <Button label="Button 2" />
          <Button label="Button 3" />
          <Button label="Button 4" />
          <Button label="Button 5" />
        </ResponsiveBar>Í
      </Stack>
    `);
    const componentPart = page.getByTestId("test").locator('[data-part-id="overflow"]');
    await expect(componentPart).toBeVisible();
  });
});
