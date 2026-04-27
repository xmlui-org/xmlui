// @source website/content/docs/pages/howto/open-a-confirmation-before-delete.md
// @example Confirm before deleting a task
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Confirm before deleting a task';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/open-a-confirmation-before-delete');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('confirming delete removes the task', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('Write proposal')).toBeVisible();
    // Click the trash icon next to "Write proposal"
    await nestedApp.getByText('Write proposal').locator('..').getByRole('button').click();
    // Confirm the dialog
    await nestedApp.getByRole('button', { name: 'Delete' }).click();
    await expect(nestedApp.getByText('Write proposal')).not.toBeVisible();
  });

  test('cancelling delete keeps the task', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('Write proposal')).toBeVisible();
    await nestedApp.getByText('Write proposal').locator('..').getByRole('button').click();
    // Cancel the dialog
    await nestedApp.getByRole('button', { name: 'Keep' }).click();
    await expect(nestedApp.getByText('Write proposal')).toBeVisible();
  });

  test('task count decreases after confirmed delete', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('Task list (3)')).toBeVisible();
    await nestedApp.getByText('Write proposal').locator('..').getByRole('button').click();
    await nestedApp.getByRole('button', { name: 'Delete' }).click();
    await expect(nestedApp.getByText('Task list (2)')).toBeVisible();
  });
});
