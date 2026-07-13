import { expect, test } from "../../testing/fixtures";

test.setTimeout(60_000);

test("timer stops and resumes when enabled is driven by a labeled Switch API value", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App var.count="{0}">
      <Switch id="enable" testId="enable" label="Enable Timer" initialValue="false" />
      <Text testId="counter">{count}</Text>
      <Timer
        id="timer"
        interval="75"
        onTick="count++"
        enabled="{enable.value}" />
    </App>
  `);

  const counter = page.getByTestId("counter");
  const enableSwitch = page.getByTestId("enable").getByRole("switch");
  const timer = page.locator("[data-xmlui-component='Timer']");

  await expect(counter).toHaveText("0");
  await expect(enableSwitch).not.toBeChecked();
  await expect(timer).toHaveAttribute("data-timer-enabled", "false");
  await page.waitForTimeout(200);
  await expect(counter).toHaveText("0");

  await enableSwitch.click();
  await expect(enableSwitch).toBeChecked();
  await expect(timer).toHaveAttribute("data-timer-enabled", "true");
  await expect
    .poll(async () => Number(await counter.textContent()), { timeout: 5000 })
    .toBeGreaterThan(0);

  await enableSwitch.click();
  await expect(enableSwitch).not.toBeChecked();
  await expect(timer).toHaveAttribute("data-timer-enabled", "false");
  const countAfterDisable = Number(await counter.textContent());
  expect(countAfterDisable).toBeGreaterThan(0);
  await page.waitForTimeout(250);
  await expect(counter).toHaveText(String(countAfterDisable));

  await enableSwitch.click();
  await expect(enableSwitch).toBeChecked();
  await expect(timer).toHaveAttribute("data-timer-enabled", "true");
  await expect
    .poll(async () => Number(await counter.textContent()), { timeout: 3000 })
    .toBeGreaterThan(countAfterDisable);
});
