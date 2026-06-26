import { expect, test } from "@playwright/test";

test("i18n foundation example translates, formats, switches locale, and renders slots", async ({ page }) => {
  await page.goto("/?example=i18nFoundation");

  await expect(page.getByRole("heading", { name: "I18n Foundation" })).toBeVisible();
  await expect(page.getByTestId("welcome")).toHaveText("Welcome, Ada!");
  await expect(page.getByTestId("cart")).toHaveText("1 item in cart");
  await expect(page.getByTestId("status")).toHaveText("Ready to ship");
  await expect(page.getByTestId("terms")).toContainText("Read the terms of service before continuing.");
  await expect(page.getByTestId("fallback")).toHaveText("missing.key");

  await page.getByTestId("five-items").click();
  await expect(page.getByTestId("cart")).toHaveText("5 items in cart");

  await page.getByTestId("delayed").click();
  await expect(page.getByTestId("status")).toHaveText("Delayed by weather");

  await page.getByTestId("api-translate").click();
  await expect(page.getByTestId("api-message")).toHaveText("Translated by API for Ada");

  await page.getByTestId("locale-de").click();
  await expect(page.getByTestId("welcome")).toHaveText("Willkommen, Ada!");
  await expect(page.getByTestId("cart")).toHaveText("5 Artikel im Warenkorb");
  await expect(page.getByTestId("status")).toHaveText("Durch Wetter verzogert");
  await expect(page.getByTestId("terms")).toContainText("Lies die terms of service, bevor du fortfahrst.");
});
