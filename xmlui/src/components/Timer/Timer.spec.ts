import { expect, test } from "../../testing/fixtures";

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).toHaveAttribute("data-timer-enabled", "true");
    await expect(timer).toHaveAttribute("data-timer-interval", "1000");
  });

  test("component renders with enabled=false", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" enabled="false" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).toHaveAttribute("data-timer-enabled", "false");
    await expect(timer).toHaveAttribute("data-timer-running", "false");
  });

  test("component renders with custom interval", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" interval="500" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).toHaveAttribute("data-timer-interval", "500");
  });

  test("component renders with once=true", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" once="true" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).toHaveAttribute("data-timer-once", "true");
  });

  test("component renders with initial delay", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" initialDelay="500" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).toHaveAttribute("data-timer-initial-delay", "500");
  });

  test("component is not visible (non-visual component)", async ({ page, initTestBed }) => {
    await initTestBed(`<Timer testId="timer" />`);

    const timer = page.getByTestId("timer");
    await expect(timer).not.toBeVisible();
  });
});

test.describe("Event Handling", () => {
  test("timer tick event is called", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer interval="1000" enabled="true" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // Wait for a few ticks
    await expect(counter).toHaveText("0");
    
    // Wait for the first tick (1000ms + some buffer)
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Wait for the second tick
    await page.waitForTimeout(1000);
    await expect(counter).toHaveText("2");
  });

  test("timer stops when enabled is false", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerEnabled="{true}">
        <Timer interval="1000" enabled="{timerEnabled}" onTick="tickCount++" />
        <Button testId="stopButton" onClick="timerEnabled = false">Stop Timer</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const stopButton = page.getByTestId("stopButton");
    
    // Wait for the first tick
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Stop the timer
    await stopButton.click();
    
    // Wait and verify it doesn't increment
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText("1");
  });

  test("timer prevents overlapping events", async ({ page, initTestBed }) => {
    // This test verifies that a new tick event doesn't fire if the previous one hasn't completed
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.processingTime="{2000}">
        <Timer 
          interval="1000" 
          enabled="true" 
          onTick="
            tickCount++;
            delay(processingTime);
          " 
        />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // First tick should start and take 2000ms to complete
    // but interval is 1000ms, so second tick should not start until first completes
    await page.waitForTimeout(2500); // Wait for first tick to complete
    await expect(counter).toHaveText("1");
    
    // Wait a bit more to see if overlapping was prevented
    await page.waitForTimeout(1500); // Should be enough for second tick to start
    await expect(counter).toHaveText("2");
  });
});

test.describe("Initial Delay Functionality", () => {
  test("timer waits for initial delay before first tick", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer interval="1000" initialDelay="2000" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // Should not tick immediately
    await expect(counter).toHaveText("0");
    
    // Should not tick before initial delay
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText("0");
    
    // Should tick after initial delay
    await page.waitForTimeout(1000); // Total 2500ms, past the 2000ms initial delay + 1000ms interval
    await expect(counter).toHaveText("1");
    
    // Should continue ticking at interval
    await page.waitForTimeout(1000);
    await expect(counter).toHaveText("2");
  });

  test("initial delay only applies to first execution, not restarts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerEnabled="{true}">
        <Timer 
          interval="1000" 
          initialDelay="2000" 
          enabled="{timerEnabled}" 
          onTick="tickCount++" 
        />
        <Button testId="restartButton" onClick="timerEnabled = false; timerEnabled = true">Restart</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const restartButton = page.getByTestId("restartButton");
    
    // Wait for initial delay + first tick
    await page.waitForTimeout(3500);
    await expect(counter).toHaveText("1");
    
    // Restart the timer
    await restartButton.click();
    
    // After restart, should tick immediately without initial delay
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText("2");
  });

  test("initial delay works with once timer", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer interval="1000" initialDelay="2000" once="true" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // Should not tick before initial delay
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText("0");
    
    // Should tick once after initial delay
    await page.waitForTimeout(1000);
    await expect(counter).toHaveText("1");
    
    // Should not tick again
    await page.waitForTimeout(2000);
    await expect(counter).toHaveText("1");
  });
});

test.describe("Pause and Resume API", () => {
  test("timer can be paused and resumed via API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer 
          id="myTimer"
          interval="1000" 
          onTick="tickCount++" 
        />
        <Button testId="pauseButton" onClick="myTimer.pause()">Pause</Button>
        <Button testId="resumeButton" onClick="myTimer.resume()">Resume</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const pauseButton = page.getByTestId("pauseButton");
    const resumeButton = page.getByTestId("resumeButton");
    
    // Wait for first tick
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Pause the timer
    await pauseButton.click();
    
    // Should not tick while paused
    const currentCount = await counter.textContent();
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText(currentCount || "1");
    
    // Resume the timer
    await resumeButton.click();
    
    // Should continue ticking after resume
    await page.waitForTimeout(1200);
    const finalCount = parseInt(await counter.textContent() || "0");
    expect(finalCount).toBeGreaterThan(parseInt(currentCount || "1"));
  });

  test("pause during initial delay stops the delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer 
          id="myTimer"
          interval="1000" 
          initialDelay="3000"
          onTick="tickCount++" 
        />
        <Button testId="pauseButton" onClick="myTimer.pause()">Pause</Button>
        <Button testId="resumeButton" onClick="myTimer.resume()">Resume</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const pauseButton = page.getByTestId("pauseButton");
    const resumeButton = page.getByTestId("resumeButton");
    
    // Pause during initial delay
    await page.waitForTimeout(1000);
    await pauseButton.click();
    
    // Should not tick even after original delay would have passed
    await page.waitForTimeout(3000);
    await expect(counter).toHaveText("0");
    
    // Resume should start ticking
    await resumeButton.click();
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
  });

  test("pause state is reset when timer is disabled", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerEnabled="{true}">
        <Timer 
          id="myTimer"
          interval="1000" 
          enabled="{timerEnabled}"
          onTick="tickCount++" 
        />
        <Button testId="pauseButton" onClick="myTimer.pause()">Pause</Button>
        <Button testId="disableButton" onClick="timerEnabled = false">Disable</Button>
        <Button testId="enableButton" onClick="timerEnabled = true">Enable</Button>
        <Text testId="counter">{tickCount}</Text>
        <Text testId="paused">{myTimer.isPaused() ? 'Paused' : 'Running'}</Text>
      </Fragment>
    `);

    const pauseButton = page.getByTestId("pauseButton");
    const disableButton = page.getByTestId("disableButton");
    const enableButton = page.getByTestId("enableButton");
    const pausedStatus = page.getByTestId("paused");
    
    // Pause the timer
    await pauseButton.click();
    await expect(pausedStatus).toHaveText("Paused");
    
    // Disable the timer
    await disableButton.click();
    
    // Re-enable the timer - pause state should be reset
    await enableButton.click();
    await expect(pausedStatus).toHaveText("Running");
  });
});

test.describe("Once Functionality", () => {
  test("timer with once=true fires only once", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer interval="1000" once="true" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // Wait for the first tick
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Wait longer to ensure it doesn't tick again
    await page.waitForTimeout(2000);
    await expect(counter).toHaveText("1");
  });

  test("timer with once=true can be restarted by re-enabling", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerEnabled="{true}">
        <Timer interval="1000" once="true" enabled="{timerEnabled}" onTick="tickCount++" />
        <Button testId="restartButton" onClick="timerEnabled = false; timerEnabled = true">Restart</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const restartButton = page.getByTestId("restartButton");
    
    // Wait for the first tick
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Restart the timer
    await restartButton.click();
    
    // Wait for another tick
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("2");
  });

  test("once timer doesn't interfere with regular timer functionality", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}">
        <Timer interval="1000" once="false" onTick="tickCount++" />
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    
    // Wait for multiple ticks
    await page.waitForTimeout(3500);
    
    const finalCount = parseInt(await counter.textContent() || "0");
    expect(finalCount).toBeGreaterThan(2);
  });
});

test.describe("State Management", () => {
  test("timer can be dynamically enabled and disabled", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerEnabled="{false}">
        <Timer interval="1000" enabled="{timerEnabled}" onTick="tickCount++" />
        <Button testId="startButton" onClick="timerEnabled = true">Start Timer</Button>
        <Button testId="stopButton" onClick="timerEnabled = false">Stop Timer</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const startButton = page.getByTestId("startButton");
    const stopButton = page.getByTestId("stopButton");
    
    // Initially disabled - should not increment
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText("0");
    
    // Start the timer
    await startButton.click();
    await page.waitForTimeout(1200);
    await expect(counter).toHaveText("1");
    
    // Stop the timer again
    await stopButton.click();
    const currentCount = await counter.textContent();
    await page.waitForTimeout(1500);
    await expect(counter).toHaveText(currentCount || "1");
  });

  test("timer interval can be changed dynamically", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment var.tickCount="{0}" var.timerInterval="{2000}">
        <Timer interval="{timerInterval}" enabled="true" onTick="tickCount++" />
        <Button testId="fasterButton" onClick="timerInterval = 500">Faster</Button>
        <Text testId="counter">{tickCount}</Text>
      </Fragment>
    `);

    const counter = page.getByTestId("counter");
    const fasterButton = page.getByTestId("fasterButton");
    
    // Start with 2000ms interval
    await page.waitForTimeout(2500);
    await expect(counter).toHaveText("1");
    
    // Change to 500ms interval
    await fasterButton.click();
    await page.waitForTimeout(1500); // Should get multiple ticks quickly
    
    const finalCount = parseInt(await counter.textContent() || "0");
    expect(finalCount).toBeGreaterThan(1);
  });
});
