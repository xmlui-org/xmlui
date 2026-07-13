import { expect, test } from "../../testing/fixtures";

test("timer stops when enabled is driven by a labeled Switch API value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.count="{0}">
      <Text testId="counter">{count}</Text>
      <Timer
        id="timer"
        interval="50"
        onTick="count++;"
        enabled="{enable.value}" />
      <Switch id="enable" testId="enable" label="Enable Timer" initialValue="true" />
    </App>
  `);

  const counter = page.getByTestId("counter");
  await expect.poll(async () => Number(await counter.textContent())).toBeGreaterThan(0);

  await page.getByTestId("enable").getByRole("switch").click();
  await expect(page.locator("[data-xmlui-component='Timer']")).toHaveAttribute("data-timer-enabled", "false");
  await page.waitForTimeout(75);
  const stoppedAt = Number(await counter.textContent());

  await expect
    .poll(async () => Number(await counter.textContent()), {
      timeout: 1000,
      intervals: [100, 100, 100],
    })
    .toBe(stoppedAt);
});
