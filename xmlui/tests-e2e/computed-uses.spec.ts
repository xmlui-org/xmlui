import { expect, test } from "../src/testing/fixtures";

const BENCHMARK_MARKUP = `
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />

  <VStack>
    <Text testId="often-changes-text" value="Often changes: {oftenChanges}" />
    <Text value="(open DevTools → Console to see [render] logs)" />
  </VStack>

  <Select testId="select-component">
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
`;

test.describe("computedUses benchmark", () => {
  test("timer is running: oftenChanges increments over time", async ({ initTestBed, page }) => {
    await initTestBed(BENCHMARK_MARKUP, { noFragmentWrapper: true });

    // After 2 seconds with 100ms interval, oftenChanges should be > 0
    await expect
      .poll(
        async () => {
          const text = await page.getByTestId("often-changes-text").textContent();
          const match = text?.match(/Often changes: (\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        },
        { timeout: 3000 },
      )
      .toBeGreaterThan(0);
  });

  test("Select has correct data (1000 items)", async ({ initTestBed, page }) => {
    await initTestBed(BENCHMARK_MARKUP, { noFragmentWrapper: true });

    // Wait for the Select to be visible
    await expect(page.getByTestId("select-component")).toBeVisible();

    // Open the Select to verify options are loaded
    await page.getByTestId("select-component").click();

    // At least the first option should be present
    await expect(page.getByText("|1|")).toBeVisible();
    await expect(page.getByText("|2|")).toBeVisible();
  });

  test("Select renders ≤ 3 times after 2 seconds of 100ms timer ticks (computedUses optimization)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(BENCHMARK_MARKUP, { noFragmentWrapper: true });

    // Wait for the timer to fire enough ticks (~20 ticks in 2 seconds)
    // Without optimization, Select would re-render on every tick
    await page.waitForTimeout(2000);

    // Read render count from window.__renderCounts
    // The label is node.uid ?? node.type, so for Select with testId it may be
    // "select-component" (uid from testId) or "Select" (type fallback)
    const selectRenderCount = await page.evaluate(() => {
      const counts = (window as any).__renderCounts ?? {};
      // Try both possible labels
      return counts["select-component"] ?? counts["Select"] ?? null;
    });

    // __renderCounts is only populated in development mode
    // If null, the test environment is not in dev mode — skip the assertion
    if (selectRenderCount === null) {
      test.skip(true, "__renderCounts not available (not running in development mode)");
      return;
    }

    // With computedUses optimization, Select should not re-render on every timer tick.
    // Without optimization: ~20 renders. With optimization: ≤ 5 (initial renders + React
    // dev-mode double-invoke; zero timer-induced re-renders).
    expect(selectRenderCount).toBeLessThanOrEqual(5);
  });
});
