import { expect, test } from "../src/testing/fixtures";

/**
 * Regression: when a DataSource URL changes (new react-query key), the `loaded`
 * state was not reset to `false` while the new fetch was in-flight.
 * As a result, UI guarded by `when="{ds.loaded}"` kept showing stale data
 * instead of hiding it during the new request.
 */
test("DataSource loaded state resets while a new fetch is in-flight", async ({
  page,
  initTestBed,
}) => {
  // Use page.route to control response timing directly.
  // The first request responds immediately; the second is held until we
  // have verified the intermediate UI state.
  let resolveSecondRequest: (() => void) | null = null;
  let requestCount = 0;

  await page.route(
    (url) => url.pathname === "/api/fruits",
    async (route) => {
      requestCount++;
      if (requestCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([1, 2, 3]),
        });
      } else {
        // Hold the second response until the test releases it.
        await new Promise<void>((resolve) => {
          resolveSecondRequest = resolve;
        });
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([1, 2, 3]),
        });
      }
    },
  );

  await initTestBed(`
    <Fragment var.nonce="{0}">
      <DataSource
        id="fruits"
        url="/api/fruits"
        queryParams="{{ nonce: nonce }}"
        when="{nonce > 0}"
      />
      <Button testId="run-btn" label="Run" onClick="nonce++" />
      <Text testId="result" when="{fruits.loaded}" value="{'Fruits: ' + fruits.value.length + ' found'}" />
    </Fragment>
  `);

  // First fetch (nonce=1): click and wait for the result.
  await page.getByTestId("run-btn").click();
  await expect(page.getByTestId("result")).toHaveText("Fruits: 3 found");

  // Arm a watcher for the second in-flight request before triggering it.
  const secondFetch = page.waitForRequest(
    (req) => new URL(req.url()).pathname === "/api/fruits",
    { timeout: 5000 },
  );

  // Second fetch (nonce=2): new query key → react-query sets isLoading=true.
  await page.getByTestId("run-btn").click();
  await secondFetch;

  // The route handler is now holding the second response. fruits.loaded must
  // be false so the Text element is absent from the DOM.
  // (Regression: before the fix, fruits.loaded stayed true and the text
  // remained visible.")
  await expect(page.getByTestId("result")).not.toBeVisible();

  // Release the second response and verify the text reappears.
  resolveSecondRequest!();
  await expect(page.getByTestId("result")).toHaveText("Fruits: 3 found", { timeout: 3000 });
});
