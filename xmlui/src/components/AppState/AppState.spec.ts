import { expect, test } from "../../testing/fixtures";

test.describe("AppState foundation", () => {
  test("initializes and updates shared default bucket state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="stateOne" initialValue="{{ counter: 0 }}" />
      <AppState id="stateTwo" />
      <Button testId="inc" onClick="stateOne.update({ counter: stateOne.value.counter + 1 })">Increment</Button>
      <Text testId="one">{stateOne.value.counter}</Text>
      <Text testId="two">{stateTwo.value.counter}</Text>
    `);

    await expect(page.getByTestId("one")).toHaveText("0");
    await expect(page.getByTestId("two")).toHaveText("0");
    await page.getByTestId("inc").click();
    await expect(page.getByTestId("one")).toHaveText("1");
    await expect(page.getByTestId("two")).toHaveText("1");
  });

  test("keeps separate bucket values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="left" bucket="left" initialValue="{{ counter: 0 }}" />
      <AppState id="right" bucket="right" initialValue="{{ counter: 10 }}" />
      <Button testId="inc" onClick="left.update({ counter: left.value.counter + 1 })">Increment</Button>
      <Text testId="left">{left.value.counter}</Text>
      <Text testId="right">{right.value.counter}</Text>
    `);

    await page.getByTestId("inc").click();
    await expect(page.getByTestId("left")).toHaveText("1");
    await expect(page.getByTestId("right")).toHaveText("10");
  });

  test("list helpers update and query list properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AppState id="selection" initialValue="{{ ids: [1] }}" />
      <Button testId="append" onClick="selection.appendToList('ids', 2)">Append</Button>
      <Button testId="remove" onClick="selection.removeFromList('ids', 1)">Remove</Button>
      <Text testId="value">{selection.value.ids.join('|')}</Text>
    `);

    await expect(page.getByTestId("value")).toHaveText("1");
    await page.getByTestId("append").click();
    await expect(page.getByTestId("value")).toHaveText("1|2");
    await page.getByTestId("remove").click();
    await expect(page.getByTestId("value")).toHaveText("2");
  });

  test("didUpdate receives new and previous values", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <AppState
        id="state"
        initialValue="{{ counter: 0 }}"
        onDidUpdate="info => testState = info.bucket + ':' + (info.previousValue ? info.previousValue.counter : 'none') + '>' + info.value.counter" />
      <Button testId="inc" onClick="state.update({ counter: state.value.counter + 1 })">Increment</Button>
    `);

    await page.getByTestId("inc").click();
    await expect.poll(testStateDriver.testState).toEqual("default:0>1");
  });
});

test.describe("AppState old-suite transfer debt", () => {
  test("copy the remaining literal old AppState tests after the full app-state context semantics are closed", async () => {
    test.fixme(true, "old AppState suite transfer is deferred");
  });
});
