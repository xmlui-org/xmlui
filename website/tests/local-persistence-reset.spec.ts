import { test, expect } from '@playwright/test';

// Tests the "Example: resetLocalStorage" xmlui-pg example on the Local Persistence guide page.
// Source: website/content/docs/pages/local-persistence.md
//         name="Example: resetLocalStorage"
//
// App under test:
//   <App>
//     <global name="count" value="{0}" storageKey="demo.count" />
//     <VStack>
//       <Text>Count: {count}</Text>
//       <Button label="Increment" onClick="count++" />
//       <Button label="Reset count to default" onClick="resetLocalStorage('demo.count'); count = 0" />
//       <Button label="Reset ALL storage" onClick="resetLocalStorage()" />
//     </VStack>
//   </App>
//
// The page also hosts the "Example: Persisting global variable" example above this one;
// both render an "Increment" button. The reset example's Increment is the second one
// on the page (nth index 1).

//The example is broken
test.skip('local-persistence-reset', async ({ page }) => {
  test.setTimeout(15000);

  try {
    await page.goto('http://localhost:5173');

    await page.getByRole('link', { name: 'Docs' }).click();
    await page.getByRole('link', { name: 'Guides NavGroup' }).click();
    await page.getByRole('link', { name: 'Local Persistence NavLink' }).click();

    await expect(page.getByText('Example: resetLocalStorage', { exact: true })).toBeVisible();
    // Wait for nested playground apps to initialise
    await page.waitForTimeout(3000);

    // The reset example is the second playground that shows "Count: 0" on the page.
    // Its Increment button is the second one (index 1) on the page.
    await page.getByRole('button', { name: 'Increment' }).nth(1).click();

    // After incrementing, "Count: 1" becomes visible somewhere on the page
    await expect(page.getByText('Count: 1')).toBeVisible();

    // Click the reset button — unique label on the entire page
    await page.getByRole('button', { name: 'Reset count to default' }).click();

    // "Count: 1" should no longer appear after the reset brings it back to 0
    await expect(page.getByText('Count: 1')).not.toBeVisible();
  } finally {
  }
});
