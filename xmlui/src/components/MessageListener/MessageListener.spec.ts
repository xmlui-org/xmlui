import { expect, test } from "../../testing/fixtures";

test.describe("MessageListener foundation", () => {
  test("receives messages via window.postMessage", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.msg="none">
        <MessageListener onMessageReceived="data => msg = data" />
        <Text testId="msg">{msg}</Text>
      </App>
    `);

    await expect(page.getByTestId("msg")).toHaveText("none");
    await page.evaluate(() => window.postMessage("hello", "*"));
    await expect(page.getByTestId("msg")).toHaveText("hello");
  });

  test("passes object payloads", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.msg="none">
        <MessageListener onMessageReceived="data => msg = data.kind + ':' + data.value" />
        <Text testId="msg">{msg}</Text>
      </App>
    `);

    await page.evaluate(() => window.postMessage({ kind: "test", value: 42 }, "*"));
    await expect(page.getByTestId("msg")).toHaveText("test:42");
  });

  test("renders children without wrapper elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="stack">
        <MessageListener>
          <Text testId="one">One</Text>
          <Text testId="two">Two</Text>
        </MessageListener>
        <Text testId="three">Three</Text>
      </VStack>
    `);

    await expect(page.getByTestId("one")).toBeVisible();
    await expect(page.getByTestId("two")).toBeVisible();
    await expect(page.getByTestId("three")).toBeVisible();
    await expect.poll(async () =>
      page.evaluate(() => {
        const one = document.querySelector('[data-testid="one"]');
        const two = document.querySelector('[data-testid="two"]');
        const three = document.querySelector('[data-testid="three"]');
        return one?.parentElement === two?.parentElement && two?.parentElement === three?.parentElement;
      }),
    ).toBe(true);
  });
});

test.describe("MessageListener old-suite transfer debt", () => {
  test("copy remaining literal layout/accessibility edge cases", async () => {
    test.fixme(true, "full old MessageListener suite is deferred");
  });
});
