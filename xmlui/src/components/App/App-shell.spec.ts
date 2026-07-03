import { expect, test } from "../../testing/fixtures";

test.describe("App shell foundation", () => {
  test("ready event fires once after App renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{0}" onReady="count++">
        <Button testId="rerender" onClick="count = count">Re-render</Button>
        <Text testId="count">{count}</Text>
      </App>
    `);

    await expect(page.getByTestId("count")).toHaveText("1");
    await page.getByTestId("rerender").click();
    await expect(page.getByTestId("count")).toHaveText("1");
  });

  test("messageReceived receives posted data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="none" onMessageReceived="msg => message = msg.text">
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.evaluate(() => {
      window.postMessage({ text: "hello-app" }, "*");
    });

    await expect(page.getByTestId("message")).toHaveText("hello-app");
  });

  test("messageReceived handles messages posted from component event handlers", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.message = "<none>"
        onMessageReceived="(msg, ev) => {
          message = JSON.stringify(msg);
          console.log('Message event received:', ev);
        }">
        <Button
          testId="send"
          label="Send a message"
          onClick="window.postMessage({type: 'message', messages:'Here you are!'})" />
        <Text testId="message">Message received: {message}</Text>
      </App>
    `);

    await expect(page.getByTestId("message")).toHaveText("Message received: <none>");
    await page.getByTestId("send").click();
    await expect(page.getByTestId("message")).toHaveText(
      'Message received: {"type":"message","messages":"Here you are!"}',
    );
  });

  test("keyDown and keyUp receive keyboard events", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        var.lastKey="none"
        onKeyDown="event => lastKey = 'down:' + event.key"
        onKeyUp="event => lastKey = 'up:' + event.key">
        <Text testId="content">Press a key</Text>
        <Text testId="lastKey">{lastKey}</Text>
      </App>
    `);

    await expect(page.getByTestId("content")).toBeVisible();
    await page.keyboard.down("x");
    await expect(page.getByTestId("lastKey")).toHaveText("down:x");

    await page.keyboard.up("x");
    await expect(page.getByTestId("lastKey")).toHaveText("up:x");
  });
});

test.describe("App shell old-suite transfer debt", () => {
  test("messageReceived passes the MessageEvent as the second argument", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App
        var.eventInfo="none"
        onMessageReceived="(msg, ev) => eventInfo = msg.text + ':' + ev.type">
        <Text testId="eventInfo">{eventInfo}</Text>
      </App>
    `);

    await page.evaluate(() => {
      window.postMessage({ text: "hello-app-event" }, "*");
    });

    await expect(page.getByTestId("eventInfo")).toHaveText("hello-app-event:message");
  });
});
