import { expect, test } from "../../testing/fixtures";

test.describe("Lifecycle foundation", () => {
  test("fires mount on initial render", async ({ initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Lifecycle onMount="testState = 'mounted'" />
    `);

    await expect.poll(testStateDriver.testState).toEqual("mounted");
  });

  test("fires unmount and mount when keyValue changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.key="{1}" var.log="">
        <Button testId="change" onClick="key++">Change</Button>
        <Lifecycle
          keyValue="{key}"
          onMount="log = log + 'M' + key"
          onUnmount="log = log + 'U' + key" />
        <Text testId="log">{log}</Text>
      </App>
    `);

    await expect(page.getByTestId("log")).toHaveText("M1");
    await page.getByTestId("change").click();
    await expect(page.getByTestId("log")).toHaveText("M1U2M2");
  });

  test("routes handler errors to onError once script throw/error expressions are fully supported", async () => {
    test.fixme(true, "script throw/error expression support is deferred");
  });
});

test.describe("Lifecycle old-suite transfer debt", () => {
  test("copy literal old Lifecycle tests when the complete lifecycle service surface is migrated", async () => {
    test.fixme(true, "old Lifecycle suite transfer is deferred");
  });
});
