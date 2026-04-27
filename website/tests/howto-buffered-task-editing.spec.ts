// @source website/content/docs/pages/howto/buffer-a-reactive-edit.md
// @example Buffered task editing
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Buffered task editing';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/buffer-a-reactive-edit');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('focus then blur writes PUT to the log', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.locator('input[type="text"]').first().click();
    await nestedApp.getByRole('heading', { name: 'Todo list' }).click();
    await expect(nestedApp.locator('textarea')).toContainText('PUT');
  });

  test('editing text commits updated value on blur', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.locator('input[type="text"]').first().click();
    await nestedApp.locator('input[type="text"]').first().fill('Merge feature branch');
    await nestedApp.getByRole('heading', { name: 'Todo list' }).click();
    await expect(nestedApp.locator('textarea')).toContainText('Merge feature branch');
  });

  test('clearing a field does not write a PUT entry', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.locator('input[type="text"]').first().click();
    await nestedApp.locator('input[type="text"]').first().fill('');
    await nestedApp.getByRole('heading', { name: 'Todo list' }).click();
    await expect(nestedApp.locator('textarea')).not.toContainText('PUT');
  });

  test('Clear button empties the log', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.locator('input[type="text"]').first().click();
    await nestedApp.getByRole('heading', { name: 'Todo list' }).click();
    await expect(nestedApp.locator('textarea')).toContainText('PUT');
    await nestedApp.getByRole('button', { name: 'Clear' }).click();
    await expect(nestedApp.locator('textarea')).toBeEmpty();
  });
});
