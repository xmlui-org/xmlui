import type { Page } from "@playwright/test";

import { expect, test } from "../../testing/fixtures";

function toneSwitchSurface(page: Page) {
  return page.getByRole("switch").locator("xpath=ancestor::label[1]");
}

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
    await toneSwitchSurface(page).click();
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
    await toneSwitchSurface(page).click();
    await expect(page.getByText("dark")).toBeVisible();
    await expect(toggle).toBeChecked();
    await toneSwitchSurface(page).click();
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
    await toneSwitchSurface(page).click();
    await expect(toggle).toBeFocused();
  });

  test("has appropriate aria-checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<ToneSwitch />`);
    const toggle = page.getByRole("switch");
    
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    
    await toneSwitchSurface(page).click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
