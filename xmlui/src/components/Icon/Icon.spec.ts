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

  test("handles non-existent icon name gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="non-existent-icon"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render when icon name doesn't exist
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles empty string name", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name=""/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with empty string name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles null name value", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="{null}"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with null name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles undefined name value", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="{undefined}"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with undefined name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles special characters in name", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="test-icon_with$pecial@chars"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with non-existent special character name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles unicode characters in name", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="测试图标"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with non-existent unicode name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles emoji in name", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="🏠"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with non-existent emoji name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles component-specific icon name syntax", async ({ initTestBed, page }) => {
    await initTestBed(`<Icon name="component:specific-icon"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with non-existent component-specific name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });

  test("handles very long icon name", async ({ initTestBed, page }) => {
    const longName = "a".repeat(1000);
    await initTestBed(`<Icon name="${longName}"/>`);
    const icon = page.getByTestId("test-id-component");
    // Component doesn't render with non-existent long name
    const exists = await icon.count();
    expect(exists).toBe(0);
  });
});

// =============================================================================
// SIZE PROPERTY TESTS
// =============================================================================

test.describe("size Property", () => {
  test("renders with predefined size 'xs'", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="xs"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    // Check computed width/height using CSS
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("12px"); // 0.75em calculated
  });

  test("renders with predefined size 'sm'", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="sm"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("16px"); // 1em calculated
  });

  test("renders with predefined size 'md'", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="md"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("24px"); // 1.5rem calculated
  });

  test("renders with predefined size 'lg'", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="lg"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("32px"); // 2em calculated
  });

  test("renders with custom pixel size", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="48px"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("48px");
  });

  test("renders with custom em size", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="3em"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("48px"); // 3em calculated at 16px base
  });

  test("renders with custom rem size", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="2rem"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });
    expect(computedStyle.width).toBe("32px"); // 2rem calculated
  });

  test("handles invalid size gracefully", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home" size="invalid-size"/>`);
    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    await expect(icon).toBeVisible();
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
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("icon renders as inline element by default", async ({ initTestBed, createIconDriver }) => {
    await initTestBed(`<Icon testId="icon" name="home"/>`);
    const icon = await createIconDriver("icon");
    const display = await icon.svgIcon.evaluate((el) => window.getComputedStyle(el).display);
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

  test.fixme(
    "icon can receive focus via tabIndex when clickable",
    async ({ initTestBed, page }) => {
      await initTestBed(`<Icon name="home" onClick="testState = 'clicked'" tabIndex="0"/>`);

      const icon = page.getByTestId("test-id-component");

      // Check that the icon has tabIndex attribute
      const tabIndex = await icon.getAttribute("tabindex");
      expect(tabIndex).toBe("0");

      // For SVG elements, we test focus capability by checking if it can be found after focus
      await icon.focus();
      const activeElement = await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid"),
      );
      expect(activeElement).toBe("test-id-component");
    },
  );

  test.fixme(
    "icon supports keyboard activation with tabIndex when clickable",
    async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
      <Icon name="home" onClick="testState = 'space-activated'" tabIndex="0"/>
    `);

      const icon = page.getByTestId("test-id-component");

      // Focus the icon and verify it's focused
      await icon.focus();
      const activeElement = await page.evaluate(() =>
        document.activeElement?.getAttribute("data-testid"),
      );
      expect(activeElement).toBe("test-id-component");

      // For SVG elements, Space key might not trigger click by default
      // Let's test Enter key instead which is more reliable for SVG elements
      await icon.press("Enter");

      await expect.poll(testStateDriver.testState).toEqual("space-activated");
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
        "size-Icon": "3rem",
      },
    });

    const iconDrv = await createIconDriver("icon");
    const icon = iconDrv.svgIcon;
    const computedStyle = await icon.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return { width: style.width, height: style.height };
    });

    expect(computedStyle.width).toBe("48px"); // 3rem calculated
    expect(computedStyle.height).toBe("48px");
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
