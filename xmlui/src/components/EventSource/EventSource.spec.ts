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
});

test.describe("EventSource old-suite transfer debt", () => {
  test("close event path is re-closed with real streaming fixtures", async () => {
    test.fixme(true, "EventSource close behavior needs the streaming compatibility harness");
  });

  test("copy literal network/retry/error tests when streaming test services exist", async () => {
    test.fixme(true, "full old EventSource suite is deferred");
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
