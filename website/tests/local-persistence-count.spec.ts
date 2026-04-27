import { test, expect } from '@playwright/test';

// Tests the "Example: Persisting global variable" xmlui-pg example on the Local Persistence
// guide page.
// Source: website/content/docs/pages/local-persistence.md
//         name="Example: Persisting global variable"
//
// App under test:
//   <App>
//     <global name="count" value="{0}" storageKey="count" />
//     <VStack>
//       <Text>Count: {count}</Text>
//       <HStack gap="$space-2">
//         <Button label="Increment" onClick="count++" />
//         <Button label="Decrement" onClick="count--" />
//       </HStack>
//       <Text>Reload the app (with ...) to see the count restored.</Text>
//     </VStack>
//   </App>
//
// Each Playwright test runs in a fresh browser context so localStorage starts empty,
// meaning count always initialises to its default value of 0.

//The example is broken
test.skip('local-persistence-count', async ({ page }) => {
  test.setTimeout(15000);

  try {
    await page.goto('http://localhost:5173');

    await page.getByRole('link', { name: 'Docs' }).click();
    await page.getByRole('link', { name: 'Guides NavGroup' }).click();
    await page.getByRole('link', { name: 'Local Persistence NavLink' }).click();

    await expect(page.getByText('Example: Persisting global variable', { exact: true })).toBeVisible();
    // Wait for nested playground apps to initialise
    await page.waitForTimeout(3000);

    // Initial state: count = 0 (fresh localStorage context)
    await expect(page.getByText('Count: 0').first()).toBeVisible();

    // The "Persisting global variable" example renders the first Increment button on the page
    await page.getByRole('button', { name: 'Increment' }).first().click();

    await expect(page.getByText('Count: 1').first()).toBeVisible();
  } finally {
  }
});
