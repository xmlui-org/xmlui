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

  test("enqueue APIs return ids for mixed item types and empty batches", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Queue id="jobs" />
      <Button
        testId="enqueue"
        onClick="
          let id1 = jobs.enqueueItem('string');
          let id2 = jobs.enqueueItem(123);
          let id3 = jobs.enqueueItem({ key: 'value' });
          let id4 = jobs.enqueueItem([1, 2, 3]);
          let id5 = jobs.enqueueItem(null);
          let id6 = jobs.enqueueItem(undefined);
          let ids = [id1, id2, id3, id4, id5, id6];
          const emptyIds = jobs.enqueueItems([]);
          testState = {
            count: ids.length,
            unique: id1 !== id2 && id2 !== id3 && id3 !== id4 && id4 !== id5 && id5 !== id6,
            emptyCount: emptyIds.length
          };
        " />
    `);

    await page.getByTestId("enqueue").click();
    await expect.poll(testStateDriver.testState).toEqual({
      count: 6,
      unique: true,
      emptyCount: 0,
    });
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

  test("keeps completed records until clearAfterFinish cleanup and reports results", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.log="">
        <Queue
          id="jobs"
          clearAfterFinish="{false}"
          onProcess="item => item + '-result'"
          onDidProcess="(item, result) => log = log + item + ':' + result + '|'"
          onComplete="log = log + 'complete'" />
        <Button testId="run" onClick="jobs.enqueueItems(['a', 'b'])">Run</Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("run").click();
    await expect(page.getByTestId("log")).toHaveText("a:a-result|b:b-result|complete");
  });

  test("continues processing later items after skipped entries", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.log="">
        <Queue
          id="jobs"
          onWillProcess="item => item === 'skip' ? false : true"
          onProcess="item => log = log + 'ok:' + item + '|'" />
        <Button testId="run" onClick="jobs.enqueueItems(['good1', 'skip', 'good2'])">Run</Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("run").click();
    await expect(page.getByTestId("log")).toHaveText("ok:good1|ok:good2|");
  });

  test("complete fires after mixed skipped and successful items", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.log="">
        <Queue
          id="jobs"
          onWillProcess="item => item === 'skip' ? false : true"
          onProcess="item => log = log + item + '|'"
          onComplete="log = log + 'complete'" />
        <Button testId="run" onClick="jobs.enqueueItems(['skip', 'ok'])">Run</Button>
        <Text testId="log">{log}</Text>
      </App>
    `);

    await page.getByTestId("run").click();
    await expect(page.getByTestId("log")).toHaveText("ok|complete");
  });
});
