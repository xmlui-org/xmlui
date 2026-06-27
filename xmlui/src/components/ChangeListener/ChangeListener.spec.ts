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

  test("listenToSources takes precedence and supports array source indexes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.single="{0}" var.first="alpha" var.second="beta" var.result="">
        <Button testId="single" onClick="single++">Single</Button>
        <Button testId="second" onClick="second = 'gamma'">Second</Button>
        <ChangeListener
          listenTo="{single}"
          listenToSources="{[first, second]}"
          onDidChange="chg => result = chg.changedSources.join('|') + ':' + chg.changes['1'].prevValue + '>' + chg.changes['1'].newValue" />
        <Text testId="result">{single}:{result}</Text>
      </App>
    `);

    await page.getByTestId("single").click();
    await expect(page.getByTestId("result")).toHaveText("1:");
    await page.getByTestId("second").click();
    await expect(page.getByTestId("result")).toHaveText("1:1:beta>gamma");
  });

  test("listenTo keeps arrays and objects as aggregate payloads", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.first="{1}" var.second="{10}" var.data="{{ name: 'Ada', title: 'Countess' }}" var.result="">
        <Button testId="array" onClick="second++">Array</Button>
        <Button testId="object" onClick="data = { ...data, title: 'Programmer' }">Object</Button>
        <ChangeListener
          listenTo="{[first, second]}"
          onDidChange="chg => result = (chg.changes === undefined ? 'single' : 'multi') + ':' + chg.prevValue.join('|') + '>' + chg.newValue.join('|')" />
        <ChangeListener
          listenTo="{data}"
          onDidChange="chg => result = (chg.changes === undefined ? 'single' : 'multi') + ':' + chg.prevValue.title + '>' + chg.newValue.title" />
        <Text testId="result">{result}</Text>
      </App>
    `);

    await page.getByTestId("array").click();
    await expect(page.getByTestId("result")).toHaveText("single:1|10>1|11");
    await page.getByTestId("object").click();
    await expect(page.getByTestId("result")).toHaveText("single:Countess>Programmer");
  });

  test("stays inactive without listenTo and does not fire for identical primitive values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.value="{1}" var.clicked="{0}" var.fireCount="{0}">
        <Button testId="same" onClick="clicked++; value = value + 1 - 1">Same</Button>
        <Button testId="unwatched" onClick="clicked++">Unwatched</Button>
        <ChangeListener listenTo="{value}" onDidChange="fireCount++" />
        <ChangeListener onDidChange="fireCount = fireCount + 100" />
        <Text testId="result">{clicked}:{fireCount}:{value}</Text>
      </App>
    `);

    await page.getByTestId("same").click();
    await expect(page.getByTestId("result")).toHaveText("1:0:1");
    await page.getByTestId("unwatched").click();
    await expect(page.getByTestId("result")).toHaveText("2:0:1");
  });

  test("handles null, undefined, multiple listeners, and conditional rendering", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.value="{0}" var.first="{0}" var.second="{0}" var.show="{false}" var.conditional="{0}" var.result="">
        <Button testId="null" onClick="value = null">Null</Button>
        <Button testId="undefined" onClick="value = undefined">Undefined</Button>
        <Button testId="value" onClick="value = 3">Value</Button>
        <Button testId="conditional" onClick="conditional++">Conditional</Button>
        <Button testId="toggle" onClick="show = !show">Toggle</Button>
        <ChangeListener listenTo="{value}" onDidChange="chg => result = chg.newValue === undefined ? 'undefined' : JSON.stringify(chg.newValue)" />
        <ChangeListener listenTo="{value}" onDidChange="first++" />
        <ChangeListener listenTo="{value}" onDidChange="second++" />
        <ChangeListener when="{show}" listenTo="{conditional}" onDidChange="result = 'conditional:' + conditional" />
        <Text testId="result">{result}|{first}|{second}|{conditional}</Text>
      </App>
    `);

    await page.getByTestId("null").click();
    await expect(page.getByTestId("result")).toHaveText("null|1|1|0");
    await page.getByTestId("undefined").click();
    await expect(page.getByTestId("result")).toHaveText("undefined|2|2|0");
    await page.getByTestId("value").click();
    await expect(page.getByTestId("result")).toHaveText("3|3|3|0");
    await page.getByTestId("conditional").click();
    await expect(page.getByTestId("result")).toHaveText("3|3|3|1");
    await page.getByTestId("toggle").click();
    await page.getByTestId("conditional").click();
    await expect(page.getByTestId("result")).toHaveText("conditional:2|3|3|2");
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

  test("debounce timer resets and preserves previous/new payload", async ({
    initTestBed,
    page,
  }) => {
    await page.clock.install();
    await initTestBed(`
      <App var.counter="{0}" var.result="">
        <Button testId="inc" onClick="counter++">Increment</Button>
        <ChangeListener
          listenTo="{counter}"
          debounceWaitInMs="{300}"
          onDidChange="chg => result = chg.prevValue + '>' + chg.newValue" />
        <Text testId="result">{counter}:{result}</Text>
      </App>
    `);

    const flushEffects = () =>
      page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            const { port1, port2 } = new MessageChannel();
            port2.onmessage = () => resolve();
            port1.postMessage(null);
          }),
      );

    await page.getByTestId("inc").click();
    await flushEffects();
    await page.clock.fastForward(200);
    await expect(page.getByTestId("result")).toHaveText("1:");
    await page.getByTestId("inc").click();
    await flushEffects();
    await page.clock.fastForward(200);
    await expect(page.getByTestId("result")).toHaveText("2:");
    await page.clock.fastForward(100);
    await expect(page.getByTestId("result")).toHaveText("2:1>2");
  });

  test("debounce takes precedence over throttle and duplicate sources warn", async ({
    initTestBed,
    page,
  }) => {
    await page.clock.install();
    const warnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") {
        warnings.push(message.text());
      }
    });
    await initTestBed(`
      <App var.single="{0}" var.source="{0}" var.fireCount="{0}">
        <Button testId="inc" onClick="single++; source++">Increment</Button>
        <ChangeListener
          listenTo="{single}"
          listenToSources="{{ source: source }}"
          debounceWaitInMs="{300}"
          throttleWaitInMs="{50}"
          onDidChange="fireCount++" />
        <Text testId="result">{single}:{source}:{fireCount}</Text>
      </App>
    `);

    await page.getByTestId("inc").click();
    await page.getByTestId("inc").click();
    await page.clock.fastForward(100);
    await expect(page.getByTestId("result")).toHaveText("2:2:0");
    await page.clock.fastForward(200);
    await expect(page.getByTestId("result")).toHaveText("2:2:1");
    expect(warnings.some((warning) => warning.includes("ChangeListener cannot use both listenTo and listenToSources"))).toBe(true);
  });
});
