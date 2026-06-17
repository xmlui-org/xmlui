import type { Page } from "@playwright/test";

import { expect, test } from "../src/testing/fixtures";

async function installExternalBridge(
  page: Page,
  options: { syncValue?: Record<string, any> | null } = {},
) {
  await page.addInitScript((syncValue) => {
    const bridge = {
      emitters: [] as Array<(value: any) => void>,
      subscribeCount: 0,
      unsubscribeCount: 0,
    };

    (window as any).__externalBridge = bridge;
    (window as any).__externalSubscribe = (emit: (value: any) => void) => {
      bridge.subscribeCount++;
      bridge.emitters.push(emit);
      if (syncValue !== null) {
        emit(syncValue);
      }
      return () => {
        bridge.unsubscribeCount++;
      };
    };
    (window as any).__externalEmit = (value: any) => {
      bridge.emitters.forEach((emit) => emit(value));
    };
    (window as any).__externalStats = () => ({
      subscribeCount: bridge.subscribeCount,
      unsubscribeCount: bridge.unsubscribeCount,
      emitterCount: bridge.emitters.length,
    });
  }, "syncValue" in options ? options.syncValue : { label: "sync", tick: 1 });
}

test.describe("External", () => {
  test("exposes initial and emitted values through loader state", async ({ initTestBed, page }) => {
    await installExternalBridge(page, { syncValue: null });

    await initTestBed(`
      <Fragment>
        <External
          id="externalSource"
          initial="{{ label: 'initial', tick: 0 }}"
          subscribe="{window.__externalSubscribe}"
        />
        <Text
          testId="value"
          value="{externalSource.value.label + ':' + externalSource.value.tick}"
        />
        <Text
          testId="loaded"
          value="{externalSource.loaded ? 'loaded' : 'not-loaded'}"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("value")).toHaveText("initial:0");
    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    await expect.poll(() => page.evaluate(() => (window as any).__externalStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 0,
      emitterCount: 1,
    });

    await page.evaluate(() => {
      (window as any).__externalEmit({ label: "async", tick: 2 });
    });

    await expect(page.getByTestId("value")).toHaveText("async:2");
  });

  test("emitted values are observable by ChangeListener", async ({ initTestBed, page }) => {
    await installExternalBridge(page);

    await initTestBed(`
      <Fragment var.lastTick="{0}" var.changeCount="{0}">
        <External id="externalSource" subscribe="{window.__externalSubscribe}" />
        <ChangeListener
          listenTo="{externalSource.value.tick}"
          onDidChange="(change) => { lastTick = change.newValue; changeCount++; }"
        />
        <Text testId="lastTick" value="{lastTick}" />
        <Text testId="changeCount" value="{changeCount}" />
      </Fragment>
    `);

    await expect(page.getByTestId("lastTick")).toHaveText("1");
    await expect(page.getByTestId("changeCount")).toHaveText("1");

    await page.evaluate(() => {
      (window as any).__externalEmit({ label: "async", tick: 2 });
    });

    await expect(page.getByTestId("lastTick")).toHaveText("2");
    await expect(page.getByTestId("changeCount")).toHaveText("2");
  });

  test("calls unsubscribe when unmounted by a when condition", async ({ initTestBed, page }) => {
    await installExternalBridge(page);

    await initTestBed(`
      <Fragment var.showExternal="{true}">
        <External
          id="externalSource"
          when="{showExternal}"
          subscribe="{window.__externalSubscribe}"
        />
        <Button testId="toggle" label="Toggle" onClick="showExternal = !showExternal" />
        <Text
          testId="value"
          value="{externalSource.value ? externalSource.value.label : 'none'}"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("value")).toHaveText("sync");
    await expect.poll(() => page.evaluate(() => (window as any).__externalStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 0,
    });

    await page.getByTestId("toggle").click();

    await expect.poll(() => page.evaluate(() => (window as any).__externalStats())).toMatchObject({
      subscribeCount: 1,
      unsubscribeCount: 1,
    });
  });

  test("works inside App when preceded by a script tag", async ({ initTestBed, page }) => {
    await installExternalBridge(page);

    await initTestBed(`
      <App>
        <script>
          var greeting = "hello";
        </script>
        <External id="externalSource" subscribe="{window.__externalSubscribe}" />
        <Pages>
          <Page url="/">
            <Text
              testId="value"
              value="{greeting + ':' + externalSource.value.label + ':' + externalSource.value.tick}"
            />
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("value")).toHaveText("hello:sync:1");
  });
});
