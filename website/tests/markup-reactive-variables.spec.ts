import { test, expect } from '@playwright/test';

// Tests the "Defining and using reactive variables" xmlui-pg example on the Markup guide page.
// Source: website/content/docs/pages/markup.md — name="Defining and using reactive variables"
//
// App under test:
//   <App var.count="{0}" var.countTimes3="{3 * count}" >
//     <Button label="Click to increment the count" onClick="count++" />
//     <Text>Click count = {count} (changes directly)</Text>
//     <Text>Click count * 3 = {countTimes3} (changes indirectly)</Text>
//   </App>

test('markup-reactive-variables', async ({ page }) => {
  test.setTimeout(15000);

  try {
    await page.goto('http://localhost:5173');

    await page.getByRole('link', { name: 'Docs' }).click();
    await page.getByRole('link', { name: 'Guides NavGroup' }).click();
    await page.getByRole('link', { name: 'Markup NavLink' }).click();

    await expect(page.getByText('Defining and using reactive variables', { exact: true })).toBeVisible();
    // Wait for nested playground apps to initialise
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Click to increment the count' }).click();

    await expect(page.getByText('Click count = 1 (changes directly)')).toBeVisible();
    await expect(page.getByText('Click count * 3 = 3 (changes indirectly)')).toBeVisible();
  } finally {
  }
});
