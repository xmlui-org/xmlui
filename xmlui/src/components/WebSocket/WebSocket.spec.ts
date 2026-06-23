import { expect, test } from "../../testing/fixtures";

test.describe("WebSocket foundation", () => {
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
});

test.describe("WebSocket old-suite transfer debt", () => {
  test("event delivery, disabled state, close, error, and reconnect are re-closed with streaming fixtures", async () => {
    test.fixme(true, "WebSocket behavioral closure needs the streaming compatibility harness");
  });

  test("copy literal reconnect/error tests when streaming test services exist", async () => {
    test.fixme(true, "full old WebSocket suite is deferred");
  });
});

async function installFakeWebSocket(page: { addInitScript: (script: () => void) => Promise<void> }) {
  await page.addInitScript(() => {
    class FakeWebSocket {
      url: string;
      listeners: Record<string, Array<(event: any) => void>> = {};
      constructor(url: string) {
        this.url = url;
        (window as any).__fakeWebSockets.push(this);
      }
      addEventListener(name: string, listener: (event: any) => void) {
        this.listeners[name] = [...(this.listeners[name] ?? []), listener];
      }
      close() {
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
