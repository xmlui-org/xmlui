import { expect, test } from "../../testing/fixtures";

test.describe("EventSource foundation", () => {
  test("opens and parses messages", async ({ initTestBed, page }) => {
    await installFakeEventSource(page);
    await initTestBed(`
      <App var.log="">
        <EventSource
          url="/stream"
          onOpen="log = log + 'open|'"
          onMessage="data => log = log + data.kind + ':' + data.value + '|'"
          onClose="log = log + 'close'" />
        <Text testId="log">{log}</Text>
      </App>
    `);

    await expect.poll(() => page.evaluate(() =>
      Boolean((window as any).__fakeEventSources[0]?.listeners?.message?.length),
    )).toBe(true);
    await page.evaluate(() => {
      const source = (window as any).__fakeEventSources[0];
      source.emit("open", {});
      source.emit("message", { data: JSON.stringify({ kind: "msg", value: 7 }) });
    });

    await expect(page.getByTestId("log")).toHaveText("open|msg:7|");
  });

  test("does not connect while disabled", async ({ initTestBed, page }) => {
    await installFakeEventSource(page);
    await initTestBed(`<EventSource url="/stream" enabled="{false}" />`);
    await expect.poll(() => page.evaluate(() => (window as any).__fakeEventSources.length)).toBe(0);
  });

  test("passes text payloads and malformed JSON through unchanged", async ({
    initTestBed,
    page,
  }) => {
    await installFakeEventSource(page);
    await initTestBed(`
      <App var.log="">
        <EventSource
          url="/stream"
          onMessage="data => log = log + data + '|'" />
        <Text testId="log">{log}</Text>
      </App>
    `);

    await expect.poll(() => page.evaluate(() =>
      Boolean((window as any).__fakeEventSources[0]?.listeners?.message?.length),
    )).toBe(true);
    await page.evaluate(() => {
      const source = (window as any).__fakeEventSources[0];
      source.emit("message", { data: "plain" });
    });
    await expect(page.getByTestId("log")).toHaveText("plain|");
    await page.evaluate(() => {
      const source = (window as any).__fakeEventSources[0];
      source.emit("message", { data: "{broken" });
    });
    await expect(page.getByTestId("log")).toHaveText("plain|{broken|");
  });

  test("uses withCredentials and closes source on unmount", async ({ initTestBed, page }) => {
    await installFakeEventSource(page);
    await initTestBed(`
      <App var.enabled="{true}">
        <EventSource url="/stream" enabled="{enabled}" withCredentials="{true}" />
        <Button testId="disable" onClick="enabled = false">Disable</Button>
      </App>
    `);

    await expect.poll(() => page.evaluate(() => (window as any).__fakeEventSources.length)).toBe(1);
    await expect.poll(() => page.evaluate(() => (window as any).__fakeEventSources[0].withCredentials)).toBe(true);
    await page.getByTestId("disable").click();
    await expect.poll(() => page.evaluate(() => (window as any).__fakeEventSources[0].closed)).toBe(true);
  });

  test("fires error for non-closing errors and close for closed sources", async ({
    initTestBed,
    page,
  }) => {
    await installFakeEventSource(page);
    await initTestBed(`
      <App var.log="">
        <EventSource
          url="/stream"
          onError="log = log + 'error|'"
          onClose="log = log + 'close|'" />
        <Text testId="log">{log}</Text>
      </App>
    `);

    await expect.poll(() => page.evaluate(() =>
      Boolean((window as any).__fakeEventSources[0]?.listeners?.error?.length),
    )).toBe(true);
    await page.evaluate(() => {
      const source = (window as any).__fakeEventSources[0];
      source.readyState = 1;
      source.emit("error", {});
      source.readyState = 2;
      source.emit("error", {});
      source.emit("close", {});
    });

    await expect(page.getByTestId("log")).toHaveText("error|close|close|");
  });
});

async function installFakeEventSource(page: { addInitScript: (script: () => void) => Promise<void> }) {
  await page.addInitScript(() => {
    class FakeEventSource {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 2;
      url: string;
      withCredentials: boolean;
      readyState = 0;
      closed = false;
      listeners: Record<string, Array<(event: any) => void>> = {};
      constructor(url: string, options?: EventSourceInit) {
        this.url = url;
        this.withCredentials = Boolean(options?.withCredentials);
        (window as any).__fakeEventSources.push(this);
      }
      addEventListener(name: string, listener: (event: any) => void) {
        this.listeners[name] = [...(this.listeners[name] ?? []), listener];
      }
      close() {
        this.closed = true;
        this.readyState = 2;
      }
      emit(name: string, event: any) {
        for (const listener of this.listeners[name] ?? []) {
          listener(event);
        }
      }
    }
    (window as any).__fakeEventSources = [];
    (window as any).EventSource = FakeEventSource;
  });
}
