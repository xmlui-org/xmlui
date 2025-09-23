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
    <VStack var.data="{{ a: 1, b: [2, { counter: 10}] }}" var.clone="{0}">
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

  await expect(page.getByTestId("text")).toHaveText("0|1|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("1|1|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("2|1|1");
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

  await expect(page.getByTestId("text")).toHaveText("0|1|1");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("1|2|2");
  await page.locator("button").click();
  await expect(page.getByTestId("text")).toHaveText("2|3|3");
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
  await page.getByTestId("showButton").click();
  await expect(page.getByTestId("text")).toHaveText("3");
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("4");
  await page.getByTestId("showButton").click();
  await page.getByTestId("button").click();
  await expect(page.getByTestId("text")).toHaveText("4");
});
