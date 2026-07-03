import { expect, test } from "../../testing/fixtures";

test.describe("AppState foundation regressions", () => {
  test("AppState references drive boolean component props", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <AppState id="state" initialValue="{{ enhancedMode: false }}" />
      <Checkbox
        testId="toggle"
        initialValue="{state.value.enhancedMode}"
        onDidChange="v => state.update({ enhancedMode: v })" />
      <Button testId="options" enabled="{state.value.enhancedMode}">
        Set enhanced options
      </Button>
    `);

    await expect(page.getByTestId("options")).toBeDisabled();
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("options")).toBeEnabled();
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("options")).toBeDisabled();
  });
});
