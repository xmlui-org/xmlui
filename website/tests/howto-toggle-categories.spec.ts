// @source website/content/docs/pages/howto/toggle-multiple-items-with-shared-state.md
// @example Toggle categories to filter articles
import { test, expect, type Locator } from '@playwright/test';

const EXAMPLE_NAME = 'Toggle categories to filter articles';

test.describe(EXAMPLE_NAME, () => {
  let nestedApp: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/docs/howto/toggle-multiple-items-with-shared-state');
    await expect(page.getByText(EXAMPLE_NAME, { exact: true })).toBeVisible();
    await page.waitForTimeout(3000);
    nestedApp = page.locator(
      `xpath=//span[normalize-space()="${EXAMPLE_NAME}"]/ancestor::div[.//*[@data-xs-nested-app-host="true"]][1]//*[@data-xs-nested-app-host="true"]`
    );
  });

  test('initial state shows all 12 articles', async ({ page }) => {
    test.setTimeout(15000);
    await expect(nestedApp.getByText('12 of 12 shown')).toBeVisible();
  });

  test('unchecking Technology hides Technology articles and updates count', async ({ page }) => {
    test.setTimeout(15000);
    // Technology is the first category checkbox (index 0)
    await nestedApp.getByRole('checkbox').nth(0).click();
    await expect(nestedApp.getByText('8 of 12 shown')).toBeVisible();
    await expect(nestedApp.getByText('Understanding React Hooks')).not.toBeVisible();
  });

  test('re-checking Technology restores its articles', async ({ page }) => {
    test.setTimeout(15000);
    await nestedApp.getByRole('checkbox').nth(0).click();
    await expect(nestedApp.getByText('8 of 12 shown')).toBeVisible();
    await nestedApp.getByRole('checkbox').nth(0).click();
    await expect(nestedApp.getByText('12 of 12 shown')).toBeVisible();
    await expect(nestedApp.getByText('Understanding React Hooks')).toBeVisible();
  });

  test('unchecking two categories cumulates the filter', async ({ page }) => {
    test.setTimeout(15000);
    // Uncheck Technology (4 articles) and Outdoors (3 articles)
    await nestedApp.getByRole('checkbox').nth(0).click();
    await nestedApp.getByRole('checkbox').nth(1).click();
    await expect(nestedApp.getByText('5 of 12 shown')).toBeVisible();
  });
});
