import { test, expect } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("receives messages via window.postMessage", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="no message yet">
        <MessageListener onMessageReceived="arg => msg = arg" />
        <Text>
          {msg}
        </Text>
        <Button onClick="window.postMessage('Hello from Main.xmlui', '*')">
          Click me
        </Button>
      </VStack>
    `);

    // Initial state
    await expect(page.getByText("no message yet")).toBeVisible();

    // Trigger postMessage
    await page.getByRole("button", { name: "Click me" }).click();

    // Verify message was received
    await expect(page.getByText("Hello from Main.xmlui")).toBeVisible();
  });

  test("receives complex data objects", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.receivedData="null">
        <MessageListener onMessageReceived="arg => receivedData = arg" />
        <Text testId="display">
          {receivedData && receivedData.type ? receivedData.type + ': ' + receivedData.value : 'waiting'}
        </Text>
        <Button onClick="window.postMessage({ type: 'test', value: 42 }, '*')">
          Send Object
        </Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("waiting");

    await page.getByRole("button", { name: "Send Object" }).click();

    await expect(page.getByTestId("display")).toHaveText("test: 42");
  });

  test("handles multiple messages sequentially", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="none">
        <MessageListener onMessageReceived="arg => msg = arg" />
        <Text testId="display">{msg}</Text>
        <Button testId="btn1" onClick="window.postMessage('first', '*')">First</Button>
        <Button testId="btn2" onClick="window.postMessage('second', '*')">Second</Button>
        <Button testId="btn3" onClick="window.postMessage('third', '*')">Third</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("none");

    await page.getByTestId("btn1").click();
    await expect(page.getByTestId("display")).toHaveText("first");

    await page.getByTestId("btn2").click();
    await expect(page.getByTestId("display")).toHaveText("second");

    await page.getByTestId("btn3").click();
    await expect(page.getByTestId("display")).toHaveText("third");
  });

  test("renders children correctly without wrapper elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MessageListener>
        <Text testId="child1">First Child</Text>
        <Text testId="child2">Second Child</Text>
        <Button testId="child3">Button Child</Button>
      </MessageListener>
    `);

    await expect(page.getByTestId("child1")).toBeVisible();
    await expect(page.getByTestId("child2")).toBeVisible();
    await expect(page.getByTestId("child3")).toBeVisible();
    
    await expect(page.getByTestId("child1")).toHaveText("First Child");
    await expect(page.getByTestId("child2")).toHaveText("Second Child");
    await expect(page.getByRole("button", { name: "Button Child" })).toBeVisible();
  });

  test("doesn't disrupt Stack layout gaps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack gap="$space-8">
        <MessageListener>
          <Text testId="item1">Item 1</Text>
          <Text testId="item2">Item 2</Text>
        </MessageListener>
        <Text testId="item3">Item 3</Text>
      </VStack>
    `);

    const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
    const { top: item2Top } = await getBounds(page.getByTestId("item2"));
    const { bottom: item2Bottom } = await getBounds(page.getByTestId("item2"));
    const { top: item3Top } = await getBounds(page.getByTestId("item3"));

    // Gap between item1 and item2 (should be space-8 = 32px)
    const gap1 = item2Top - item1Bottom;
    expect(gap1).toBeCloseTo(32, 0);

    // Gap between item2 and item3 (should be space-8 = 32px)
    const gap2 = item3Top - item2Bottom;
    expect(gap2).toBeCloseTo(32, 0);
  });

  test("doesn't disrupt HStack layout gaps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack gap="$space-4">
        <MessageListener>
          <Text testId="item1">A</Text>
          <Text testId="item2">B</Text>
        </MessageListener>
        <Text testId="item3">C</Text>
      </HStack>
    `);

    const { right: item1Right } = await getBounds(page.getByTestId("item1"));
    const { left: item2Left } = await getBounds(page.getByTestId("item2"));
    const { right: item2Right } = await getBounds(page.getByTestId("item2"));
    const { left: item3Left } = await getBounds(page.getByTestId("item3"));

    // Gap between item1 and item2 (should be space-4 = 16px)
    const gap1 = item2Left - item1Right;
    expect(gap1).toBeCloseTo(16, 0);

    // Gap between item2 and item3 (should be space-4 = 16px)
    const gap2 = item3Left - item2Right;
    expect(gap2).toBeCloseTo(16, 0);
  });

  test("works with nested MessageListeners", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.outer="none" var.inner="none">
        <MessageListener onMessageReceived="arg => outer = arg">
          <Text testId="outer">{outer}</Text>
          <MessageListener onMessageReceived="arg => inner = arg">
            <Text testId="inner">{inner}</Text>
          </MessageListener>
        </MessageListener>
        <Button onClick="window.postMessage('test message', '*')">Send</Button>
      </VStack>
    `);

    await expect(page.getByTestId("outer")).toHaveText("none");
    await expect(page.getByTestId("inner")).toHaveText("none");

    await page.getByRole("button", { name: "Send" }).click();

    // Both listeners should receive the message
    await expect(page.getByTestId("outer")).toHaveText("test message");
    await expect(page.getByTestId("inner")).toHaveText("test message");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("doesn't affect accessibility of child elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MessageListener>
        <Button testId="btn">Test Button</Button>
        <TextBox testId="input" label="Test Input" />
      </MessageListener>
    `);

    const button = page.getByTestId("btn");
    await expect(button).toHaveRole("button");
    await expect(button).toHaveAccessibleName("Test Button");

    const input = page.getByTestId("input").locator("input");
    await expect(input).toHaveRole("textbox");
    await expect(input).toHaveAccessibleName("Test Input");
  });

  test("maintains focus behavior of children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MessageListener>
        <TextBox testId="input1" />
        <TextBox testId="input2" />
      </MessageListener>
    `);

    const input1 = page.getByTestId("input1").locator("input");
    const input2 = page.getByTestId("input2").locator("input");

    await input1.focus();
    await expect(input1).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(input2).toBeFocused();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no children gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<MessageListener />`);
    // Should not throw or cause errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("handles null and undefined message data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="initial">
        <MessageListener onMessageReceived="arg => msg = arg === null ? 'was null' : (arg === undefined ? 'was undefined' : arg)" />
        <Text testId="display">{msg}</Text>
        <Button testId="sendNull" onClick="window.postMessage(null, '*')">Send Null</Button>
        <Button testId="sendUndefined" onClick="window.postMessage(undefined, '*')">Send Undefined</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("initial");

    await page.getByTestId("sendNull").click();
    await expect(page.getByTestId("display")).toHaveText("was null");

    await page.getByTestId("sendUndefined").click();
    await expect(page.getByTestId("display")).toHaveText("was undefined");
  });

  test("handles empty string message", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="initial">
        <MessageListener onMessageReceived="arg => msg = arg === '' ? 'empty' : arg" />
        <Text testId="display">{msg}</Text>
        <Button onClick="window.postMessage('', '*')">Send Empty</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("initial");

    await page.getByRole("button", { name: "Send Empty" }).click();
    await expect(page.getByTestId("display")).toHaveText("empty");
  });

  test("handles boolean message data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="initial">
        <MessageListener onMessageReceived="arg => msg = arg" />
        <Text testId="display">{msg}</Text>
        <Button testId="sendTrue" onClick="window.postMessage(true, '*')">Send True</Button>
        <Button testId="sendFalse" onClick="window.postMessage(false, '*')">Send False</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("initial");

    await page.getByTestId("sendTrue").click();
    await expect(page.getByTestId("display")).toHaveText("true");

    await page.getByTestId("sendFalse").click();
    await expect(page.getByTestId("display")).toHaveText("false");
  });

  test("handles numeric message data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="initial">
        <MessageListener onMessageReceived="arg => msg = arg" />
        <Text testId="display">{msg}</Text>
        <Button testId="send0" onClick="window.postMessage(0, '*')">Send 0</Button>
        <Button testId="send42" onClick="window.postMessage(42, '*')">Send 42</Button>
        <Button testId="sendNegative" onClick="window.postMessage(-123, '*')">Send -123</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("initial");

    await page.getByTestId("send0").click();
    await expect(page.getByTestId("display")).toHaveText("0");

    await page.getByTestId("send42").click();
    await expect(page.getByTestId("display")).toHaveText("42");

    await page.getByTestId("sendNegative").click();
    await expect(page.getByTestId("display")).toHaveText("-123");
  });

  test("handles array message data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg="initial">
        <MessageListener onMessageReceived="arg => msg = arg" />
        <Text testId="display">{msg && msg.join ? msg.join(', ') : 'initial'}</Text>
        <Button onClick="window.postMessage(['a', 'b', 'c'], '*')">Send Array</Button>
      </VStack>
    `);

    await expect(page.getByTestId("display")).toHaveText("initial");

    await page.getByRole("button", { name: "Send Array" }).click();
    await expect(page.getByTestId("display")).toHaveText("a, b, c");
  });

  test("multiple MessageListeners can coexist", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.msg1="none" var.msg2="none" var.msg3="none">
        <MessageListener onMessageReceived="arg => msg1 = arg">
          <Text testId="listener1">{msg1}</Text>
        </MessageListener>
        <MessageListener onMessageReceived="arg => msg2 = arg">
          <Text testId="listener2">{msg2}</Text>
        </MessageListener>
        <MessageListener onMessageReceived="arg => msg3 = arg">
          <Text testId="listener3">{msg3}</Text>
        </MessageListener>
        <Button onClick="window.postMessage('broadcast', '*')">Send</Button>
      </VStack>
    `);

    await expect(page.getByTestId("listener1")).toHaveText("none");
    await expect(page.getByTestId("listener2")).toHaveText("none");
    await expect(page.getByTestId("listener3")).toHaveText("none");

    await page.getByRole("button", { name: "Send" }).click();

    // All listeners should receive the same message
    await expect(page.getByTestId("listener1")).toHaveText("broadcast");
    await expect(page.getByTestId("listener2")).toHaveText("broadcast");
    await expect(page.getByTestId("listener3")).toHaveText("broadcast");
  });

  test("event handler can be omitted", async ({ initTestBed, page }) => {
    await initTestBed(`
      <MessageListener>
        <Text testId="child">Child Content</Text>
      </MessageListener>
    `);

    // Should not throw even if postMessage is called
    await page.evaluate(() => window.postMessage("test", "*"));
    
    await expect(page.getByTestId("child")).toBeVisible();
    await expect(page.getByTestId("child")).toHaveText("Child Content");
  });
});
