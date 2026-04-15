import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component fires didChange event when listenTo value changes", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<App var.counter="{0}" var.oneBigger="{1}">
      <Button label="Increment" onClick="{counter++}" />
      <ChangeListener
        listenTo="{counter}"
        onDidChange="oneBigger = counter + 1" />
      <Text testId="counterText">{counter}</Text>
      <Text testId="oneBiggerText">{oneBigger}</Text>
    </App>`,
  );

  const counterText = page.getByTestId("counterText");
  const oneBiggerText = page.getByTestId("oneBiggerText");

  await expect(counterText).toHaveText("0");
  await expect(oneBiggerText).toHaveText("1");

  await page.getByRole("button", { name: "Increment" }).click();

  await expect(counterText).toHaveText("1");
  await expect(oneBiggerText).toHaveText("2");
});

test("component does not fire event when unrelated values change", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<App var.a="{0}" var.counter="{0}" var.oneBigger="{1}">
      <Button label="Increment" onClick="{counter++}" />
      <ChangeListener
        listenTo="{a}"
        onDidChange="oneBigger = counter + 1" />
      <Text testId="counterText">{counter}</Text>
      <Text testId="oneBiggerText">{oneBigger}</Text>
    </App>`,
  );

  const counterText = page.getByTestId("counterText");
  const oneBiggerText = page.getByTestId("oneBiggerText");

  await expect(counterText).toHaveText("0");
  await expect(oneBiggerText).toHaveText("1");

  await page.getByRole("button", { name: "Increment" }).click();

  await expect(counterText).toHaveText("1");
  await expect(oneBiggerText).toHaveText("1");
});

test("component passes both previous and new values to the handler", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(`
    <VStack var.counter="{0}" var.clone="{0}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{clone}</Text>
      <ChangeListener
        listenTo="{counter}"
        onDidChange="chg => clone = chg.prevValue + '|' + chg.newValue" />
    </VStack>
  `);

  // Click the button to change the counter value
  await page.locator("button").click();

  // Check that the event fired and testState was updated
  await expect(page.getByTestId("text")).toHaveText("0|1");
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles complex data types", async ({ page, initTestBed }) => {
  await initTestBed(`
    <VStack var.data="{{ a: 1, b: [2, { counter: 10}] }}" var.clone="{10}">
      <Button testId="incRelevant" onClick="data.b[1].counter++">Increment</Button>
      <Button testId="incIrrelevant" onClick="data.a++">Increment irrelevant</Button>
      <Text testId="text">{clone}</Text>
      <ChangeListener
        listenTo="{data.b[1].counter}"
        onDidChange="chg => clone = chg.newValue" />
    </VStack>
  `);

  await expect(page.getByTestId("text")).toHaveText("10");

  // make sure the irrelevant parts of the data doesn't get listenedTo
  await page.getByTestId("incIrrelevant").click();
  await expect(page.getByTestId("text")).toHaveText("10");

  await page.getByTestId("incRelevant").click();

  // Check that the event fired and testState was updated
  await expect(page.getByTestId("text")).toHaveText("11");
});

test("component handles undefined and null values", async ({ page, initTestBed }) => {
  await initTestBed(`
    <VStack var.counter="{0}" var.clone="{0}">
      <Button testId="setNull" onClick="counter = null">Set Null</Button>
      <Button testId="setUndefined" onClick="counter = undefined">Set Undefined</Button>
      <Button testId="setValue" onClick="counter = 3">Set Value</Button>
      <Text testId="text">
        {clone === undefined ? 'undefined' : JSON.stringify(clone)}
      </Text>
      <ChangeListener listenTo="{counter}" onDidChange="chg => clone = chg.newValue" />
    </VStack>`);

  await page.getByTestId("setNull").click();
  await expect(page.getByTestId("text")).toHaveText("null");
  await page.getByTestId("setUndefined").click();
  await expect(page.getByTestId("text")).toHaveText("undefined");
  await page.getByTestId("setValue").click();
  await expect(page.getByTestId("text")).toHaveText("3");
});

test("component doesn't fire on identical primitive values", async ({ page, initTestBed }) => {
  await initTestBed(`
    <VStack var.counter="{0}" var.clicked="{0}" var.data="{1}">
      <Button testId="setToPrimitive" onClick="clicked++; data = data + 1 - 1">
        Set The Same Primitive
      </Button>
      <Text testId="text">{clicked}|{counter}|{data}</Text>
      <ChangeListener listenTo="{data}" onDidChange="counter++" />
    </VStack>
  `);

  await expect(page.getByTestId("text")).toHaveText("0|0|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("1|0|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("2|0|1");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works with multiple listeners on the same value", async ({ page, initTestBed }) => {
  await initTestBed(`
    <VStack var.counter1="{0}" var.counter2="{0}" var.clicked="{0}">
      <Button testId="setToPrimitive" onClick="clicked++;">
        Set The Same Primitive
      </Button>
      <Text testId="text">{clicked}|{counter1}|{counter2}</Text>
      <ChangeListener listenTo="{clicked}" onDidChange="counter1++" />
      <ChangeListener listenTo="{clicked}" onDidChange="counter2++" />
    </VStack>
  `);

  await expect(page.getByTestId("text")).toHaveText("0|0|0");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("1|1|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("2|2|2");
});

test("component works with conditional rendering", async ({ page, initTestBed }) => {
  await initTestBed(`
    <VStack var.counter="{0}" var.clone="{0}" var.show="{false}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Button testId="showButton" onClick="show = !show">Toggle Show</Button>
      <Text testId="text">
        {clone}
      </Text>
      <ChangeListener
        when="{show}"
        listenTo="{counter}"
        onDidChange="clone = counter" />
    </VStack>
  `);

  // Click the button to change the counter value
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("0");
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("0");
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("0");
  // ChangeListener mounts with show=true but does not fire on initial mount.
  // The next counter change (button click) will be detected as the first change.
  await page.getByTestId("showButton").click();
  await expect(page.getByTestId("text")).toHaveText("0");
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("4");
  await page.getByTestId("showButton").click();
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("4");
});

// =============================================================================
// DEBOUNCEWAITINMS TESTS
// =============================================================================

test("debounceWaitInMs delays handler until the debounce period expires", async ({
  page,
  initTestBed,
}) => {
  await page.clock.install();
  await initTestBed(`
    <VStack var.counter="{0}" var.fireCount="{0}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{counter}|{fireCount}</Text>
      <ChangeListener
        listenTo="{counter}"
        debounceWaitInMs="{300}"
        onDidChange="fireCount++" />
    </VStack>
  `);

  await expect(page.getByTestId("text")).toHaveText("0|0");

  await page.getByTestId("button").click();

  // Advance to T=100 — still within the 300ms debounce window, handler not fired yet
  await page.clock.fastForward(100);
  await expect(page.getByTestId("text")).toHaveText("1|0");

  // Advance to T=300 — debounce window expires, handler fires
  await page.clock.fastForward(200);
  await expect(page.getByTestId("text")).toHaveText("1|1");
});

test("debounceWaitInMs fires handler only once for rapid consecutive changes", async ({
  page,
  initTestBed,
}) => {
  await page.clock.install();
  await initTestBed(`
    <VStack var.counter="{0}" var.fireCount="{0}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{counter}|{fireCount}</Text>
      <ChangeListener
        listenTo="{counter}"
        debounceWaitInMs="{300}"
        onDidChange="fireCount++" />
    </VStack>
  `);

  // Click 3 times rapidly without advancing time
  await page.getByTestId("button").click();
  await page.getByTestId("button").click();
  await page.getByTestId("button").click();

  // Advance to T=100 — still within the 300ms debounce window, handler has not fired
  await page.clock.fastForward(100);
  await expect(page.getByTestId("text")).toHaveText("3|0");

  // Advance to T=300 — debounce window expires, handler fires exactly once
  await page.clock.fastForward(200);
  await expect(page.getByTestId("text")).toHaveText("3|1");
});

test("debounceWaitInMs resets timer on each change within the window", async ({
  page,
  initTestBed,
}) => {
  await page.clock.install();
  await initTestBed(`
    <VStack var.counter="{0}" var.fireCount="{0}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{counter}|{fireCount}</Text>
      <ChangeListener
        listenTo="{counter}"
        debounceWaitInMs="{300}"
        onDidChange="fireCount++" />
    </VStack>
  `);

  // Helper: yield to the browser's message queue so React's passive effects
  // (useEffect, which is scheduled via MessageChannel internally) have time to
  // run before we advance the fake clock.  setTimeout and requestAnimationFrame
  // are both faked by page.clock.install(), but MessageChannel is NOT faked, so
  // this is the correct synchronisation primitive here.
  const flushEffects = () =>
    page.evaluate(
      () =>
        new Promise<void>(resolve => {
          const { port1, port2 } = new MessageChannel();
          port2.onmessage = () => resolve();
          port1.postMessage(null);
        }),
    );

  // First change
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("1|0");

  // Flush React effects so the first debounce timer is registered before we
  // advance the clock (prevents it from being registered at a shifted time).
  await flushEffects();

  // Advance 200ms — still within debounce window
  await page.clock.fastForward(200);
  await expect(page.getByTestId("text")).toHaveText("1|0");

  // Second change — resets the debounce timer
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("2|0");

  // Critical flush: ensures the useEffect from click #2 has called the debounce
  // function (resetting the T=300 timer to T=500) before fastForward processes
  // the original T=300 expiry.  Without this, under load the effect can run
  // DURING fastForward, after the T=300 timer has already fired.
  await flushEffects();

  // Advance another 200ms — 400ms since first change but only 200ms since last change
  await page.clock.fastForward(200);
  await expect(page.getByTestId("text")).toHaveText("2|0");

  // Advance 100ms more — now 300ms since last change, debounce fires
  await page.clock.fastForward(100);
  await expect(page.getByTestId("text")).toHaveText("2|1");
});

test("debounceWaitInMs passes correct prevValue and newValue to handler", async ({
  page,
  initTestBed,
}) => {
  await page.clock.install();
  await initTestBed(`
    <VStack var.counter="{0}" var.result="{''}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{result}</Text>
      <ChangeListener
        listenTo="{counter}"
        debounceWaitInMs="{200}"
        onDidChange="chg => result = chg.prevValue + '|' + chg.newValue" />
    </VStack>
  `);

  await page.getByTestId("button").click();
  await page.clock.fastForward(200);

  await expect(page.getByTestId("text")).toHaveText("0|1");
});

test("debounceWaitInMs takes precedence over throttleWaitInMs when both are set", async ({
  page,
  initTestBed,
}) => {
  await page.clock.install();
  await initTestBed(`
    <VStack var.counter="{0}" var.fireCount="{0}">
      <Button testId="button" onClick="counter++">Increment</Button>
      <Text testId="text">{counter}|{fireCount}</Text>
      <ChangeListener
        listenTo="{counter}"
        debounceWaitInMs="{300}"
        throttleWaitInMs="{50}"
        onDidChange="fireCount++" />
    </VStack>
  `);

  await page.getByTestId("button").click();
  await page.getByTestId("button").click();
  await page.getByTestId("button").click();

  // Advance past throttle window — if throttle were active it would have fired by now
  await page.clock.fastForward(100);
  await expect(page.getByTestId("text")).toHaveText("3|0");

  // Advance to full debounce window
  await page.clock.fastForward(200);
  await expect(page.getByTestId("text")).toHaveText("3|1");
});
