import { expect, test } from "@playwright/test";

test("Wave A Text primitive migration renders old-visible text behavior", async ({ page }) => {
  await page.goto("/?example=primitiveTextHeading");

  await expect(page.getByTestId("wave-a-mode")).toHaveText("Mode: comfortable");
  await expect(page.getByTestId("wave-a-mode")).toHaveCSS("user-select", "text");
  await expect(page.getByTestId("wave-a-mode")).toHaveAttribute("data-xmlui-component", "Text");
  await expect(page.getByTestId("wave-a-strong")).toHaveJSProperty("tagName", "STRONG");
  await expect(page.getByTestId("wave-a-code")).toHaveJSProperty("tagName", "CODE");
  await expect(page.getByTestId("wave-a-clamped")).toHaveCSS("overflow", "hidden");
  await expect(page.getByTestId("wave-a-clamped")).toHaveCSS("text-overflow", "ellipsis");

  await page.getByTestId("wave-a-context").click({ button: "right" });
  await expect(page.getByTestId("wave-a-context")).toHaveText("Context menu: yes");

  await page.getByTestId("wave-a-toggle").click();
  await expect(page.getByTestId("wave-a-mode")).toHaveText("Mode: compact");
});
