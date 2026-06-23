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

    await expect(page.getByTestId("counter")).toHaveText("1", { timeout: 500 });
    await page.getByTestId("pause").click();
    const pausedAt = await page.getByTestId("counter").textContent();
    await page.waitForTimeout(180);
    await expect(page.getByTestId("counter")).toHaveText(pausedAt ?? "");
    await page.getByTestId("resume").click();
    await expect.poll(async () => Number(await page.getByTestId("counter").textContent())).toBeGreaterThan(Number(pausedAt));
  });
});

test.describe("Timer old-suite transfer debt", () => {
  test("copy the remaining literal old Timer timing and overlap tests", async () => {
    test.fixme(true, "full old Timer timing matrix is deferred");
  });
});
