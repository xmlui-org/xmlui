// @source website/content/docs/pages/howto/generate-a-qr-code-from-user-input.md
// @example Type a URL to generate a QR code
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Type a URL to generate a QR code';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/generate-a-qr-code-from-user-input');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('initial state shows default URL and character count', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('Characters: 17 / 2953')).toBeVisible();
  });

  test('Clear button empties the input and resets character count to zero', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Clear' }).click();
    await expect(nestedApp.getByText('Characters: 0 / 2953')).toBeVisible();
  });

  test('Copy link button restores the default URL', async ({ page }) => {
    test.setTimeout(15000);
    // Clear first, then restore
    await nestedApp.getByRole('button', { name: 'Clear' }).click();
    await expect(nestedApp.getByText('Characters: 0 / 2953')).toBeVisible();
    await nestedApp.getByRole('button', { name: 'Copy link' }).click();
    await expect(nestedApp.getByText('Characters: 17 / 2953')).toBeVisible();
  });

  test('typing updates the character count reactively', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Clear' }).click();
    await nestedApp.getByRole('textbox').fill('hello');
    await expect(nestedApp.getByText('Characters: 5 / 2953')).toBeVisible();
  });
});
