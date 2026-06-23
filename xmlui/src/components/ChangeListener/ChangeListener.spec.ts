import { expect, test } from "../../testing/fixtures";

test.describe("ChangeListener foundation", () => {
  test("fires didChange when listenTo changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.counter="{0}" var.result="ready">
        <Button testId="inc" onClick="counter++">Increment</Button>
        <ChangeListener listenTo="{counter}" onDidChange="chg => result = chg.prevValue + '>' + chg.newValue" />
        <Text testId="result">{result}</Text>
      </App>
    `);

    await expect(page.getByTestId("result")).toHaveText("ready");
    await page.getByTestId("inc").click();
    await expect(page.getByTestId("result")).toHaveText("0>1");
  });

  test("does not fire for unrelated values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.watched="{0}" var.other="{0}" var.count="{0}">
        <Button testId="other" onClick="other++">Other</Button>
        <ChangeListener listenTo="{watched}" onDidChange="count++" />
        <Text testId="result">{other}:{count}</Text>
      </App>
    `);

    await page.getByTestId("other").click();
    await expect(page.getByTestId("result")).toHaveText("1:0");
  });

  test("listenToSources reports changed source details", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.first="alpha" var.second="beta" var.result="">
        <Button testId="change" onClick="second = 'gamma'">Change</Button>
        <ChangeListener
          listenToSources="{{ first: first, second: second }}"
          onDidChange="chg => result = chg.changedSources.join('|') + ':' + chg.changes.second.prevValue + '>' + chg.changes.second.newValue" />
        <Text testId="result">{result}</Text>
      </App>
    `);

    await page.getByTestId("change").click();
    await expect(page.getByTestId("result")).toHaveText("second:beta>gamma");
  });

  test("debounces didChange", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.counter="{0}" var.fireCount="{0}">
        <Button testId="inc" onClick="counter++; counter++">Increment twice</Button>
        <ChangeListener listenTo="{counter}" debounceWaitInMs="{50}" onDidChange="fireCount++" />
        <Text testId="result">{counter}:{fireCount}</Text>
      </App>
    `);

    await page.getByTestId("inc").click();
    await expect(page.getByTestId("result")).toHaveText("2:0");
    await expect(page.getByTestId("result")).toHaveText("2:1");
  });
});

test.describe("ChangeListener old-suite transfer debt", () => {
  test("copy the remaining literal old ChangeListener tests after throttling and warning behavior are fully closed", async () => {
    test.fixme(true, "old ChangeListener suite transfer is deferred");
  });
});
