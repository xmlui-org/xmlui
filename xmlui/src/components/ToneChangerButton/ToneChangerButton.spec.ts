import { expect, test } from "../../testing/fixtures";

test.describe("ToneChangerButton foundation", () => {
  test("toggles tone and reports the new tone", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tone="light">
        <ToneChangerButton testId="changer" onClick="next => tone = next" />
        <Text testId="result">{tone}</Text>
      </App>
    `);

    await page.getByTestId("changer").click();
    await expect(page.getByTestId("changer")).toHaveAttribute("data-tone", "dark");
    await expect(page.getByTestId("result")).toHaveText("dark");
  });
});

test.describe("ToneChangerButton old-suite transfer debt", () => {
  test("copy literal old icon and Button-composition tests", async () => {
    test.fixme(true, "Full ToneChangerButton suite is deferred to tone visual parity");
  });
});
