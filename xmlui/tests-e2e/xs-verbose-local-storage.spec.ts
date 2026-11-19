import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// xmlui:xsVerbose — PER-SESSION TRACING OPT-IN (#3969)
// =============================================================================
// `localStorage["xmlui:xsVerbose"] = "true"` turns tracing on for one browser
// session without editing config, even when the app's config says
// `xsVerbose: false`. It used to reach only the globals markup reads, not the
// `xmluiConfig` that tracing reads, so it did nothing.

// --- The test page is shared between tests: start and end with tracing off.
async function resetTracing(page: any) {
  await page.evaluate(() => {
    localStorage.removeItem("xmlui:xsVerbose");
    localStorage.removeItem("xmlui:xsVerboseLogMax");
    const w = window as any;
    delete w.__xsVerbose;
    delete w._xsLogs;
    delete w._xsLogMax;
  });
}

test.describe("xmlui:xsVerbose localStorage opt-in", () => {
  test.afterEach(async ({ page }) => {
    await resetTracing(page);
  });

  test("turns tracing on even when the config turns it off", async ({ page, initTestBed }) => {
    await page.goto("/");
    await resetTracing(page);
    await page.evaluate(() => localStorage.setItem("xmlui:xsVerbose", "true"));

    await initTestBed(`<Text testId="out" value="hello" />`, {
      xmluiConfig: { xsVerbose: false },
    });

    await expect(page.getByTestId("out")).toHaveText("hello");
    expect(await page.evaluate(() => (window as any).__xsVerbose)).toBe(true);
    expect(await page.evaluate(() => Array.isArray((window as any)._xsLogs))).toBe(true);
  });

  test("xmlui:xsVerboseLogMax sets the buffer size", async ({ page, initTestBed }) => {
    await page.goto("/");
    await resetTracing(page);
    await page.evaluate(() => {
      localStorage.setItem("xmlui:xsVerbose", "true");
      localStorage.setItem("xmlui:xsVerboseLogMax", "37");
    });

    await initTestBed(`<Text testId="out" value="hello" />`, {
      xmluiConfig: { xsVerbose: false },
    });

    await expect(page.getByTestId("out")).toHaveText("hello");
    expect(await page.evaluate(() => (window as any)._xsLogMax)).toBe(37);
  });
});
