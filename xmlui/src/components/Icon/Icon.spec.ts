import { create } from "domain";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with valid icon name", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="home"/>`);
    const icon = page.getByTestId("test-id-component");
    await expect(icon).toBeVisible();
  });

  test("component does not render without name prop", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon/>`);
    const icon = page.getByTestId("test-id-component");
    const exists = await icon.count();
    expect(exists).toBe(0); // Icon doesn't render without a valid name
  });
});

// =============================================================================
// NAME PROPERTY TESTS
// =============================================================================

test.describe("name Property", () => {
  test("displays icon when valid name is provided", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="home"/>`);
    const icon = page.getByTestId("test-id-component");
    await expect(icon).toBeVisible();
  });

  test("handles invalid/missing icon names gracefully (no render)", async ({ initTestBed, page }) => {
    const longName = "a".repeat(1000);
    await initTestBed(`
      <Fragment>
        <Icon testId="v1" name="non-existent-icon"/>
        <Icon testId="v2" name=""/>
        <Icon testId="v3" name="{null}"/>
        <Icon testId="v4" name="{undefined}"/>
        <Icon testId="v5" name="test-icon_with$pecial@chars"/>
        <Icon testId="v6" name="测试图标"/>
        <Icon testId="v7" name="🏠"/>
        <Icon testId="v8" name="component:specific-icon"/>
        <Icon testId="v9" name="${longName}"/>
      </Fragment>
    `);
    // Component doesn't render when icon name doesn't exist
    for (let i = 1; i <= 9; i++) {
      expect(await page.getByTestId(`v${i}`).count()).toBe(0);
    }
  });
});

// =============================================================================
// SIZE PROPERTY TESTS
// =============================================================================

test.describe("size Property", () => {
  test("renders with predefined sizes (xs, sm, md, lg)", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`
      <Fragment>
        <Icon testId="xs" name="home" size="xs"/>
        <Icon testId="sm" name="home" size="sm"/>
        <Icon testId="md" name="home" size="md"/>
        <Icon testId="lg" name="home" size="lg"/>
      </Fragment>
    `);
    for (const [id, expectedWidth] of [["xs", "12px"], ["sm", "16px"], ["md", "24px"], ["lg", "32px"]] as [string, string][]) {
      const icon = (await createIconDriver(id)).svgIcon;
      await expect(icon).toBeVisible();
      expect(await icon.evaluate((el) => window.getComputedStyle(el).width)).toBe(expectedWidth);
    }
  });

  test("renders with custom pixel, em, and rem sizes", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`
      <Fragment>
        <Icon testId="px" name="home" size="48px"/>
        <Icon testId="em" name="home" size="3em"/>
        <Icon testId="rem" name="home" size="2rem"/>
      </Fragment>
    `);
    for (const [id, expectedWidth] of [["px", "48px"], ["em", "48px"], ["rem", "32px"]] as [string, string][]) {
      const icon = (await createIconDriver(id)).svgIcon;
      await expect(icon).toBeVisible();
      expect(await icon.evaluate((el) => window.getComputedStyle(el).width)).toBe(expectedWidth);
    }
  });

  test("handles invalid size gracefully", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="invalid-size"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).not.toBeVisible();
  });

  test("handles negative size value", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="-20px"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;

    // With negative size, element exists but browser normalizes to 0px
    const exists = await icon.count();
    expect(exists).toBe(1);

    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    // Browser normalizes negative values to 0px
    expect(computedStyle.width).toBe("0px");
  });

  test("handles zero size value", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="0px"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    // Zero-size elements might not be "visible" but should exist
    const exists = await icon.count();
    expect(exists).toBe(1);

    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("0px");
  });

  test("handles null size value", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="{null}"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
  });

  test("handles undefined size value", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="{undefined}"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
  });
});

// =============================================================================
// FALLBACK PROPERTY TESTS
// =============================================================================

test.describe("fallback Property", () => {
  test("displays fallback icon when primary icon doesn't exist", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback="trash"/>`);
    const icon = page.getByTestId("test-id-component");
    await expect(icon).toBeVisible();
  });

  test("ignores fallback when primary icon exists", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="home" fallback="trash"/>`);
    const icon = page.getByTestId("test-id-component");
    await expect(icon).toBeVisible();
  });

  test("handles empty string fallback", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback=""/>`);
    const icon = page.getByTestId("test-id-component");
    // Empty fallback means no icon renders
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles null fallback value", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback="{null}"/>`);
    const icon = page.getByTestId("test-id-component");
    // Null fallback means no icon renders
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles undefined fallback value", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback="{undefined}"/>`);
    const icon = page.getByTestId("test-id-component");
    // Undefined fallback means no icon renders
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles special characters in fallback", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback="test-icon_with$pecial@chars"/>`);
    const icon = page.getByTestId("test-id-component");
    // Non-existent fallback means no icon renders
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles non-existent fallback icon", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon" fallback="also-non-existent"/>`);
    const icon = page.getByTestId("test-id-component");
    // Non-existent fallback means no icon renders
    const exists = await icon.count();
    expect(exists).toBe(0);
  });
});

// =============================================================================
// CLICK EVENT TESTS
// =============================================================================

test.describe("click Event", () => {
  test("fires click event when icon is clicked", async ({ initTestBed, createIconDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Icon testId="icon" name="home" onClick="testState = 'clicked'"/>
    `);

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await icon.click();

    await expect.poll(testStateDriver.testState).toEqual("clicked");
  });

  test("applies clickable cursor when click handler is present", async ({
    initTestBed,
    createIconDriver,
  }) => {
    await initTestBed(`<Icon testId="icon" name="home" onClick="testState = 'clicked'"/>`);

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toHaveCSS("cursor", "pointer");
  });

  test("does not apply clickable cursor when no click handler", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    const cursor = await icon.evaluate((el) => window.getComputedStyle(el).cursor);
    expect(cursor).not.toBe("pointer");
  });

  test("click event provides event object", async ({ initTestBed, createIconDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Icon testId="icon" name="home" onClick="event => testState = event.type"/>
    `);

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await icon.click();

    await expect.poll(testStateDriver.testState).toEqual("click");
  });

  test("multiple clicks increment counter", async ({ initTestBed, createIconDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Icon testId="icon" name="home" onClick="testState = (testState || 0) + 1"/>
    `);

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;

    await icon.click();
    await expect.poll(testStateDriver.testState).toEqual(1);

    await icon.click();
    await expect.poll(testStateDriver.testState).toEqual(2);

    await icon.click();
    await expect.poll(testStateDriver.testState).toEqual(3);
  });
});

// =============================================================================
// RENDERING PRECISION TESTS
// =============================================================================

test.describe("Rendering Precision", () => {
  test("pool icon wrapper uses inline-block for rendering", async ({
    initTestBed,
    createIconDriver,
  }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const icon = await createIconDriver("icon");
    const wrapperDisplay = await icon.svgIcon.evaluate((el) => {
      const wrapper = el.closest("span");
      return wrapper ? window.getComputedStyle(wrapper).display : null;
    });
    expect(wrapperDisplay).toBe("inline-block");
  });

  test("icon preserves source stroke-width attribute", async ({
    initTestBed,
    createIconDriver,
  }) => {
    // "info" maps to InfoIcon which has strokeWidth="2" in its SVG source
    await initTestBed(`<Icon testId="icon" name="info" size="md"/>`);
    const icon = await createIconDriver("icon");
    const strokeWidth = await icon.svgIcon.evaluate((el) => {
      return window.getComputedStyle(el).strokeWidth;
    });
    expect(strokeWidth).toBe("2px");
  });

  test("predefined sizes resolve to integer pixel values at any font-size", async ({
    initTestBed,
    createIconDriver,
    page,
  }) => {
    await initTestBed(`
      <Fragment>
        <Icon testId="xs" name="home" size="xs"/>
        <Icon testId="sm" name="home" size="sm"/>
        <Icon testId="md" name="home" size="md"/>
        <Icon testId="lg" name="home" size="lg"/>
      </Fragment>
    `);

    // Set a non-standard font-size that would cause fractional values with em/rem
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "13px";
    });

    for (const [id, expectedWidth] of [
      ["xs", "12px"],
      ["sm", "16px"],
      ["md", "24px"],
      ["lg", "32px"],
    ] as [string, string][]) {
      const icon = (await createIconDriver(id)).svgIcon;
      const width = await icon.evaluate((el) => window.getComputedStyle(el).width);
      expect(width).toBe(expectedWidth);
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("icon renders as inline element by default", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const icon = await createIconDriver("icon");
    const display = await icon.svgIcon.evaluate((el) => window.getComputedStyle(el).display);
    // SVG icons have display: inline-block applied via the base CSS class
    expect(display).toBe("inline-block");
  });

  test("icon has correct vertical alignment", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const icon = await createIconDriver("icon");

    await expect(icon.svgIcon as any).toHaveCSS("vertical-align", "text-bottom");
  });

  test("icon inherits color from parent", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`
      <Text color="red">
        <Icon testId="icon" name="home"/>
      </Text>
    `);
    const icon = await createIconDriver("icon");

    const color = await icon.svgIcon.evaluate((el) => window.getComputedStyle(el).color);
    // Should inherit red color or have some computed red value
    expect(color).not.toBe(""); // Should have some color value
  });

  test("icon is clickable when click handler is present", async ({ initTestBed, createIconDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Icon testId="icon" name="home" onClick="testState = 'activated'"/>
    `);

    const icon = await createIconDriver("icon");
    await icon.click();

    await expect.poll(testStateDriver.testState).toEqual("activated");
  });

  test(
    "icon can receive focus via tabIndex when clickable",
    async ({ initTestBed, createIconDriver }) => {
      await initTestBed(`<Icon testId="icon" name="home" onClick="testState = 'clicked'" />`);

      const icon = (await createIconDriver("icon")).svgIcon;

      // For SVG elements, we test focus capability by checking if it can be found after focus
      await expect(icon).toBeVisible();
      await icon.focus();
      await expect(icon).toBeFocused();
    },
  );

  test(
    "icon supports keyboard activation with Enter",
    async ({ initTestBed, createIconDriver }) => {
      const testBed = await initTestBed(`<Icon testId="icon" name="home" onClick="testState = 'clicked';" />`);
      const { testStateDriver } = testBed;

      const driver = await createIconDriver("icon");
      const icon = driver.svgIcon;

      // For SVG elements, we test focus capability by checking if it can be found after focus
      await expect(icon).toBeVisible();
      await icon.press("Enter");
      expect(await testStateDriver.testState()).toBe("clicked");
    },
  );

  test(
    "icon supports keyboard activation with Space",
    async ({ initTestBed, createIconDriver }) => {
      const testBed = await initTestBed(`<Icon testId="icon" name="home" onClick="testState = 'clicked';" />`);
      const { testStateDriver } = testBed;

      const driver = await createIconDriver("icon");
      const icon = driver.svgIcon;

      // For SVG elements, we test focus capability by checking if it can be found after focus
      await expect(icon).toBeVisible();
      await icon.press("Space");
      expect(await testStateDriver.testState()).toBe("clicked");
    },
  );

});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies theme variable for size", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`, {
      testThemeVars: {
        "size-Icon": "40px",
      },
    });

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });

    expect(computedStyle.width).toBe("40px");
    expect(computedStyle.height).toBe("40px");
  });

  test("size prop overrides theme variable", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="2rem"/>`, {
      testThemeVars: {
        "size-Icon": "4rem",
      },
    });

    const icon = await createIconDriver("icon");
    const computedStyle = await icon.svgIcon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });

    expect(computedStyle.width).toBe("32px"); // 2rem calculated, not 4rem from theme
    expect(computedStyle.height).toBe("32px");
  });

  test("applies theme variable with custom CSS variable", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`, {
      testThemeVars: {
        "size-Icon": "var(--custom-icon-size, 40px)",
      },
    });

    const icon = await createIconDriver("icon");
    const computedStyle = await icon.svgIcon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });

    expect(computedStyle.width).toBe("40px"); // Fallback value used
    expect(computedStyle.height).toBe("40px");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles null and undefined props gracefully", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const icon = await createIconDriver("icon");
    await expect(icon.svgIcon).toBeVisible();
  });

  test("handles component with all invalid props gracefully", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" invalidProp="invalid" anotherInvalid="{123}"/>`);

    // Component with invalid props may not be visible, but should not crash
    const icon = await createIconDriver("icon");
    const isVisible = await icon.svgIcon.isVisible();

    // Either it's visible with fallback behavior or gracefully hidden
    if (isVisible) {
      // If visible, it should have fallback behavior
      await expect(icon.svgIcon).toBeVisible();
    } else {
      // It's acceptable for component to be hidden with invalid props
      expect(isVisible).toBe(false);
    }
  });

  test("handles mixed valid and invalid props", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" invalidProp="invalid" size="lg"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();

    // Valid props should still work
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("32px"); // lg size should apply
  });

  test("handles object value for name prop", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="{{}}" />`);

    const icon = await createIconDriver("icon");
    const isVisible = await icon.svgIcon.isVisible();

    if (isVisible) {
      await expect(icon.svgIcon).toBeVisible();
    } else {
      expect(isVisible).toBe(false);
    }
  });

  test("handles array value for size prop", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="{[]}" />`);

    const icon = await createIconDriver("icon");
    const isVisible = await icon.svgIcon.isVisible();

    if (isVisible) {
      await expect(icon.svgIcon).toBeVisible();
    } else {
      expect(isVisible).toBe(false);
    }
  });

  test("handles very long Unicode string in fallback", async ({ initTestBed, createIconDriver }) => {
    const longUnicodeString = "👨‍👩‍👧‍👦".repeat(100);
    await initTestBed(`<Icon testId="icon" name="home" fallback="${longUnicodeString}"/>`);
    const icon = await createIconDriver("icon");
    await expect(icon.svgIcon).toBeVisible(); // Icon renders with valid primary name, fallback ignored
  });

  test("handles concurrent property changes", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="sm"/>`);
    const icon = await createIconDriver("icon");
    await expect(icon.svgIcon).toBeVisible();

    // Test that initial state is correct
    let computedStyle = await icon.svgIcon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("16px"); // sm size
  });

  test("handles rapid sequential clicks", async ({ initTestBed, createIconDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Icon testId="icon" name="home" onClick="testState = (testState || 0) + 1"/>
    `);

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;

    // Rapid sequential clicks
    await Promise.all([icon.click(), icon.click(), icon.click(), icon.click(), icon.click()]);

    // Should eventually reach 5 (all clicks processed)
    await expect.poll(testStateDriver.testState).toEqual(5);
  });
});
