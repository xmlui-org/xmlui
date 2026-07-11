import { expect, test, type Locator } from "@playwright/test";

async function expectHotToastCardStyle(toast: Locator) {
  const style = await toast.evaluate((element: HTMLElement) => {
    const card = element.parentElement;
    if (!card) {
      return null;
    }
    const computed = getComputedStyle(card);
    return {
      background: computed.backgroundColor,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      color: computed.color,
      display: computed.display,
      maxWidth: computed.maxWidth,
      padding: computed.padding,
    };
  });

  expect(style).toMatchObject({
    background: "rgb(255, 255, 255)",
    borderRadius: "8px",
    color: "rgb(54, 54, 54)",
    display: "flex",
    maxWidth: "350px",
    padding: "12px 16px",
  });
  expect(style?.boxShadow).toContain("rgba(0, 0, 0, 0.1) 0px 3px 10px 0px");
}

test("toast service renders notifications from compiled handlers and preserves data updates", async ({ page }) => {
  await page.goto("/?example=runtimeToast");

  await expect(page.getByRole("heading", { name: "Runtime toast service" })).toBeVisible();
  await expect(page.getByText("Count: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Save and toast" }).click();
  await expect(page.getByText("Count: 1", { exact: true })).toBeVisible();
  const successToast = page.getByRole("status").filter({ hasText: "Saved count 1" });
  await expect(successToast).toBeVisible();
  await expectHotToastCardStyle(successToast);

  await page.getByRole("button", { name: "Start loading toast" }).click();
  const loadingToast = page.getByRole("status").filter({ hasText: "Working on count 1" });
  await expect(loadingToast).toBeVisible();
  await expectHotToastCardStyle(loadingToast);

  await page.getByRole("button", { name: "Complete loading toast" }).click();
  const completedToast = page.getByRole("status").filter({ hasText: "Done with count 1" });
  await expect(completedToast).toBeVisible();
  await expectHotToastCardStyle(completedToast);
  await expect(page.getByRole("status").filter({ hasText: "Working on count 1" })).toHaveCount(0);
  await expect(page.locator("[aria-live='polite'][aria-label='Done with count 1']")).toBeAttached();

  await page.getByRole("button", { name: "Error toast" }).click();
  const errorToast = page.getByRole("status").filter({ hasText: "Failed count 1" });
  await expect(errorToast).toBeVisible();
  await expectHotToastCardStyle(errorToast);
  await expect(page.locator("[aria-live='assertive'][aria-label='Failed count 1']")).toBeAttached();

  await page.getByRole("button", { name: "Dismiss toasts" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
});
