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

  test("renders custom icons and switches back to light tone", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tone="light">
        <ToneSwitch testId="tone" iconLight="Light custom" iconDark="Dark custom" onDidChange="next => tone = next" />
        <Text testId="result">{tone}</Text>
      </App>
    `);

    await expect(page.getByRole("button", { name: "Light tone" })).toHaveText("Light custom");
    await expect(page.getByRole("button", { name: "Dark tone" })).toHaveText("Dark custom");
    await page.getByRole("button", { name: "Dark tone" }).click();
    await expect(page.getByTestId("tone")).toHaveAttribute("data-tone", "dark");

    await page.getByRole("button", { name: "Light tone" }).click();
    await expect(page.getByTestId("tone")).toHaveAttribute("data-tone", "light");
    await expect(page.getByTestId("result")).toHaveText("light");
  });
});
