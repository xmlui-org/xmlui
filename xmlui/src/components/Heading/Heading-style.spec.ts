import { expect, test } from "@playwright/test";

test("Wave A H1 primitive migration renders heading behavior and updates with state", async ({ page }) => {
  await page.goto("/?example=primitiveTextHeading");

  const heading = page.getByTestId("wave-a-heading");
  await expect(heading).toHaveJSProperty("tagName", "H1");
  await expect(heading).toHaveText(/Primitive text and heading/);
  await expect(heading).toHaveAttribute("data-xmlui-component", "H1");
  await expect(heading.locator("a")).toHaveAttribute("href", "#primitive-text-and-heading");

  await page.getByTestId("wave-a-toggle").click();
  await expect(heading).toHaveText(/Compact primitives/);
});
