import { test, expect } from "./fixtures";
import { initApp } from "./component-test-helpers";

const RESPONSIVE_MENU_CODE = `
<div style="width: 400px; max-width: 400px; overflow: hidden; border: 1px solid red;">
  <ResponsiveMenu>
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
    <ResponsiveMenuItem label="File" />
    <ResponsiveMenuItem label="Edit" />
    <ResponsiveMenuItem label="View" />
  </ResponsiveMenu>
</div>
`;

test("responsive menu shows overflow dropdown when items don't fit", async ({ page }) => {
  await initApp(page, { entryPoint: RESPONSIVE_MENU_CODE });
  
  // Wait for the component to render and calculate
  await page.waitForTimeout(500);
  
  // Check for overflow dropdown button
  const overflowButton = page.locator('[aria-label="More"]');
  await expect(overflowButton).toBeVisible();
  
  // Click the overflow button
  await overflowButton.click();
  
  // Check that the dropdown menu appears
  const dropdownMenu = page.locator('[role="menu"]');
  await expect(dropdownMenu).toBeVisible();
});

test("responsive menu debug console output", async ({ page }) => {
  // Capture console logs
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'log') {
      logs.push(msg.text());
    }
  });
  
  await initApp(page, { entryPoint: RESPONSIVE_MENU_CODE });
  
  // Wait for the component to render and calculate
  await page.waitForTimeout(1000);
  
  // Output the captured logs
  console.log('Captured console logs:');
  logs.forEach(log => console.log(log));
  
  // Expect that we captured some logs
  expect(logs.length).toBeGreaterThan(0);
});
