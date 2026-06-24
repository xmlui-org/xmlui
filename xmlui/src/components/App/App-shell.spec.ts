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
  test("messageReceived passes the MessageEvent as the second argument", async () => {
    test.fixme(true, "Current event parser supports only zero- or single-parameter arrow callbacks");
  });

  test("copy literal remaining App shell, layout, navigation, and script-import tests", async () => {
    test.fixme(true, "Full App shell compatibility is deferred to Wave G1 closure");
  });
});
