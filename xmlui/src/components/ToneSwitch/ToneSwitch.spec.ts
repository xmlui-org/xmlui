import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders in light mode by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneSwitch />
        <Text>{activeThemeTone}</Text>
      </App>
    `);
    const toggle = page.getByRole("switch");
    await expect(toggle).toBeVisible();
    await expect(page.getByText("light")).toBeVisible();
  });

  test("toggles to dark mode when clicked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneSwitch />
        <Text>{activeThemeTone}</Text>
      </App>
    `);
    const toggle = page.getByRole("switch");
    await expect(toggle).toBeVisible();
    await toggle.click({ force: true });
    await expect(page.getByText("dark")).toBeVisible();
    await expect(toggle).toBeChecked();
  });

  test("toggles back to light mode when clicked again", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <ToneSwitch />
        <Text>{activeThemeTone}</Text>
      </App>
    `);
    const toggle = page.getByRole("switch");
    await expect(toggle).toBeVisible();
    await toggle.click({ force: true });
    await expect(page.getByText("dark")).toBeVisible();
    await expect(toggle).toBeChecked();
    await toggle.click({ force: true });
    await expect(page.getByText("light")).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has switch role", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneSwitch />`);
    const toggle = page.getByRole("switch");
    await expect(toggle).toBeVisible();
  });

  test("is keyboard accessible with Space key", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneSwitch />`);
    const toggle = page.getByRole("switch");
    
    await toggle.focus();
    await expect(toggle).toBeFocused();
    
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(toggle).toBeChecked();
  });

  test("maintains focus during interactions", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneSwitch />`);
    const toggle = page.getByRole("switch");
    
    await toggle.focus();
    await toggle.click({ force: true });
    await expect(toggle).toBeFocused();
  });

  test("has appropriate aria-checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneSwitch />`);
    const toggle = page.getByRole("switch");
    
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    
    await toggle.click({ force: true });
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
