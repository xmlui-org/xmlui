import { test, expect } from '@playwright/test';

test('markup-complex-json-object', async ({ page }) => {
  test.setTimeout(15000);

  try {
    await page.goto('http://localhost:5173');

    await page.getByRole('link', { name: 'Docs' }).click();
    await page.getByRole('link', { name: 'Guides NavGroup' }).click();
    await page.getByRole('link', { name: 'Markup NavLink' }).click();

    await expect(page.getByText('A complex JSON object', { exact: true })).toBeVisible();
    // Wait for the nested apps to load and render their content
    await page.waitForTimeout(3000);

    await page.locator('input[type="text"]').fill("Liverpool");
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('textarea')).toContainText('Liverpool');
  } finally {
  }
});