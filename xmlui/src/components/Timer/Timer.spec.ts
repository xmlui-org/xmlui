import { expect, test } from "../../testing/fixtures";

test.describe("Timer foundation", () => {
  test("renders hidden diagnostic attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Timer testId="timer" interval="{250}" initialDelay="{100}" once="true" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).not.toBeVisible();
    await expect(timer).toHaveAttribute("data-timer-enabled", "true");
    await expect(timer).toHaveAttribute("data-timer-interval", "250");
    await expect(timer).toHaveAttribute("data-timer-initial-delay", "100");
    await expect(timer).toHaveAttribute("data-timer-once", "true");
  });

  test("fires tick at interval", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tickCount="{0}">
        <Timer interval="{80}" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </App>
    `);

    await expect(page.getByTestId("counter")).toHaveText("0");
    await expect(page.getByTestId("counter")).toHaveText("1", { timeout: 500 });
  });

  test("once fires a single tick", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tickCount="{0}">
        <Timer interval="{60}" once="true" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </App>
    `);

    await expect(page.getByTestId("counter")).toHaveText("1", { timeout: 500 });
    await page.waitForTimeout(180);
    await expect(page.getByTestId("counter")).toHaveText("1");
  });

  test("pause and resume control ticking", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tickCount="{0}">
        <Timer id="clock" interval="{80}" onTick="tickCount++" />
        <Button testId="pause" onClick="clock.pause()">Pause</Button>
        <Button testId="resume" onClick="clock.resume()">Resume</Button>
        <Text testId="counter">{tickCount}</Text>
      </App>
    `);

    await expect.poll(async () => Number(await page.getByTestId("counter").textContent())).toBeGreaterThan(0);
    await page.getByTestId("pause").click();
    const pausedAt = await page.getByTestId("counter").textContent();
    await page.waitForTimeout(180);
    await expect(page.getByTestId("counter")).toHaveText(pausedAt ?? "");
    await page.getByTestId("resume").click();
    await expect.poll(async () => Number(await page.getByTestId("counter").textContent())).toBeGreaterThan(Number(pausedAt));
  });

  test("initialDelay waits before first cycle and only applies once", async ({
    initTestBed,
    page,
  }) => {
    await page.clock.install();
    await initTestBed(`
      <App var.tickCount="{0}">
        <Timer interval="{100}" initialDelay="{250}" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </App>
    `);

    await page.clock.fastForward(249);
    await expect(page.getByTestId("counter")).toHaveText("0");
    await page.clock.fastForward(100);
    await expect(page.getByTestId("counter")).toHaveText("1");
    await page.clock.fastForward(100);
    await expect(page.getByTestId("counter")).toHaveText("2");
  });

  test("enabled toggles restart ticking and reset pause state", async ({ initTestBed, page }) => {
    await page.clock.install();
    await initTestBed(`
      <App var.tickCount="{0}" var.enabled="{false}">
        <Timer id="clock" testId="timer" interval="{100}" enabled="{enabled}" onTick="tickCount++" />
        <Button testId="start" onClick="enabled = true">Start</Button>
        <Button testId="stop" onClick="enabled = false">Stop</Button>
        <Button testId="pause" onClick="clock.pause()">Pause</Button>
        <Text testId="counter">{tickCount}</Text>
        <Text testId="paused">state</Text>
      </App>
    `);

    await page.clock.fastForward(200);
    await expect(page.getByTestId("counter")).toHaveText("0");
    await page.getByTestId("start").click();
    await page.clock.fastForward(100);
    await expect(page.getByTestId("counter")).toHaveText("1");
    await page.getByTestId("pause").click();
    await expect(page.getByTestId("timer")).toHaveAttribute("data-timer-paused", "true");
    await page.getByTestId("stop").click();
    await page.getByTestId("start").click();
    await expect(page.getByTestId("timer")).toHaveAttribute("data-timer-paused", "false");
    await page.clock.fastForward(100);
    await expect(page.getByTestId("counter")).toHaveText("2");
  });

  test("prevents overlapping async tick handlers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.tickLog="">
        <Timer interval="{50}" onTick="tickLog = tickLog + '+'; delay(140); tickLog = tickLog + '-'" />
        <Text testId="log">{tickLog}</Text>
      </App>
    `);

    await expect(page.getByTestId("log")).toContainText("+", { timeout: 500 });
    await page.waitForTimeout(320);
    const log = await page.getByTestId("log").textContent();
    expect(log).not.toContain("++");
  });
});
