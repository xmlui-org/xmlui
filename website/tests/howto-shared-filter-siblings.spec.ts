// @source website/content/docs/pages/howto/communicate-between-sibling-components.md
// @example Shared filter state between siblings
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Shared filter state between siblings';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/communicate-between-sibling-components');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('initial state shows all articles', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('Build a search bar — UI')).toBeVisible();
    await expect(nestedApp.getByText('Paginate API results — Data')).toBeVisible();
    await expect(nestedApp.getByText('Create a responsive grid — Layout')).toBeVisible();
  });

  test('selecting UI filter shows only UI articles', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('radio', { name: 'UI' }).click();
    await expect(nestedApp.getByText('Build a search bar — UI')).toBeVisible();
    await expect(nestedApp.getByText('Show a confirmation dialog — UI')).toBeVisible();
    await expect(nestedApp.getByText('Paginate API results — Data')).not.toBeVisible();
    await expect(nestedApp.getByText('Create a responsive grid — Layout')).not.toBeVisible();
  });

  test('selecting Data filter shows only Data articles', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('radio', { name: 'Data' }).click();
    await expect(nestedApp.getByText('Paginate API results — Data')).toBeVisible();
    await expect(nestedApp.getByText('Cache API responses — Data')).toBeVisible();
    await expect(nestedApp.getByText('Build a search bar — UI')).not.toBeVisible();
  });

  test('switching back to All restores all articles', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('radio', { name: 'UI' }).click();
    await expect(nestedApp.getByText('Paginate API results — Data')).not.toBeVisible();
    await nestedApp.getByRole('radio', { name: 'All' }).click();
    await expect(nestedApp.getByText('Paginate API results — Data')).toBeVisible();
    await expect(nestedApp.getByText('Build a search bar — UI')).toBeVisible();
  });
});
