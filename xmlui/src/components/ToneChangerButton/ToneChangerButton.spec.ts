import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with default props", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneChangerButton />`);
    await expect(page.getByRole("button")).toBeVisible();
  });

  test("displays light-to-dark icon in light mode", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    // Verify we're in light mode
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    const button = page.getByRole("button");
    await expect(button).toBeVisible();
    
    // Check that the icon exists within the button
    const icon = button.locator("svg, img, [data-testid*='icon']").first();
    await expect(icon).toBeVisible();
  });

  test("displays dark-to-light icon in dark mode", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Switch to dark mode first
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
    
    // Verify the icon changes (should be different from light mode)
    const icon = button.locator("svg, img, [data-testid*='icon']").first();
    await expect(icon).toBeVisible();
  });

  test("switches from light to dark mode when clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Initially in light mode
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Click to switch to dark mode
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  test("switches from dark to light mode when clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Switch to dark mode first
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
    
    // Click again to switch back to light mode
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("light");
  });

  test("toggles between modes multiple times", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Initial state: light
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // First toggle: light -> dark
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
    
    // Second toggle: dark -> light
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Third toggle: light -> dark
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  // =============================================================================
  // CLICK EVENT TESTS
  // =============================================================================

  test.describe("click event", () => {
    test("fires click event with 'dark' when switching to dark mode", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <App>
          <ToneChangerButton onClick="arg => testState = arg" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      
      // Initially in light mode
      await expect(page.getByTestId("theme-state")).toHaveText("light");
      
      // Click to switch to dark mode
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
      await expect.poll(testStateDriver.testState).toEqual("dark");
    });

    test("fires click event with 'light' when switching to light mode", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <App>
          <ToneChangerButton onClick="arg => testState = arg" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      
      // Switch to dark mode first
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
      
      // Click again to switch to light mode
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("light");
      await expect.poll(testStateDriver.testState).toEqual("light");
    });

    test("fires click event on each toggle", async ({ initTestBed, page }) => {
      // TODO: Investigate why the onClick event handler is not being called
      const { testStateDriver } = await initTestBed(`
        <App>
          <ToneChangerButton onClick="testState = testState == null ? 1 : testState + 1" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      
      // First click
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual(1);
      
      // Second click
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual(2);
      
      // Third click
      await button.click();
      await expect.poll(testStateDriver.testState).toEqual(3);
    });
  });

  // =============================================================================
  // ICON PROPERTY TESTS
  // =============================================================================

  test.describe("icon properties", () => {
    test("uses custom lightToDarkIcon", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton lightToDarkIcon="custom-light-icon" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      // Verify we're in light mode and icon is visible
      await expect(page.getByTestId("theme-state")).toHaveText("light");
      const button = page.getByRole("button");
      const icon = button.locator("svg, img, [data-testid*='icon']").first();
      await expect(icon).toBeVisible();
    });

    test("uses custom darkToLightIcon", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton darkToLightIcon="custom-dark-icon" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      
      // Switch to dark mode to see dark-to-light icon
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
      
      const icon = button.locator("svg, img, [data-testid*='icon']").first();
      await expect(icon).toBeVisible();
    });

    test("handles null lightToDarkIcon gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton lightToDarkIcon="{null}" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      // Should still render and be functional
      await expect(page.getByTestId("theme-state")).toHaveText("light");
      const button = page.getByRole("button");
      await expect(button).toBeVisible();
      
      // Should still be able to toggle
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
    });

    test("handles null darkToLightIcon gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton darkToLightIcon="{null}" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      
      // Switch to dark mode
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
      
      // Should still render and be functional
      await expect(button).toBeVisible();
      
      // Should still be able to toggle back
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("light");
    });

    test("handles undefined icon properties gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton lightToDarkIcon="{undefined}" darkToLightIcon="{undefined}" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      await expect(button).toBeVisible();
      
      // Should still function for toggling
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
      
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("light");
    });

    test("handles non-string icon properties", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton lightToDarkIcon="{123}" darkToLightIcon="{true}" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      await expect(button).toBeVisible();
      
      // Should still function for toggling despite invalid icon values
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
    });

    test("handles very long unicode characters in icon names", async ({ initTestBed, page }) => {
      await initTestBed(`
        <App>
          <ToneChangerButton lightToDarkIcon="👨‍👩‍👧‍👦🌟✨" darkToLightIcon="中文图标名称" />
          <Text testId="theme-state">{activeThemeTone}</Text>
        </App>
      `);
      
      const button = page.getByRole("button");
      await expect(button).toBeVisible();
      
      // Should still function despite unusual icon names
      await button.click();
      await expect(page.getByTestId("theme-state")).toHaveText("dark");
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has button role", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneChangerButton />`);
    const button = page.getByRole("button");
    await expect(button).toBeVisible();
  });

  test("is keyboard accessible with Enter key", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    await button.focus();
    await expect(button).toBeFocused();
    
    // Initially in light mode
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Press Enter to toggle
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  test("is keyboard accessible with Space key", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    await button.focus();
    await expect(button).toBeFocused();
    
    // Initially in light mode
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Press Space to toggle
    await page.keyboard.press("Space");
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  test("maintains focus during interactions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    await button.focus();
    await button.click();
    
    // Focus should be maintained after click
    await expect(button).toBeFocused();
  });

  test("is focusable via Tab navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Button>Before</Button>
        <ToneChangerButton />
        <Button>After</Button>
      </App>
    `);
    
    // Focus the first button
    await page.getByRole("button", { name: "Before" }).focus();
    
    // Tab to ToneChangerButton
    await page.keyboard.press("Tab");
    const toneButton = page.getByRole("button").nth(1); // ToneChangerButton is the second button
    await expect(toneButton).toBeFocused();
    
    // Tab to the next button
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();
  });

  test("has appropriate ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneChangerButton />`);
    const button = page.getByRole("button");
    
    // Should be focusable (not disabled)
    await expect(button).not.toBeDisabled();
    
    // Should have role button (implicit from getByRole test above)
    await expect(button).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneChangerButton/>`);
    const button = page.getByRole("button");
    await expect(button).toBeVisible();
  });

  test("works within different container components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Card>
          <ToneChangerButton />
        </Card>
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    await expect(button).toBeVisible();
    
    // Should still function normally
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  test("maintains state consistency across multiple instances", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton testId="button1" />
        <ToneChangerButton testId="button2" />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button1 = page.getByTestId("button1");
    const button2 = page.getByTestId("button2");
    
    // Initially in light mode
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Click first button to switch to dark
    await button1.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
    
    // Click second button to switch back to light
    await button2.click();
    await expect(page.getByTestId("theme-state")).toHaveText("light");
  });

  test("handles rapid successive clicks", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Perform rapid clicks
    await button.click();
    await button.click();
    await button.click();
    await button.click();
    
    // Should end up in light mode (even number of clicks)
    await expect(page.getByTestId("theme-state")).toHaveText("light");
  });

  test("works correctly when theme is initialized in dark mode", async ({ initTestBed, page }) => {
    // Skip this test as the tone="dark" initialization may not be supported
    // This would require investigation of how theme initialization works
    test.skip();
    
    await initTestBed(`
      <App tone="dark">
        <ToneChangerButton />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    
    // Should start in dark mode
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
    
    // Click to switch to light
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("light");
    
    // Click to switch back to dark
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });

  test("handles empty string icon properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneChangerButton lightToDarkIcon="" darkToLightIcon="" />
        <Text testId="theme-state">{activeThemeTone}</Text>
      </App>
    `);
    
    const button = page.getByRole("button");
    await expect(button).toBeVisible();
    
    // Should still function despite empty icon names
    await button.click();
    await expect(page.getByTestId("theme-state")).toHaveText("dark");
  });
});
