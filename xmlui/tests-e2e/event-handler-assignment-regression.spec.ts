import { expect, test } from "../src/testing/fixtures";

test("event callback can assign parenthesized logical-or RHS to App-level var", async ({
  initTestBed,
  page,
}) => {
  await page.addInitScript(() => {
    const callbacks: Record<string, (event: unknown) => void> = {};
    (window as any).subscribeTauriEvent = (
      _unsubKey: string,
      eventName: string,
      callback: (event: unknown) => void,
    ) => {
      callbacks[eventName] = callback;
    };
    (window as any).fireTauriEvent = (eventName: string, payload: unknown) => {
      callbacks[eventName]?.({ payload });
    };
  });

  await initTestBed(
    `
    <App var.activeTool="{null}">
      <Text testId="activeTool">{activeTool || 'none'}</Text>

      <Button testId="subscribe">
        <event name="click">
          subscribeTauriEvent('__bramActiveToolUnsub', 'active-tool-changed', (e) => {
            activeTool = (e &amp;&amp; e.payload &amp;&amp; e.payload.description) || null;
          });
        </event>
        Subscribe
      </Button>

      <Button testId="fireEvent">
        <event name="click">
          fireTauriEvent('active-tool-changed', { description: 'hammer' });
        </event>
        Fire event
      </Button>
    </App>
  `,
    {
      noFragmentWrapper: true,
    },
  );

  await expect(page.getByTestId("activeTool")).toHaveText("none");

  await page.getByTestId("subscribe").click();
  await page.getByTestId("fireEvent").click();

  await expect(page.getByTestId("activeTool")).toHaveText("hammer");
});

test("first host event updates state through a simple subscriber assignment", async ({
  initTestBed,
  page,
}) => {
  await page.addInitScript(() => {
    const callbacks: Record<string, (event: unknown) => void> = {};
    (window as any).subscribeTauriEvent = (
      _unsubKey: string,
      eventName: string,
      callback: (event: unknown) => void,
    ) => {
      callbacks[eventName] = callback;
    };
    (window as any).fireTauriEvent = (eventName: string, payload: unknown) => {
      callbacks[eventName]?.({ payload });
    };
  });

  await initTestBed(
    `
    <App var.menuTick="{0}">
      <Text testId="menuTick">{menuTick}</Text>

      <Button testId="subscribe">
        <event name="click">
          subscribeTauriEvent('__menuUnsub', 'menu-opened', (e) => {
            menuTick = menuTick + 1;
          });
        </event>
        Subscribe
      </Button>

      <Button testId="fireEvent">
        <event name="click">
          fireTauriEvent('menu-opened', { id: 1 });
        </event>
        Fire event
      </Button>
    </App>
  `,
    {
      noFragmentWrapper: true,
    },
  );

  await expect(page.getByTestId("menuTick")).toHaveText("0");

  await page.getByTestId("subscribe").click();
  await page.getByTestId("fireEvent").click();

  await expect(page.getByTestId("menuTick")).toHaveText("1");
});

test("subscriber callback error does not poison sibling host subscription", async ({
  initTestBed,
  page,
}) => {
  await page.addInitScript(() => {
    const callbacks: Record<string, (event: unknown) => void> = {};
    (window as any).subscribeTauriEvent = (
      _unsubKey: string,
      eventName: string,
      callback: (event: unknown) => void,
    ) => {
      callbacks[eventName] = callback;
    };
    (window as any).fireTauriEvent = (eventName: string, payload: unknown) => {
      callbacks[eventName]?.({ payload });
    };
  });

  await initTestBed(
    `
    <App var.activeTool="{null}">
      <Text testId="activeTool">{activeTool || 'none'}</Text>

      <Button testId="subscribe">
        <event name="click">
          subscribeTauriEvent('__badUnsub', 'bad-event', (e) => {
            missingCallbackTarget.value = e.payload.description;
          });
          subscribeTauriEvent('__goodUnsub', 'good-event', (e) => {
            activeTool = e.payload.description;
          });
        </event>
        Subscribe
      </Button>

      <Button testId="fireBad">
        <event name="click">
          fireTauriEvent('bad-event', { description: 'bad' });
        </event>
        Fire bad
      </Button>

      <Button testId="fireGood">
        <event name="click">
          fireTauriEvent('good-event', { description: 'saw' });
        </event>
        Fire good
      </Button>
    </App>
  `,
    {
      noFragmentWrapper: true,
    },
  );

  await expect(page.getByTestId("activeTool")).toHaveText("none");

  await page.getByTestId("subscribe").click();
  await page.getByTestId("fireBad").click();
  await page.getByTestId("fireGood").click();

  await expect(page.getByTestId("activeTool")).toHaveText("saw");
});

test("runtime handler failures include component context in console and Inspector trace", async ({
  initTestBed,
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  await initTestBed(
    `
    <App>
      <Button testId="fail" label="Fail" onClick="missingTarget.value = 1" />
    </App>
  `,
    {
      noFragmentWrapper: true,
      appGlobals: {
        xsVerbose: true,
      },
    },
  );

  await page.getByTestId("fail").click();

  await expect
    .poll(() => consoleErrors.join("\n"))
    .toContain("[XMLUI handler error] Button Fail.click failed.");
  expect(consoleErrors.join("\n")).toContain("The assignment target may not exist");

  const handlerError = await page.waitForFunction(() => {
    const logs = (window as any)._xsLogs ?? [];
    return logs.find((entry: any) => entry.kind === "handler:error");
  });
  const entry = await handlerError.jsonValue();

  expect(entry.eventName).toBe("click");
  expect(entry.componentType).toBe("Button");
  expect(entry.componentLabel).toBe("Fail");
  expect(entry.handlerCode).toContain("missingTarget.value = 1");
  expect(entry.diagnosticHint).toContain("Declare it with var.*");
});
