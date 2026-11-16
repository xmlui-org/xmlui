import type { Page } from "@playwright/test";
import { expect, test } from "../src/testing/fixtures";

// #3941 step 2: with xmluiConfig.readScopedRendering, a container whose bindings
// read nothing that changed hands Container its previous state, and the subtree
// is skipped. Writes still land; handlers see the latest state.

const SCOPED = { xmluiConfig: { readScopedRendering: true } };
const SCOPED_TRACED = {
  xmluiConfig: { readScopedRendering: true, xsVerbose: true, xsVerboseLogMax: 20000 },
};

type Pass = {
  component: string;
  cause: Array<{ kind: string; keys?: string[] }>;
  necessary?: boolean;
  stateHeld?: boolean;
  renderedCount?: number;
};

async function appPasses(page: Page): Promise<Pass[]> {
  return page.evaluate(() =>
    ((window as any)._xsLogs ?? []).filter((e: any) => e.kind === "render:pass" && e.component === "App"),
  );
}

test.describe("read-scoped rendering (#3941)", () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      delete (window as any)._xsLogs;
    });
  });

  test("an unbound var write holds the state and renders nothing; a bound one renders", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      // --- `unused` is written by a timer that nothing binds to `unused`
      `<App var.shown="{0}" var.unused="{0}">
  <Timer interval="20" enabled="{shown &lt; 7}" onTick="unused = unused + 1" />
  <Timer interval="20" once="true" initialDelay="600" onTick="shown = 7" />
  <Text value="SHOWN {shown}" />
</App>`,
      SCOPED_TRACED,
    );
    await expect(page.getByText("SHOWN 7")).toBeVisible();
    await page.waitForTimeout(300);
    const passes = await appPasses(page);
    const unusedOnly = passes.filter(
      (p) => p.cause.length === 1 && p.cause[0].keys?.join() === "unused",
    );
    expect(unusedOnly.length).toBeGreaterThan(0);
    for (const p of unusedOnly) {
      expect(p.necessary).toBe(false);
      expect(p.stateHeld).toBe(true);
      expect(p.renderedCount ?? 0).toBe(0);
    }
    const shown = passes.filter((p) => p.cause.some((c) => c.keys?.includes("shown")));
    expect(shown.length).toBeGreaterThan(0);
    for (const p of shown) expect(p.stateHeld).toBeUndefined();
  });

  test("a handler right after held passes sees the latest state", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App var.shown="{-1}" var.unused="{0}">
  <Timer interval="20" enabled="{unused &lt; 5}" onTick="unused = unused + 1" />
  <Button testId="copy" label="Copy" onClick="shown = unused" />
  <Text value="SHOWN {shown}" />
</App>`,
      SCOPED,
    );
    await page.waitForTimeout(600);
    await page.getByTestId("copy").click();
    await expect(page.getByText("SHOWN 5")).toBeVisible();
  });

  test("a handler's next statement sees what its previous one wrote", async ({
    initTestBed,
    page,
  }) => {
    // --- `unused` is read by no binding, so writing it holds the state; the
    // --- next statement must still read the new value
    await initTestBed(
      `<App var.shown="{-1}" var.unused="{0}">
  <Button testId="go" label="Go" onClick="unused = unused + 1; unused = unused + 1; shown = unused" />
  <Text value="SHOWN {shown}" />
</App>`,
      SCOPED,
    );
    await page.getByTestId("go").click();
    await expect(page.getByText("SHOWN 2")).toBeVisible();
    await page.getByTestId("go").click();
    await expect(page.getByText("SHOWN 4")).toBeVisible();
  });

  test("controls still show their own value", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App>
  <Select testId="sel">
    <Option value="a" label="Apple" />
    <Option value="b" label="Banana" />
  </Select>
  <Slider testId="sld" minValue="0" maxValue="10" />
  <TextBox testId="tb" />
</App>`,
      SCOPED,
    );
    await page.getByTestId("sel").click();
    await page.getByRole("option", { name: "Banana" }).click();
    await expect(page.getByTestId("sel")).toContainText("Banana");
    const slider = page.getByRole("slider").first();
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "2");
    await page.getByTestId("tb").locator("input").fill("typed");
    await expect(page.getByTestId("tb").locator("input")).toHaveValue("typed");
  });

  test("a dialog opened from a handler opens", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App>
  <Button testId="open" label="Open" onClick="dlg.open()" />
  <ModalDialog id="dlg" title="Hello"><Text value="dialog body" /></ModalDialog>
</App>`,
      SCOPED,
    );
    await page.getByTestId("open").click();
    await expect(page.getByText("dialog body")).toBeVisible();
  });

  test("a DataSource's bound value renders, its unread flags don't", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App>
  <DataSource id="ds" url="/api/items" />
  <Text value="COUNT {ds.value ? ds.value.length : 0}" />
</App>`,
      {
        ...SCOPED_TRACED,
        apiInterceptor: {
          operations: { items: { url: "/api/items", method: "get", handler: `return [1, 2, 3];` } },
        },
      },
    );
    await expect(page.getByText("COUNT 3")).toBeVisible();
    await page.waitForTimeout(300);
    const held = (await appPasses(page)).filter((p) => p.stateHeld);
    expect(held.length).toBeGreaterThan(0);
  });

  // --- The cases that broke the 10-30 attempt, which withheld writes instead
  test("Queue: getQueueLength in a handler behaves as before", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    // --- Same expectations as Queue.spec.ts: a handler doesn't see registrations
    // --- made while it runs
    const { testStateDriver } = await initTestBed(
      `<Fragment>
  <Queue id="testQueue" />
  <Button id="testBtn" label="Test" onClick="
    const initial = testQueue.getQueueLength();
    const id1 = testQueue.enqueueItem('item1');
    const afterOne = testQueue.getQueueLength();
    const ids = testQueue.enqueueItems(['item2', 'item3']);
    const afterThree = testQueue.getQueueLength();
    testState = { initial, afterOne, afterThree, hasId1: !!id1, hasIds: ids.length === 2 };
  " />
</Fragment>`,
      SCOPED,
    );
    await (await createButtonDriver("testBtn")).component.click();
    await expect.poll(testStateDriver.testState).toEqual({
      initial: 0,
      afterOne: 0,
      afterThree: 0,
      hasId1: true,
      hasIds: true,
    });
  });

  test("Queue: clearAfterFinish empties the queue by onComplete", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<Fragment>
  <Queue id="testQueue" clearAfterFinish="true"
         onProcess="processing => {}"
         onComplete="() => testState = testQueue.getQueuedItems().length" />
  <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
</Fragment>`,
      SCOPED,
    );
    await (await createButtonDriver("enqueueBtn")).component.click();
    await expect.poll(testStateDriver.testState).toBe(0);
  });

  test("nested user-defined components: $self and $this", async ({ initTestBed, page }) => {
    await initTestBed(`<TestButton1/>`, {
      ...SCOPED,
      components: [
        `<Component name="TestButton1" var.counter="{0}" method.incrementInside="()=>counter++">
  <Button onClick="$self.incrementInside()" testId="buttonComponent1">Increment counter: {counter}</Button>
  <TestButton2 onClick="$this.incrementInside()" testId="buttonComponent2"/>
</Component>`,
        `<Component name="TestButton2" var.counter="{0}" method.incrementInside="()=>counter++">
  <Button onClick="$self.incrementInside()">TB2:Increment counter: {counter}</Button>
</Component>`,
      ],
    });
    await page.getByTestId("buttonComponent1").click();
    await expect(page.getByTestId("buttonComponent1")).toHaveText("Increment counter: 1");
    await page.getByTestId("buttonComponent2").click();
    await expect(page.getByTestId("buttonComponent2")).toHaveText("TB2:Increment counter: 1");
  });
  test("a write in place to a read variable renders", async ({ initTestBed, page }) => {
    // --- `fruits[0].size = …` mutates the array in place: its identity doesn't change
    await initTestBed(
      `<Fragment var.fruits="{[{ name: 'apple', size: 'large' }]}">
  <Button testId="modify" onClick="fruits[0].size = 'small'">modify</Button>
  <Text testId="fruits">{JSON.stringify(fruits)}</Text>
</Fragment>`,
      SCOPED,
    );
    await page.getByTestId("modify").click();
    await expect(page.getByTestId("fruits")).toHaveText('[{"name":"apple","size":"small"}]');
  });

  test("a variable named by syncWithVar counts as read", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Fragment var.syncState="{{}}">
  <Table syncWithVar="syncState" rowsSelectable="true" testId="t1" data="{[{id: 1, name: 'A'}]}">
    <Column bindTo="name"/>
  </Table>
  <Table syncWithVar="syncState" rowsSelectable="true" testId="t2" data="{[{id: 1, name: 'A'}]}">
    <Column bindTo="name"/>
  </Table>
</Fragment>`,
      SCOPED,
    );
    await page.getByTestId("t1").locator("input[type='checkbox']").nth(1).click({ force: true });
    await expect(page.getByTestId("t2").locator("input[type='checkbox']").nth(1)).toBeChecked();
  });

  test("a call to an ancestor's function reads what the function reads", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<App var.overrides="{{}}">
  <script>
    function countOf(item) { return overrides[item.id] ?? item.count; }
  </script>
  <Items data="{[{ id: 1, count: 7 }]}">
    <Button testId="bump" onClick="overrides = { ...overrides, [$item.id]: countOf($item) + 1 }">
      COUNT {countOf($item)}
    </Button>
  </Items>
</App>`,
      SCOPED,
    );
    await expect(page.getByTestId("bump")).toHaveText("COUNT 7");
    await page.getByTestId("bump").click();
    await expect(page.getByTestId("bump")).toHaveText("COUNT 8");
  });
});

test.describe("read-scoped rendering: reads the static read set can't see (#3941)", () => {
  test("a bound id re-renders when its variable changes", async ({ initTestBed, page }) => {
    await initTestBed(
      `<VStack var.dynId="initial-id">
  <Button testId="set" label="Set" onClick="dynId = 'green-section'" />
  <Bookmark id="{dynId}"><Text>Target</Text></Bookmark>
</VStack>`,
      SCOPED,
    );
    await page.getByTestId("set").click();
    await expect(page.locator("#green-section")).toHaveCount(1);
  });

  test("a binding made at render time sees the API it reads (StepperForm)", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(
      `<StepperForm data="{{ name: '' }}">
  <FormSegment label="Alpha">
    <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
  </FormSegment>
  <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
</StepperForm>`,
      SCOPED,
    );
    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Alice");
    await expect(next).toBeEnabled();
  });
});
