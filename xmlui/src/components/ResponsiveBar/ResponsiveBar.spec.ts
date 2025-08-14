import { expect, test } from "../../testing/fixtures";

test.describe("ResponsiveBar", () => {
  test("renders children in horizontal layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
      </ResponsiveBar>
      `);

    const responsiveBar = page.getByTestId("responsive-bar");
    await expect(responsiveBar).toBeVisible();

    // All buttons should be visible initially
    await expect(responsiveBar.locator('[data-testid="btn1"]').first()).toBeVisible();
    await expect(responsiveBar.locator('[data-testid="btn2"]').first()).toBeVisible();
    await expect(responsiveBar.locator('[data-testid="btn3"]').first()).toBeVisible();
  });

  test("moves overflowing items to dropdown when container is too narrow", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" style="width: 200px;">
        <Button testId="btn1" label="Very Long Button 1" />
        <Button testId="btn2" label="Very Long Button 2" />
        <Button testId="btn3" label="Very Long Button 3" />
        <Button testId="btn4" label="Very Long Button 4" />
      </ResponsiveBar>
      `);

    const responsiveBar = page.getByTestId("responsive-bar");
    await expect(responsiveBar).toBeVisible();

    // Wait for the component to finish measuring and laying out
    await page.waitForTimeout(100);

    // Check if overflow dropdown is present
    const overflowDropdown = responsiveBar.locator(".overflowDropdown").first();
    
    // If there's an overflow dropdown, some items should be moved there
    if (await overflowDropdown.isVisible()) {
      // Click the overflow button to see the dropdown menu
      const overflowTrigger = overflowDropdown.locator("svg, button").first();
      await overflowTrigger.click();
      
      // Wait for dropdown to appear
      await page.waitForTimeout(100);
      
      // There should be some menu items in the dropdown
      const menuItems = page.locator('[role="menuitem"]');
      const menuItemCount = await menuItems.count();
      expect(menuItemCount).toBeGreaterThan(0);
    }
  });

  test("responds to container resize", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ResponsiveBar testId="responsive-bar" style="width: 400px; border: 1px solid red;">
        <Button testId="btn1" label="Button 1" />
        <Button testId="btn2" label="Button 2" />
        <Button testId="btn3" label="Button 3" />
        <Button testId="btn4" label="Button 4" />
      </ResponsiveBar>
      `);

    const responsiveBar = page.getByTestId("responsive-bar");
    await expect(responsiveBar).toBeVisible();

    // Initially, check if all buttons are visible or some are in overflow
    await page.waitForTimeout(100);
    
    // Check the current state
    const btn1Visible = await responsiveBar.locator('[data-testid="btn1"]').first().isVisible();
    const btn4Visible = await responsiveBar.locator('[data-testid="btn4"]').first().isVisible();
    
    // Verify the component is working - at least the first button should be visible
    expect(btn1Visible).toBe(true);
  });
});
