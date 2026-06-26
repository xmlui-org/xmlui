import { expect, test } from "../../testing/fixtures";

test.describe("WebSocket foundation", () => {
  test.describe.configure({ mode: "serial" });

  test("constructs a socket when enabled", async ({ initTestBed, page }) => {
    await installFakeWebSocket(page);
    await initTestBed(`
      <WebSocket url="ws://example.test/socket" />
    `);

    await expect.poll(() =>
      page.evaluate(() =>
        (window as any).__fakeWebSockets.some(
          (socket: { url: string }) => socket.url === "ws://example.test/socket",
        ),
      ),
    ).toBe(true);
  });

  test("does not connect while disabled and closes on disable", async ({ initTestBed, page }) => {
    await installFakeWebSocket(page);
    await initTestBed(`
      <App var.enabled="{false}">
        <WebSocket url="ws://example.test/socket" enabled="{enabled}" />
        <Button testId="enable" onClick="enabled = true">Enable</Button>
        <Button testId="disable" onClick="enabled = false">Disable</Button>
      </App>
    `);

    await expect.poll(() => page.evaluate(() => (window as any).__fakeWebSockets.length)).toBe(0);
    await page.getByTestId("enable").click();
    await expect.poll(() => page.evaluate(() => (window as any).__fakeWebSockets.length)).toBe(1);
    await page.getByTestId("disable").click();
    await expect.poll(() => page.evaluate(() => (window as any).__fakeWebSockets[0].closed)).toBe(true);
  });

  test("delivers open, parsed message, text message, error, and close events", async ({
    initTestBed,
    page,
  }) => {
    await installFakeWebSocket(page);
    await initTestBed(`
      <App var.log="">
        <WebSocket
          url="ws://example.test/socket"
          onOpen="log = log + 'open|'"
          onMessage="data => log = log + (data.kind ? data.kind + ':' + data.value : data) + '|'"
          onError="log = log + 'error|'"
          onClose="event => log = log + 'close:' + event.code + '|'" />
        <Text testId="log">{log}</Text>
      </App>
    `);

    await expect.poll(() => page.evaluate(() =>
      Boolean((window as any).__fakeWebSockets[0]?.listeners?.message?.length),
    )).toBe(true);
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("open", {});
    });
    await expect(page.getByTestId("log")).toHaveText("open|");
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("message", { data: JSON.stringify({ kind: "msg", value: 7 }) });
    });
    await expect(page.getByTestId("log")).toHaveText("open|msg:7|");
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("message", { data: "plain" });
    });
    await expect(page.getByTestId("log")).toHaveText("open|msg:7|plain|");
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("error", {});
    });
    await expect(page.getByTestId("log")).toHaveText("open|msg:7|plain|error|");
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("close", { code: 4001, reason: "done" });
    });
    await expect(page.getByTestId("log")).toHaveText("open|msg:7|plain|error|close:4001|");
  });

  test("reconnects after close when reconnect is enabled", async ({ initTestBed, page }) => {
    await page.clock.install();
    await installFakeWebSocket(page);
    await initTestBed(`
      <WebSocket url="ws://example.test/socket" reconnect="{true}" reconnectDelayMs="{250}" />
    `);

    await expect.poll(() => page.evaluate(() => (window as any).__fakeWebSockets.length)).toBe(1);
    await page.evaluate(() => {
      const socket = (window as any).__fakeWebSockets[0];
      socket.emit("close", { code: 1006, reason: "lost" });
    });
    await page.clock.fastForward(250);
    await expect.poll(() => page.evaluate(() => (window as any).__fakeWebSockets.length)).toBe(2);
  });
});

async function installFakeWebSocket(page: { addInitScript: (script: () => void) => Promise<void> }) {
  await page.addInitScript(() => {
    class FakeWebSocket {
      url: string;
      closed = false;
      listeners: Record<string, Array<(event: any) => void>> = {};
      constructor(url: string) {
        this.url = url;
        (window as any).__fakeWebSockets.push(this);
      }
      addEventListener(name: string, listener: (event: any) => void) {
        this.listeners[name] = [...(this.listeners[name] ?? []), listener];
      }
      close() {
        this.closed = true;
        this.emit("close", { code: 1000, reason: "" });
      }
      emit(name: string, event: any) {
        for (const listener of this.listeners[name] ?? []) {
          listener(event);
        }
      }
    }
    (window as any).__fakeWebSockets = [];
    (window as any).WebSocket = FakeWebSocket;
  });
}
