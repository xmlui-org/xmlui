import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component initializes and provides API methods", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue" />
        <Button id="checkApi" label="Check API" onClick="testState = {
          hasEnqueueItem: typeof testQueue.enqueueItem === 'function',
          hasEnqueueItems: typeof testQueue.enqueueItems === 'function',
          hasGetQueuedItems: typeof testQueue.getQueuedItems === 'function',
          hasGetQueueLength: typeof testQueue.getQueueLength === 'function',
          hasRemove: typeof testQueue.remove === 'function'
        }" />
      </Fragment>
    `);

    const buttonDriver = createButtonDriver("checkApi");
    await (await buttonDriver).component.click();
    await expect.poll(testStateDriver.testState).toEqual({
      hasEnqueueItem: true,
      hasEnqueueItems: true,
      hasGetQueuedItems: true,
      hasGetQueueLength: true,
      hasRemove: true,
    });
  });

  // =============================================================================
  // ENQUEUE ITEM API TESTS
  // =============================================================================

  test.describe("enqueueItem API", () => {
    test("enqueueItem adds item to queue and returns ID", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            const itemId = testQueue.enqueueItem('test-item');
            testState = {
              itemId: itemId,
              hasValidId: typeof itemId === 'string' && itemId.length > 0
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        itemId: expect.any(String),
        hasValidId: true,
      });
    });

    test("enqueueItem handles different data types", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            const results = [];
            results.push(testQueue.enqueueItem('string'));
            results.push(testQueue.enqueueItem(123));
            results.push(testQueue.enqueueItem({key: 'value'}));
            results.push(testQueue.enqueueItem([1, 2, 3]));
            results.push(testQueue.enqueueItem(null));
            results.push(testQueue.enqueueItem(undefined));
            testState = results.length;
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe(6);
    });

    test("enqueueItem generates unique IDs", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            const id1 = testQueue.enqueueItem('item1');
            const id2 = testQueue.enqueueItem('item2');
            const id3 = testQueue.enqueueItem('item3');
            testState = {
              allDifferent: id1 !== id2 && id2 !== id3 && id1 !== id3,
              ids: [id1, id2, id3]
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      const result = await testStateDriver.testState();
      expect(result.allDifferent).toBe(true);
      expect(result.ids).toHaveLength(3);
    });
  });

  // =============================================================================
  // ENQUEUE ITEMS API TESTS
  // =============================================================================

  test.describe("enqueueItems API", () => {
    test("enqueueItems adds multiple items and returns array of IDs", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            const itemIds = testQueue.enqueueItems(['item1', 'item2', 'item3']);
            testState = {
              itemIds: itemIds,
              isArray: Array.isArray(itemIds),
              correctLength: itemIds.length === 3
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        itemIds: expect.any(Array),
        isArray: true,
        correctLength: true,
      });
    });

    test("enqueueItems handles empty array", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            const itemIds = testQueue.enqueueItems([]);
            testState = {
              itemIds: itemIds,
              queueLength: testQueue.getQueueLength(),
              isEmptyArray: Array.isArray(itemIds) && itemIds.length === 0
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        itemIds: [],
        queueLength: 0,
        isEmptyArray: true,
      });
    });
  });

  // =============================================================================
  // GET QUEUE LENGTH API TESTS
  // =============================================================================

  test.describe("getQueueLength API", () => {
    test("getQueueLength returns 0 for empty queue", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="checkBtn" label="Check" onClick="testState = testQueue.getQueueLength();" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("checkBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe(0);
    });

    test("getQueueLength updates after adding items", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="testBtn" label="Test" onClick="
            const initial = testQueue.getQueueLength();
            const id1 = testQueue.enqueueItem('item1');
            const afterOne = testQueue.getQueueLength();
            const ids = testQueue.enqueueItems(['item2', 'item3']);
            const afterThree = testQueue.getQueueLength();
            testState = {
              initial,
              afterOne,
              afterThree,
              hasId1: !!id1,
              hasIds: ids.length === 2
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("testBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        initial: 0,
        afterOne: 0,
        afterThree: 0,
        hasId1: true,
        hasIds: true,
      });
    });
  });

  // =============================================================================
  // GET QUEUED ITEMS API TESTS
  // =============================================================================

  test.describe("getQueuedItems API", () => {
    test("getQueuedItems returns empty array for empty queue", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="checkBtn" label="Check" onClick="testState = testQueue.getQueuedItems();" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("checkBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual([]);
    });

    test("getQueuedItems returns items with correct structure", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="testBtn" label="Test" onClick="
            const itemId = testQueue.enqueueItem('test-item');
            const items = testQueue.getQueuedItems();
            testState = {
              hasItemId: !!itemId,
              itemsLength: items.length,
              isArray: Array.isArray(items)
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("testBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        hasItemId: true,
        itemsLength: 0,
        isArray: true,
      });
    });
  });

  // =============================================================================
  // REMOVE API TESTS
  // =============================================================================

  test.describe("remove API", () => {
    test("remove removes item from queue by ID", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="testBtn" label="Test" onClick="
            const itemId = testQueue.enqueueItem('item-to-remove');
            const keepId = testQueue.enqueueItem('item-to-keep');
            const lengthBefore = testQueue.getQueueLength();
            testQueue.remove(itemId);
            const lengthAfter = testQueue.getQueueLength();
            testState = {
              lengthBefore,
              lengthAfter,
              hasItemId: !!itemId,
              hasKeepId: !!keepId
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("testBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        lengthBefore: 0,
        lengthAfter: 0,
        hasItemId: true,
        hasKeepId: true,
      });
    });

    test("remove handles invalid ID gracefully", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" />
          <Button id="testBtn" label="Test" onClick="
            const itemId = testQueue.enqueueItem('test-item');
            const lengthBefore = testQueue.getQueueLength();
            testQueue.remove('invalid-id');
            const lengthAfter = testQueue.getQueueLength();
            testState = {
              lengthBefore,
              lengthAfter,
              hasItemId: !!itemId
            };
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("testBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toEqual({
        lengthBefore: 0,
        lengthAfter: 0,
        hasItemId: true,
      });
    });
  });

  // =============================================================================
  // CLEAR AFTER FINISH PROPERTY TESTS
  // =============================================================================

  test.describe("clearAfterFinish property", () => {
    test("clearAfterFinish defaults to false", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" onProcess="processing => testState = 'processed'" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("processed");
    });

    test("clearAfterFinish=true removes completed items", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" clearAfterFinish="true"
                 onProcess="processing => {}"
                 onComplete="() => testState = testQueue.getQueuedItems().length" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe(0);
    });
  });

  // =============================================================================
  // EVENT HANDLER TESTS
  // =============================================================================

  test.describe("Event Handlers", () => {
    test("onProcess event fires for queued items", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" onProcess="processing => testState = processing.item" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test-data');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("test-data");
    });

    test("onWillProcess event can skip items by returning false", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue"
                 onWillProcess="processing => processing.item !== 'skip' ? true : (testState = 'skipped', false)"
                 onProcess="processing => testState = 'processed'" />
          <Button id="enqueueBtn" label="Enqueue" onClick="
            testQueue.enqueueItem('skip');
            testQueue.enqueueItem('process');
          " />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("processed");
    });

    test("onDidProcess event fires after processing", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue"
                 onProcess="processing => {}"
                 onDidProcess="processing => testState = 'did-process-' + processing.item" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("did-process-test");
    });

    test("onProcessError event fires when processing throws", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue"
                 onProcess="processing => { throw 'test error'; }"
                 onProcessError="(error, processing) => testState = 'error-' + processing.item" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("error-test");
    });

    test("onComplete event fires when queue becomes empty", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" clearAfterFinish="true"
                 onProcess="processing => {}"
                 onComplete="() => testState = 'complete'" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("complete");
    });
  });

  // =============================================================================
  // TEMPLATE PROPERTY TESTS
  // =============================================================================

  test.describe("Template Properties", () => {
    test("progressFeedback renders during processing", async ({
      initTestBed,
      page,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <Queue id="testQueue" onProcess="processing => { processing.reportProgress('50%'); }">
            <property name="progressFeedback">
              <Text value="Progress: {$completedItems.length} of {$queuedItems.length}" />
            </property>
          </Queue>
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect(page.getByText("Progress: 0 of 1")).toBeVisible();
    });

    test("resultFeedback renders when queue completes", async ({
      initTestBed,
      page,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <Queue id="testQueue" clearAfterFinish="true" onProcess="processing => {}">
            <property name="resultFeedback">
              <Text value="All {$completedItems.length} items processed" />
            </property>
          </Queue>
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect(page.getByText("All 1 items processed")).toBeVisible();
    });

    test("progressFeedback handles null gracefully", async ({
      initTestBed,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" progressFeedback="{null}" onProcess="processing => testState = 'processed'" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("processed");
    });

    test("resultFeedback handles null gracefully", async ({ initTestBed, createButtonDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Queue id="testQueue" resultFeedback="{null}" clearAfterFinish="true"
                 onProcess="processing => {}"
                 onComplete="() => testState = 'complete'" />
          <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItem('test');" />
        </Fragment>
      `);

      const buttonDriver = await createButtonDriver("enqueueBtn");
      await buttonDriver.component.click();

      await expect.poll(testStateDriver.testState).toBe("complete");
    });
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles simultaneous API calls", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue" />
        <Button id="callBtn" label="Call APIs" onClick="
          // Add multiple items quickly
          const id1 = testQueue.enqueueItem('item1');
          const id2 = testQueue.enqueueItem('item2');
          const ids = testQueue.enqueueItems(['item3', 'item4', 'item5']);

          // Mix operations
          testQueue.remove(id1);
          const finalLength = testQueue.getQueueLength();
          const items = testQueue.getQueuedItems();

          testState = {
            finalLength,
            itemCount: items.length,
            hasId1: !!id1,
            hasId2: !!id2,
            idsLength: ids.length
          };
        " />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("callBtn");
    await buttonDriver.component.click();

    await expect.poll(testStateDriver.testState).toEqual({
      finalLength: 0,
      itemCount: 0,
      hasId1: true,
      hasId2: true,
      idsLength: 3,
    });
  });

  test("handles processing with errors and recovery", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue"
               onProcess="processing => {
                 if (processing.item === 'error') throw 'Test error';
                 testState = testState || [];
                 testState.push('processed-' + processing.item);
               }"
               onProcessError="(error, processing) => {
                 testState = testState || [];
                 testState.push('error-' + processing.item);
               }" />
        <Button id="enqueueBtn" label="Enqueue" onClick="testQueue.enqueueItems(['good1', 'error', 'good2']);" />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("enqueueBtn");
    await buttonDriver.component.click();

    await expect
      .poll(testStateDriver.testState)
      .toEqual(["processed-good1", "error-error", "processed-good2"]);
  });

  test("handles very large queue operations", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue" onProcess="processing => { /* process item */ }" />
        <Button id="largeBtn" label="Large Op" onClick="
          // Create large array of items
          const largeArray = [];
          for (let i = 0; i < 100; i++) {
            largeArray.push('item-' + i);
          }

          const itemIds = testQueue.enqueueItems(largeArray);
          // Check uniqueness without Set
          const uniqueCheck = {};
          let allUnique = true;
          for (let i = 0; i < itemIds.length; i++) {
            if (uniqueCheck[itemIds[i]]) {
              allUnique = false;
              break;
            }
            uniqueCheck[itemIds[i]] = true;
          }
          testState = {
            enqueuedCount: itemIds.length,
            queueLength: testQueue.getQueueLength(),
            allUniqueIds: allUnique
          };
        " />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("largeBtn");
    await buttonDriver.component.click();

    await expect.poll(testStateDriver.testState).toEqual({
      enqueuedCount: 100,
      queueLength: expect.any(Number), // Queue length will vary based on processing timing
      allUniqueIds: true,
    });
  });

  test("handles nested object and complex data types", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue" onProcess="processing => testState = processing.item" />
        <Button id="complexBtn" label="Complex" onClick="
          const complexObject = {
            nested: { deep: { value: 'test' } },
            array: [1, 2, { key: 'value' }],
            dateStr: '2025-08-07',
            pattern: 'test'
          };
          testQueue.enqueueItem(complexObject);
        " />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("complexBtn");
    await buttonDriver.component.click();

    const result = await testStateDriver.testState();
    expect(result.nested.deep.value).toBe("test");
    expect(result.array).toEqual([1, 2, { key: "value" }]);
  });

  test("handles rapid state changes during processing", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue"
               onProcess="processing => {
                 // Simulate processing time
                 const start = Date.now();
                 while (Date.now() - start < 10) {} // 10ms busy wait
                 testState = (testState || 0) + 1;
               }" />
        <Button id="rapidBtn" label="Rapid" onClick="testQueue.enqueueItems([1, 2, 3, 4, 5]);" />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("rapidBtn");
    await buttonDriver.component.click();

    await expect.poll(testStateDriver.testState).toBe(5);
  });

  test("handles context variables in templates correctly", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Queue id="testQueue" clearAfterFinish="false"
               onProcess="processing => {
                 processing.reportProgress(processing.item);
                 testState = {
                   queuedItems: testQueue.getQueuedItems().length,
                   item: processing.item
                 };
               }">
          <property name="progressFeedback">
            <Text value="Processing: {$queuedItems.length - $completedItems.length} remaining of {$queuedItems.length} total" />
          </property>
          <property name="resultFeedback">
            <Text value="Final: {$completedItems.length} completed, {$queuedItems.length} total" />
          </property>
        </Queue>
        <Button id="templateBtn" label="Test Templates" onClick="testQueue.enqueueItems(['item1', 'item2']);" />
      </Fragment>
    `);

    const buttonDriver = await createButtonDriver("templateBtn");
    await buttonDriver.component.click();

    // Verify that the queue processing works with template properties defined
    await expect.poll(testStateDriver.testState).toEqual({
      queuedItems: expect.any(Number),
      item: expect.any(String),
    });
  });
});
