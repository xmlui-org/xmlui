import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-gauge" };

// =============================================================================
// Gauge — rendering
// =============================================================================

test.describe("Gauge", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(`<Gauge testId="gauge" />`, EXT);
    await expect(page.getByTestId("gauge")).toBeAttached();
  });

  test("renders with an explicit initial value", async ({ initTestBed, page }) => {
    await initTestBed(`<Gauge testId="gauge" initialValue="42" />`, EXT);
    await expect(page.getByTestId("gauge")).toBeAttached();
  });

  test("setValue API updates the gauge value", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Gauge id="gauge" testId="gauge" />
        <Button testId="btn" label="Set" onClick="gauge.setValue(75)" />
        <Text testId="result" value="{gauge.value}" />
      </VStack>`,
      EXT,
    );
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("result")).toHaveText("75");
  });

  test("value getter returns the current value", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Gauge id="gauge" testId="gauge" initialValue="30" />
        <Text testId="result" value="{gauge.value}" />
      </VStack>`,
      EXT,
    );
    await expect(page.getByTestId("result")).toHaveText("30");
  });

  test("fires didChange event when value changes", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Gauge id="gauge" testId="gauge" onDidChange="changed = 'yes'" />
        <Button testId="btn" label="Set" onClick="gauge.setValue(50)" />
        <Text testId="result" value="{changed}" />
      </VStack>`,
      { ...EXT, mainXs: `var changed = 'no';` },
    );
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("result")).toHaveText("yes");
  });

  test("respects minValue and maxValue bounds", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack>
        <Gauge id="gauge" minValue="10" maxValue="50" initialValue="200" testId="gauge" />
        <Text testId="result" value="{gauge.value}" />
      </VStack>`,
      EXT,
    );
    // value should be clamped to maxValue=50
    await expect(page.getByTestId("result")).toHaveText("50");
  });
});
