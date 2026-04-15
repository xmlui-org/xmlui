import { test, expect } from "../src/testing/fixtures";

// =============================================================================
// BASIC PUB/SUB TESTS
// =============================================================================

test.describe("Basic Pub/Sub", () => {
  test("component subscribes to topic and receives published data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-button" onClick="publishTopic('test-topic', { message: 'Hello' })">Publish</Button>
        <Text 
          testId="subscriber" 
          subscribeToTopic="test-topic" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-button").click();

    await expect.poll(testStateDriver.testState).toEqual({
      topic: "test-topic",
      data: { message: "Hello" },
    });
  });

  test("publishTopic with primitive data types", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-string" onClick="publishTopic('topic1', 'Hello')">String</Button>
        <Button testId="publish-number" onClick="publishTopic('topic2', 42)">Number</Button>
        <Button testId="publish-boolean" onClick="publishTopic('topic3', true)">Boolean</Button>
        <Text 
          subscribeToTopic="{['topic1', 'topic2', 'topic3']}" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-string").click();
    await expect.poll(testStateDriver.testState).toEqual({ topic: "topic1", data: "Hello" });

    await page.getByTestId("publish-number").click();
    await expect.poll(testStateDriver.testState).toEqual({ topic: "topic2", data: 42 });

    await page.getByTestId("publish-boolean").click();
    await expect.poll(testStateDriver.testState).toEqual({ topic: "topic3", data: true });
  });

  test("publishTopic with complex data structures", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-object" onClick="publishTopic('obj-topic', { name: 'John', age: 30 })">Object</Button>
        <Button testId="publish-array" onClick="publishTopic('arr-topic', [1, 2, 3, 4, 5])">Array</Button>
        <Text 
          subscribeToTopic="{['obj-topic', 'arr-topic']}" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-object").click();
    await expect.poll(testStateDriver.testState).toEqual({
      topic: "obj-topic",
      data: { name: "John", age: 30 },
    });

    await page.getByTestId("publish-array").click();
    await expect.poll(testStateDriver.testState).toEqual({
      topic: "arr-topic",
      data: [1, 2, 3, 4, 5],
    });
  });

  test("publishTopic without data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-button" onClick="publishTopic('empty-topic')">Publish</Button>
        <Text 
          subscribeToTopic="empty-topic" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-button").click();

    await expect.poll(testStateDriver.testState).toEqual({
      topic: "empty-topic",
      data: undefined,
    });
  });

  test("numeric topics work correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-button" onClick="publishTopic(42, 'answer')">Publish</Button>
        <Text 
          subscribeToTopic="{42}" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-button").click();

    await expect.poll(testStateDriver.testState).toEqual({
      topic: 42,
      data: "answer",
    });
  });
});

// =============================================================================
// MULTIPLE TOPICS TESTS
// =============================================================================

test.describe("Multiple Topics", () => {
  test("component subscribes to multiple topics as array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-topic1" onClick="publishTopic('topic1', 'data1')">Publish Topic 1</Button>
        <Button testId="publish-topic2" onClick="publishTopic('topic2', 'data2')">Publish Topic 2</Button>
        <Text 
          subscribeToTopic="{['topic1', 'topic2']}" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    await page.getByTestId("publish-topic1").click();
    await expect.poll(testStateDriver.testState).toEqual({ topic: "topic1", data: "data1" });

    await page.getByTestId("publish-topic2").click();
    await expect.poll(testStateDriver.testState).toEqual({ topic: "topic2", data: "data2" });
  });

  test("component only receives topics it subscribes to", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-subscribed" onClick="publishTopic('topic1', 'should-receive')">Publish Topic 1</Button>
        <Button testId="publish-unsubscribed" onClick="publishTopic('topic2', 'should-not-receive')">Publish Topic 2</Button>
        <Button testId="check-state" onClick="testState = testState || 'no-messages'">Check</Button>
        <Text 
          subscribeToTopic="topic1" 
          onTopicReceived="(topic, data) => testState = { topic, data }"
        >Subscriber</Text>
      </Fragment>
    `);

    // Publish to unsubscribed topic first
    await page.getByTestId("publish-unsubscribed").click();
    await page.getByTestId("check-state").click();
    await expect.poll(testStateDriver.testState).toEqual("no-messages");

    // Publish to subscribed topic
    await page.getByTestId("publish-subscribed").click();
    await expect.poll(testStateDriver.testState).toEqual({
      topic: "topic1",
      data: "should-receive",
    });
  });

  test("multiple components subscribe to same topic", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="publish-button" onClick="publishTopic('shared-topic', 'broadcast')">Publish</Button>
        <Text 
          testId="subscriber1"
          subscribeToTopic="shared-topic" 
          onTopicReceived="(topic, data) => { sub1Topic = topic; sub1Data = data; }"
        >Subscriber 1</Text>
        <Text 
          testId="subscriber2"
          subscribeToTopic="shared-topic" 
          onTopicReceived="(topic, data) => { sub2Topic = topic; sub2Data = data; }"
        >Subscriber 2</Text>
        <Button testId="get-results" onClick="testState = { sub1: { topic: sub1Topic, data: sub1Data }, sub2: { topic: sub2Topic, data: sub2Data } }">Get Results</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var sub1Topic = null;
      var sub1Data = null;
      var sub2Topic = null;
      var sub2Data = null;
    `,
      }
    );

    await page.getByTestId("publish-button").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();

    await expect.poll(testStateDriver.testState).toEqual({
      sub1: { topic: "shared-topic", data: "broadcast" },
      sub2: { topic: "shared-topic", data: "broadcast" },
    });
  });

  test("multiple subscribers to multiple topics - only appropriate subscribers trigger", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="publish-topicA" onClick="publishTopic('topicA', 'dataA')">Publish A</Button>
        <Button testId="publish-topicB" onClick="publishTopic('topicB', 'dataB')">Publish B</Button>
        <Button testId="publish-topicC" onClick="publishTopic('topicC', 'dataC')">Publish C</Button>
        
        <Text 
          subscribeToTopic="topicA" 
          onTopicReceived="(topic, data) => { sub1Topic = topic; sub1Data = data; }"
        >Subscriber 1 (A only)</Text>
        
        <Text 
          subscribeToTopic="{['topicA', 'topicB']}" 
          onTopicReceived="(topic, data) => { sub2Topic = topic; sub2Data = data; }"
        >Subscriber 2 (A and B)</Text>
        
        <Text 
          subscribeToTopic="topicB" 
          onTopicReceived="(topic, data) => { sub3Topic = topic; sub3Data = data; }"
        >Subscriber 3 (B only)</Text>
        
        <Button testId="get-results" onClick="testState = { sub1: sub1Topic ? { topic: sub1Topic, data: sub1Data } : undefined, sub2: sub2Topic ? { topic: sub2Topic, data: sub2Data } : undefined, sub3: sub3Topic ? { topic: sub3Topic, data: sub3Data } : undefined }">Get Results</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var sub1Topic = null;
      var sub1Data = null;
      var sub2Topic = null;
      var sub2Data = null;
      var sub3Topic = null;
      var sub3Data = null;
    `,
      }
    );

    // Publish topicA - should trigger sub1 and sub2 only
    await page.getByTestId("publish-topicA").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toEqual({
      sub1: { topic: "topicA", data: "dataA" },
      sub2: { topic: "topicA", data: "dataA" },
      sub3: undefined,
    });

    // Publish topicB - should trigger sub2 and sub3 only (sub1 should stay as topicA)
    await page.getByTestId("publish-topicB").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toEqual({
      sub1: { topic: "topicA", data: "dataA" }, // unchanged
      sub2: { topic: "topicB", data: "dataB" }, // updated
      sub3: { topic: "topicB", data: "dataB" }, // updated
    });

    // Publish topicC - should trigger none (all should stay as they were)
    await page.getByTestId("publish-topicC").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toEqual({
      sub1: { topic: "topicA", data: "dataA" }, // unchanged
      sub2: { topic: "topicB", data: "dataB" }, // unchanged
      sub3: { topic: "topicB", data: "dataB" }, // unchanged
    });
  });

  test("subscription type variants: string, number, and array", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="publish-string" onClick="publishTopic('string-topic', 'string-data')">Publish String Topic</Button>
        <Button testId="publish-number" onClick="publishTopic(99, 'number-data')">Publish Number Topic</Button>
        <Button testId="publish-array-item" onClick="publishTopic('array-topic', 'array-data')">Publish Array Item</Button>
        
        <Text 
          subscribeToTopic="string-topic" 
          onTopicReceived="(topic, data) => { stringSubTopic = topic; stringSubData = data; }"
        >String Subscriber</Text>
        
        <Text 
          subscribeToTopic="{99}" 
          onTopicReceived="(topic, data) => { numberSubTopic = topic; numberSubData = data; }"
        >Number Subscriber</Text>
        
        <Text 
          subscribeToTopic="{['array-topic', 'other-topic']}" 
          onTopicReceived="(topic, data) => { arraySubTopic = topic; arraySubData = data; }"
        >Array Subscriber</Text>
        
        <Button testId="get-results" onClick="testState = { stringSub: stringSubTopic ? { topic: stringSubTopic, data: stringSubData } : undefined, numberSub: numberSubTopic ? { topic: numberSubTopic, data: numberSubData } : undefined, arraySub: arraySubTopic ? { topic: arraySubTopic, data: arraySubData } : undefined }">Get Results</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var stringSubTopic = null;
      var stringSubData = null;
      var numberSubTopic = null;
      var numberSubData = null;
      var arraySubTopic = null;
      var arraySubData = null;
    `,
      }
    );

    // Test string subscription
    await page.getByTestId("publish-string").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toMatchObject({
      stringSub: { topic: "string-topic", data: "string-data" },
    });

    // Test number subscription
    await page.getByTestId("publish-number").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toMatchObject({
      numberSub: { topic: 99, data: "number-data" },
    });

    // Test array subscription
    await page.getByTestId("publish-array-item").click();
    await page.waitForTimeout(100);
    await page.getByTestId("get-results").click();
    await expect.poll(testStateDriver.testState).toMatchObject({
      arraySub: { topic: "array-topic", data: "array-data" },
    });
  });

  test("topic published multiple times - subscriber receives all events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="publish" onClick="publishTopic('repeat-topic', 'msg')">Publish</Button>
        
        <Text 
          subscribeToTopic="repeat-topic" 
          onTopicReceived="() => eventCount++"
        >Subscriber</Text>
        
        <Button testId="get-count" onClick="testState = eventCount">Get Count</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var eventCount = 0;
    `,
      }
    );
    
    // Publish same topic 3 times with delays
    await page.getByTestId("publish").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(1);
    
    await page.waitForTimeout(200);
    await page.getByTestId("publish").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(2);
    
    await page.waitForTimeout(200);
    await page.getByTestId("publish").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(3);
  });
});

// =============================================================================
// SUBSCRIPTION LIFECYCLE TESTS
// =============================================================================

test.describe("Subscription Lifecycle", () => {
  test("subscription is cleaned up when component unmounts", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="toggle-button" onClick="showSubscriber = !showSubscriber">Toggle</Button>
        <Button testId="publish-button" onClick="publishTopic('lifecycle-topic', 'data')">Publish</Button>
        <Button testId="reset-state" onClick="received = false">Reset State</Button>
        
        <Fragment when="{showSubscriber}">
          <Text 
            subscribeToTopic="lifecycle-topic" 
            onTopicReceived="(topic, data) => received = true"
          >Subscriber</Text>
        </Fragment>
        
        <Button testId="check-state" onClick="testState = received">Check</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var showSubscriber = true;
      var received = false;
    `,
      }
    );

    // Initially subscribed, publish should trigger
    await page.getByTestId("publish-button").click();
    await page.getByTestId("check-state").click();
    await expect.poll(testStateDriver.testState).toBe(true);

    // Clear state via button
    await page.getByTestId("reset-state").click();

    // Unmount subscriber
    await page.getByTestId("toggle-button").click();

    // Wait a bit to ensure unmount completes
    await page.waitForTimeout(100);

    // Publish again - should not trigger since component is unmounted
    await page.getByTestId("publish-button").click();
    await page.waitForTimeout(100);
    await page.getByTestId("check-state").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("component without onTopicReceived handler does not error", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="publish-button" onClick="publishTopic('no-handler-topic', 'data'); testState = 'published'">Publish</Button>
        <Text subscribeToTopic="no-handler-topic">Subscriber without handler</Text>
      </Fragment>
    `);

    // Should not throw error
    await page.getByTestId("publish-button").click();
    await expect.poll(testStateDriver.testState).toEqual("published");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("pubsub with global variables for state management", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button 
          testId="publish-button" 
          onClick="publishTopic('state-topic', { count: count + 1 })"
        >Increment via Topic</Button>
        
        <Text 
          subscribeToTopic="state-topic" 
          onTopicReceived="(topic, data) => count = data.count"
        >Subscriber</Text>
        
        <Button testId="get-count" onClick="testState = count">Get Count</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var count = 0;
    `,
      }
    );

    await page.getByTestId("publish-button").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(1);

    await page.getByTestId("publish-button").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(2);

    await page.getByTestId("publish-button").click();
    await page.getByTestId("get-count").click();
    await expect.poll(testStateDriver.testState).toBe(3);
  });

  test("pubsub with form components", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <TextBox testId="input" value="{message}" onDidChange="value => message = value" placeholder="Type a message" />
        <Button testId="send-button" onClick="publishTopic('msg-topic', message)">Send</Button>
        
        <Text 
          subscribeToTopic="msg-topic" 
          onTopicReceived="(topic, data) => testState = data"
        >Receiver</Text>
      </Fragment>
    `,
      {
        mainXs: `
      var message = '';
    `,
      }
    );

    await page.getByRole("textbox").fill("Hello World");
    await page.getByTestId("send-button").click();

    await expect.poll(testStateDriver.testState).toBe("Hello World");
  });

  test("cascading topic publications", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="start-button" onClick="publishTopic('step1', 'started')">Start Chain</Button>
        
        <Text 
          subscribeToTopic="step1" 
          onTopicReceived="(topic, data) => publishTopic('step2', data + '-step2')"
        >Step 1</Text>
        
        <Text 
          subscribeToTopic="step2" 
          onTopicReceived="(topic, data) => publishTopic('step3', data + '-step3')"
        >Step 2</Text>
        
        <Text 
          subscribeToTopic="step3" 
          onTopicReceived="(topic, data) => testState = data"
        >Step 3</Text>
      </Fragment>
    `);

    await page.getByTestId("start-button").click();

    await expect.poll(testStateDriver.testState).toBe("started-step2-step3");
  });

  test("pub/sub with conditional rendering", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Button testId="toggle-mode" onClick="mode = mode === 'subscribe' ? 'unsubscribe' : 'subscribe'">Toggle Mode</Button>
        <Button testId="publish-button" onClick="publishTopic('conditional-topic', 'message')">Publish</Button>
        
        <Fragment when="{mode === 'subscribe'}">
          <Text 
            subscribeToTopic="conditional-topic" 
            onTopicReceived="(topic, data) => { receivedCount = receivedCount + 1; testState = { mode, receivedCount } }"
          >Active Subscriber</Text>
        </Fragment>
        
        <Button testId="check-state" onClick="testState = { mode, receivedCount }">Check</Button>
      </Fragment>
    `,
      {
        mainXs: `
      var mode = 'subscribe';
      var receivedCount = 0;
    `,
      }
    );

    // Mode is 'subscribe', should receive
    await page.getByTestId("publish-button").click();
    await expect.poll(testStateDriver.testState).toEqual({ mode: "subscribe", receivedCount: 1 });

    // Toggle to 'unsubscribe'
    await page.getByTestId("toggle-mode").click();
    await page.waitForTimeout(100);

    // Publish again - should not receive (count should stay at 1)
    await page.getByTestId("publish-button").click();
    await page.waitForTimeout(100);
    await page.getByTestId("check-state").click();
    await expect.poll(testStateDriver.testState).toEqual({ mode: "unsubscribe", receivedCount: 1 });
  });
});
