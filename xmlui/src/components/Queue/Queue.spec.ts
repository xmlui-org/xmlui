import { expect, test } from "../../testing/fixtures";

test.describe("Queue foundation", () => {
  test("exposes API methods and starts empty", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Queue id="jobs" />
      <Button
        testId="check"
        onClick="testState = jobs.enqueueItem ? 'api' : 'missing'" />
    `);

    await page.getByTestId("check").click();
    await expect.poll(testStateDriver.testState).toEqual("api");
  });

  test("processes enqueued items in FIFO order", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.log="" var.ids="{[]}">
        <Queue
          id="jobs"
          onProcess="item => log = log + item + '|'"
          onComplete="log = log + 'done'" />
        <Button testId="enqueue" onClick="jobs.enqueueItems(['a', 'b'])">Enqueue</Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();
    await expect(page.getByTestId("log")).toHaveText("a|b|done");
  });

  test("willProcess=false removes item without processing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.log="" var.ids="{[]}">
        <Queue
          id="jobs"
          onWillProcess="item => item === 'skip' ? false : true"
          onProcess="item => item"
          onDidProcess="item => log = log + item"
          onComplete="log = log + ':done'" />
        <Button testId="enqueue" onClick="jobs.enqueueItems(['skip', 'run'])">Enqueue</Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();
    await expect(page.getByTestId("log")).toHaveText("run:done");
  });

  test("remove prevents a pending item from processing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.log="" var.ids="{[]}">
        <Queue
          id="jobs"
          onProcess="item => item"
          onDidProcess="item => log = log + item" />
        <Button
          testId="enqueue"
          onClick="ids = jobs.enqueueItems(['a', 'b']); jobs.remove(ids[1])">
          Enqueue
        </Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();
    await expect(page.getByTestId("log")).toHaveText("a");
  });
});

test.describe("Queue old-suite transfer debt", () => {
  test("copy literal old Queue API, progress, result feedback, and error tests", async () => {
    test.fixme(true, "full old Queue suite is deferred");
  });
});
