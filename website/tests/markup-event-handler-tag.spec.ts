import { test, expect } from '@playwright/test';

// Tests the "Declare an event handler using the <event> tag" xmlui-pg example on the Markup
// guide page.
// Source: website/content/docs/pages/markup.md
//         name="Declare an event handler using the <event> tag"
//
// App under test:
//   <App var.count="{0}" >
//     <Button label="Click me! Click count = {count}">
//       <event name="click">{ count++ }</event>
//     </Button>
//   </App>
//
// The button label is reactive: it embeds the current count value. After the first
// click the label changes from "Click me! Click count = 0" to "Click me! Click count = 1".

test('markup-event-handler-tag', async ({ page }) => {
  test.setTimeout(15000);

  try {
    await page.goto('http://localhost:5173');

    await page.getByRole('link', { name: 'Docs' }).click();
    await page.getByRole('link', { name: 'Guides NavGroup' }).click();
    await page.getByRole('link', { name: 'Markup NavLink' }).click();

    // Confirm the example section is rendered (partial match avoids HTML entity issues with <>)
    await expect(page.getByText('Declare an event handler using the')).toBeVisible();
    // Wait for nested playground apps to initialise
    await page.waitForTimeout(3000);

    // Click the button whose label starts with "Click me! Click count = 0"
    await page.getByRole('button', { name: /Click me! Click count = 0/ }).click();

    // After one click the reactive label should update to show count = 1
    await expect(page.getByRole('button', { name: /Click me! Click count = 1/ })).toBeVisible();
  } finally {
  }
});
