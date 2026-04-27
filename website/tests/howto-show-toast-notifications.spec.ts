// @source website/content/docs/pages/howto/show-toast-notifications-from-code.md
// @example Trigger different toast styles
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Trigger different toast styles';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/show-toast-notifications-from-code');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('Success button shows success toast', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Success' }).click();
    await expect(nestedApp.getByText('Changes saved successfully.').first()).toBeVisible();
  });

  test('Error button shows error toast', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Error' }).click();
    await expect(nestedApp.getByText('Failed to delete the record.').first()).toBeVisible();
  });

  test('Info button shows neutral toast', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Info' }).click();
    await expect(nestedApp.getByText('Sync started in the background.').first()).toBeVisible();
  });

  test('Loading button shows loading toast', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('button', { name: 'Loading', exact: true }).click();
    await expect(nestedApp.getByText('Uploading file...').first()).toBeVisible();
  });
});
