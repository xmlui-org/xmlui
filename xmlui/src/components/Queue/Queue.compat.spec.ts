import { expect, test } from "../../testing/fixtures";

test.describe("Queue compatibility", () => {
  test("places progress toast at top right and replaces it with result feedback", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.queued="{0}"
        var.processed="{0}"
        var.result="{0}">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem(0.125); queued++; }" />
        <Queue
          id="myQueue"
          onProcess="processing => {
            processed++;
            processing.onProgress(processed);
            delay(300);
            result += processing.item;
          }">
          <property name="progressFeedback">
            <Text value="{processed} / {queued}" />
          </property>
          <property name="resultFeedback">
            <Text value="{result.toFixed(4)}" />
          </property>
        </Queue>
      </App>
    `);

    await page.getByTestId("enqueue").click();
    const progressToast = page.getByRole("status").filter({ hasText: "1 / 1" });
    await expect(progressToast).toBeVisible();

    const progressBox = await progressToast.boundingBox();
    expect(progressBox).not.toBeNull();
    expect(progressBox!.x + progressBox!.width / 2).toBeGreaterThan(page.viewportSize()!.width / 2);

    await expect(page.getByRole("status").filter({ hasText: "0.1250" })).toBeVisible();
    await expect(progressToast).not.toBeVisible();
  });

  test("replaces progress feedback with result feedback for reported sample ordering", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.queued="{0}"
        var.queueLength="{0}"
        var.processed="{0}"
        var.result="{0}">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem(0.125); queued++; }" />
        <Queue
          id="myQueue"
          onProcess="processing => {
            result += processing.item;
            delay(1000);
            processed++;
            processing.onProgress(processed);
          }">
          <property name="progressFeedback">
            <Text value="{processed} / {queued}" />
          </property>
          <property name="resultFeedback">
            <Text value="{result.toFixed(4)}" />
          </property>
        </Queue>
        <ChangeListener
          listenTo="{myQueue.getQueueLength()}"
          onDidChange="l => queueLength = l.newValue;"/>
        <Text>Items queued: {queued}</Text>
        <Text>Current queue length: {queueLength}</Text>
        <Text>Current result: {result.toFixed(4)}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();

    await expect(page.getByRole("status").filter({ hasText: "0.1250" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "1 / 1" })).not.toBeVisible();
    await page.waitForTimeout(500);
    await expect(page.getByRole("status").filter({ hasText: "1 / 1" })).not.toBeVisible();
  });

  test("replaces progress feedback with result feedback after two queued clicks", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.queued="{0}"
        var.queueLength="{0}"
        var.processed="{0}"
        var.result="{0}">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem(0.25); queued++; }" />
        <Queue
          id="myQueue"
          onProcess="processing => {
            result += processing.item;
            delay(300);
            processed++;
            processing.onProgress(processed);
          }">
          <property name="progressFeedback">
            <Text value="{processed} / {queued}" />
          </property>
          <property name="resultFeedback">
            <Text value="{result.toFixed(4)}" />
          </property>
        </Queue>
        <ChangeListener
          listenTo="{myQueue.getQueueLength()}"
          onDidChange="l => queueLength = l.newValue;"/>
        <Text>Items queued: {queued}</Text>
        <Text>Current queue length: {queueLength}</Text>
        <Text>Current result: {result.toFixed(4)}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();
    await page.getByTestId("enqueue").click();

    await expect(page.getByRole("status").filter({ hasText: "0.5000" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "2 / 2" })).not.toBeVisible();
  });

  test("shows a signed error toast when processing throws", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.progressLine="">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem('bad');}" />
        <Queue
          id="myQueue"
          onProcess="processing => { throw 'Item cannot be processed'; }"
          onProcessError="progressLine += ' canceled'" />
        <Text>Progress: {progressLine}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();

    await expect(page.getByText("Progress: canceled")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Item cannot be processed" })).toBeVisible();
  });

  test("suppresses the signed error toast when processError returns false", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.progressLine="">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem('bad');}" />
        <Queue
          id="myQueue"
          onProcess="processing => { throw 'Conflict'; }"
          onProcessError="(error, processing) => {
            if (error.message === 'Conflict') {
              progressLine += ' canceled';
              return false;
            }
          }" />
        <Text>Progress: {progressLine}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();

    await expect(page.getByText("Progress: canceled")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Conflict" })).not.toBeVisible();
  });

  test("processError can await confirmation and retry through the queue api", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.queued="{0}" var.processed="">
        <Button
          testId="enqueue"
          label="Add a new file to the queue"
          onClick="{myQueue.enqueueItem({file: ++queued, conflict: 'deny'})}" />
        <Queue id="myQueue"
          onProcess="processing => {
            delay(100);
            if (processing.item.conflict === 'deny') {
              throw 'Conflict';
            }
            processed += processing.item.file + ', ';
          }"
          onProcessError="(error, processing) => {
            if (error.message === 'Conflict') {
              console.log(error);
              const result = confirm(
                'Do you want to overwrite?',
                'File ' + processing.item.file + ' already exists',
                'Overwrite'
              );
              $this.remove(processing.actionItemId);
              if (result) {
                $this.enqueueItems([{...processing.item, conflict: 'accept'}]);
              }
              return false;
            }
          }">
          <property name="resultFeedback">
            <Text value="All items processed" />
          </property>
        </Queue>
        <Text>Items queued: {queued}</Text>
        <Text>Processed: {processed}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();

    const dialog = page.getByRole("dialog", { name: "Do you want to overwrite?" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("File 1 already exists");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(dialog.getByText("Do you want to overwrite?")).toHaveCSS("font-size", "36px");
    await expect(dialog.getByRole("button", { name: "Overwrite" })).toHaveCSS(
      "background-color",
      "rgb(255, 31, 20)",
    );
    await expect(page.getByText("Processed: 1,")).not.toBeVisible();

    await dialog.getByRole("button", { name: "Overwrite" }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Processed: 1,")).toBeVisible();
    await expect(page.getByText("Processed: undefined,")).not.toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Conflict" })).not.toBeVisible();
  });

  test("skips processing when willProcess returns false from a grouped comma expression", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.queued="{0}"
        var.skipped="{0}"
        var.result="{0}">
        <Button
          testId="enqueue"
          label="Add a new item to the queue"
          onClick="{myQueue.enqueueItem(0.25); queued++; }" />
        <Queue id="myQueue"
          onWillProcess="toProcess => toProcess.item < 0.5 ? (skipped++, false) : true"
          onProcess="processing => {
            result += processing.item;
            delay(100);
          }">
          <property name="resultFeedback">
            <Text value="{result.toFixed(4)}" />
          </property>
        </Queue>
        <Text>Items queued: {queued}</Text>
        <Text>Items skipped: {skipped}</Text>
        <Text>Current result: {result.toFixed(4)}</Text>
      </App>
    `);

    await page.getByTestId("enqueue").click();

    await expect(page.getByText("Items queued: 1")).toBeVisible();
    await expect(page.getByText("Items skipped: 1")).toBeVisible();
    await expect(page.getByText("Current result: 0.0000")).toBeVisible();
  });
});
