import { expect, test } from "@playwright/test";

test("inspector foundation example opens, captures debug events, and toggles inspect mode", async ({ page }) => {
  await page.goto("/?example=inspectorFoundation");

  await expect(page.getByRole("heading", { name: "Inspector Foundation" })).toBeVisible();
  await expect(page.getByTestId("inspect-mode-button")).toHaveAttribute("data-inspect-mode", "off");

  await page.getByTestId("inspect-mode-button").click();
  await expect(page.getByTestId("inspect-mode-button")).toHaveAttribute("data-inspect-mode", "on");

  await page.getByTestId("debug-watch-button").click();
  await expect(page.getByTestId("inspect-count")).toHaveText("Count: 1");

  await page.getByTestId("open-inspector-button").click();
  await expect(page.getByRole("dialog", { name: "XMLUI Inspector" })).toBeVisible();
  await expect(page.getByTestId("InspectorEvents")).toContainText("watch count = 0");
  await expect(page.getByTestId("InspectorFrame")).toHaveAttribute("src", "/xmlui/xs-diff.html");

  await page.getByTestId("InspectorDialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog", { name: "XMLUI Inspector" })).toHaveCount(0);
});
