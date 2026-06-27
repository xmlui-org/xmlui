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

  test("uses custom labels while toggling in both directions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tone="light">
        <ToneChangerButton
          testId="changer"
          lightToDarkIcon="Go dark"
          darkToLightIcon="Go light"
          onClick="next => tone = next"
        />
        <Text testId="result">{tone}</Text>
      </App>
    `);

    await expect(page.getByTestId("changer")).toHaveText("Go dark");
    await page.getByTestId("changer").click();
    await expect(page.getByTestId("changer")).toHaveText("Go light");
    await expect(page.getByTestId("result")).toHaveText("dark");

    await page.getByTestId("changer").click();
    await expect(page.getByTestId("changer")).toHaveText("Go dark");
    await expect(page.getByTestId("result")).toHaveText("light");
  });
});
