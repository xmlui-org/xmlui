import { expect, test } from "../../testing/fixtures";

test("timer stops when enabled is driven by a labeled Switch API value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.count="{0}" var.disabledTicks="{0}">
      <Switch id="enable" testId="enable" label="Enable Timer" initialValue="true" />
      <Text testId="counter">{count}</Text>
      <Text testId="disabledTicks">{disabledTicks}</Text>
      <Timer
        id="timer"
        interval="250"
        onTick="
          count++;
          if (!enable.value) {
            disabledTicks++;
          }
        "
        enabled="{enable.value}" />
    </App>
  `);

  const counter = page.getByTestId("counter");
  const disabledTicks = page.getByTestId("disabledTicks");
  const enableSwitch = page.getByTestId("enable").getByRole("switch");
  const timer = page.locator("[data-xmlui-component='Timer']");

  await expect.poll(async () => Number(await counter.textContent()), { timeout: 3000 }).toBeGreaterThan(0);
  await expect(disabledTicks).toHaveText("0");

  await enableSwitch.click();
  await expect(enableSwitch).not.toBeChecked();
  await expect(timer).toHaveAttribute("data-timer-enabled", "false");

  await page.waitForTimeout(600);
  await expect(disabledTicks).toHaveText("0");
});
