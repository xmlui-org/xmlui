import { expect, test } from "../../testing/fixtures";

test.describe("ToneSwitch foundation", () => {
  test("switches tone and fires didChange", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tone="light">
        <ToneSwitch testId="tone" onDidChange="next => tone = next" />
        <Text testId="result">{tone}</Text>
      </App>
    `);

    await page.getByLabel("Dark tone").click();
    await expect(page.getByTestId("tone")).toHaveAttribute("data-tone", "dark");
    await expect(page.getByTestId("result")).toHaveText("dark");
  });
});

test.describe("ToneSwitch old-suite transfer debt", () => {
  test("copy literal old visual, icon, and theme-variable tests", async () => {
    test.fixme(true, "Full ToneSwitch suite is deferred to tone control visual parity");
  });
});
