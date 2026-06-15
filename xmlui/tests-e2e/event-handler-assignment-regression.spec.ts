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
