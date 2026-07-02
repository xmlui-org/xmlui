import type { Page } from "@playwright/test";

import { expect, test } from "../src/testing/fixtures";

async function installPushSourceBridge(
  page: Page,
  options: { syncValue?: Record<string, any> | null } = {},
) {
  await page.addInitScript((syncValue) => {
    const bridge = {
      emitters: [] as Array<(value: any) => void>,
      subscribeCount: 0,
      unsubscribeCount: 0,
    };

    (window as any).__pushSourceBridge = bridge;
    (window as any).__pushSourceSubscribe = (emit: (value: any) => void) => {
      bridge.subscribeCount++;
      bridge.emitters.push(emit);
      if (syncValue !== null) {
        emit(syncValue);
      }
      return () => {
        bridge.unsubscribeCount++;
      };
    };
    (window as any).__pushSourceEmit = (value: any) => {
      bridge.emitters.forEach((emit) => emit(value));
    };
    (window as any).__pushSourceStats = () => ({
      subscribeCount: bridge.subscribeCount,
      unsubscribeCount: bridge.unsubscribeCount,
      emitterCount: bridge.emitters.length,
    });
  }, "syncValue" in options ? options.syncValue : { label: "sync", tick: 1 });
}

test.describe("PushSource", () => {
  test("exposes initial and emitted values through loader state", async ({ initTestBed, page }) => {
    await installPushSourceBridge(page, { syncValue: null });

    await initTestBed(`
      <Fragment>
        <PushSource
          id="pushSource"
          initial="{{ label: 'initial', tick: 0 }}"
          subscribe="{window.__pushSourceSubscribe}"
        />
        <Text
          testId="value"
          value="{pushSource.value.label + ':' + pushSource.value.tick}"
        />
        <Text
          testId="loaded"
          value="{pushSource.loaded ? 'loaded' : 'not-loaded'}"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("value")).toHaveText("initial:0");
    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    await expect.poll(() => page.evaluate(() => (window as any).__pushSourceStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 0,
      emitterCount: 1,
    });

    await page.evaluate(() => {
      (window as any).__pushSourceEmit({ label: "async", tick: 2 });
    });

    await expect(page.getByTestId("value")).toHaveText("async:2");
  });

  test("emitted values are observable by ChangeListener", async ({ initTestBed, page }) => {
    await installPushSourceBridge(page);

    await initTestBed(`
      <Fragment var.lastTick="{0}" var.changeCount="{0}">
        <PushSource id="pushSource" subscribe="{window.__pushSourceSubscribe}" />
        <ChangeListener
          listenTo="{pushSource.value.tick}"
          onDidChange="(change) => { lastTick = change.newValue; changeCount++; }"
        />
        <Text testId="lastTick" value="{lastTick}" />
        <Text testId="changeCount" value="{changeCount}" />
      </Fragment>
    `);

    await expect(page.getByTestId("lastTick")).toHaveText("1");
    await expect(page.getByTestId("changeCount")).toHaveText("1");

    await page.evaluate(() => {
      (window as any).__pushSourceEmit({ label: "async", tick: 2 });
    });

    await expect(page.getByTestId("lastTick")).toHaveText("2");
    await expect(page.getByTestId("changeCount")).toHaveText("2");
  });

  test("calls unsubscribe when unmounted by a when condition", async ({ initTestBed, page }) => {
    await installPushSourceBridge(page);

    await initTestBed(`
      <Fragment var.showPushSource="{true}">
        <PushSource
          id="pushSource"
          when="{showPushSource}"
          subscribe="{window.__pushSourceSubscribe}"
        />
        <Button testId="toggle" label="Toggle" onClick="showPushSource = !showPushSource" />
        <Text
          testId="value"
          value="{pushSource.value ? pushSource.value.label : 'none'}"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("value")).toHaveText("sync");
    await expect.poll(() => page.evaluate(() => (window as any).__pushSourceStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 0,
    });

    await page.getByTestId("toggle").click();

    await expect.poll(() => page.evaluate(() => (window as any).__pushSourceStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 1,
    });
  });

  test("works inside App when preceded by a script tag", async ({ initTestBed, page }) => {
    await installPushSourceBridge(page);

    await initTestBed(`
      <App>
        <script>
          var greeting = "hello";
        </script>
        <PushSource id="pushSource" subscribe="{window.__pushSourceSubscribe}" />
        <Pages>
          <Page url="/">
            <Text
              testId="value"
              value="{greeting + ':' + pushSource.value.label + ':' + pushSource.value.tick}"
            />
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("value")).toHaveText("hello:sync:1");
  });
});
