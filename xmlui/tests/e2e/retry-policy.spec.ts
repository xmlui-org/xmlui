import { expect, test } from "@playwright/test";

test("retry policy foundation example retries a flaky DataSource", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/retry-policy-foundation", async (route) => {
    requests++;
    await route.fulfill({
      status: requests < 3 ? 500 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        requests < 3 ? { error: "temporary" } : { message: "loaded through retry", attempts: requests },
      ),
    });
  });

  await page.goto("/?example=retryPolicyFoundation");

  await expect(page.getByRole("heading", { name: "RetryPolicy Foundation" })).toBeVisible();
  await expect(page.getByTestId("retry-message")).toHaveText("loaded through retry");
  await expect(page.getByTestId("retry-attempts")).toHaveText("Attempts: 3");
  expect(requests).toBe(3);
});
