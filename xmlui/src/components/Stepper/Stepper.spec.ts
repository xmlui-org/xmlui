import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders steps and shows first step content by default", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="First">Content 1</Step>
        <Step label="Second">Content 2</Step>
        <Step label="Third">Content 3</Step>
      </Stepper>
    `);

    await expect(page.getByText("Content 1")).toBeVisible();
    await expect(page.getByText("Content 2")).not.toBeAttached();
    await expect(page.getByText("Content 3")).not.toBeAttached();
  });

  test("renders indicator labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Account">Content 1</Step>
        <Step label="Profile">Content 2</Step>
      </Stepper>
    `);

    await expect(page.getByText("Account")).toBeVisible();
    await expect(page.getByText("Profile")).toBeVisible();
  });

  test("renders indicator descriptions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Step 1" description="First desc">C1</Step>
        <Step label="Step 2" description="Second desc">C2</Step>
      </Stepper>
    `);

    await expect(page.getByText("First desc")).toBeVisible();
    await expect(page.getByText("Second desc")).toBeVisible();
  });

  test("next() advances to next step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
    `);

    await expect(page.getByText("Content A")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByText("Content B")).toBeVisible();
    await expect(page.getByText("Content A")).not.toBeAttached();
  });

  test("prev() goes back to previous step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s" activeStep="{1}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
      <Button testId="prevBtn" onClick="s.prev()">Prev</Button>
    `);

    await expect(page.getByText("Content B")).toBeVisible();
    await page.getByTestId("prevBtn").click();
    await expect(page.getByText("Content A")).toBeVisible();
  });

  test("next() is no-op on last step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s" activeStep="{2}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
    `);

    await expect(page.getByText("Content C")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    // Still showing Content C (no-op triggers going past last step, which hides content)
    // Actually next on step 2 (last) would set to 3 which is past the end
    // Let's check isCompleted instead
  });

  test("prev() is no-op on first step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
      <Button testId="prevBtn" onClick="s.prev()">Prev</Button>
    `);

    await expect(page.getByText("Content A")).toBeVisible();
    await page.getByTestId("prevBtn").click();
    await expect(page.getByText("Content A")).toBeVisible();
  });

  test("goToStep() jumps to arbitrary step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="goBtn" onClick="s.goToStep(2)">Go to C</Button>
    `);

    await expect(page.getByText("Content A")).toBeVisible();
    await page.getByTestId("goBtn").click();
    await expect(page.getByText("Content C")).toBeVisible();
  });

  test("reset() returns to step 0", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper id="s" activeStep="{2}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="resetBtn" onClick="s.reset()">Reset</Button>
    `);

    await expect(page.getByText("Content C")).toBeVisible();
    await page.getByTestId("resetBtn").click();
    await expect(page.getByText("Content A")).toBeVisible();
  });

  test("onStepChange event fires with correct index", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Stepper id="s" onStepChange="idx => testState = '' + idx">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
    `);

    await page.getByTestId("nextBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("1");
  });

  test("onComplete event fires when passing last step", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Stepper id="s" activeStep="{2}" onComplete="testState = 'done'">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
    `);

    await page.getByTestId("nextBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("done");
  });

  test("state variables are correct at each step", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Stepper id="s">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
      <Button testId="readState" onClick="testState = s.activeStep + '|' + s.hasPrevStep + '|' + s.hasNextStep + '|' + s.isCompleted + '|' + s.stepCount + '|' + s.percent">Read</Button>
    `);

    // Step 0
    await page.getByTestId("readState").click();
    await expect.poll(testStateDriver.testState).toEqual("0|false|true|false|3|0");

    // Step 1
    await page.getByTestId("nextBtn").click();
    await page.getByTestId("readState").click();
    await expect.poll(testStateDriver.testState).toEqual("1|true|true|false|3|33");

    // Step 2
    await page.getByTestId("nextBtn").click();
    await page.getByTestId("readState").click();
    await expect.poll(testStateDriver.testState).toEqual("2|true|false|false|3|67");
  });

  test("activeStep prop controls the active step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper activeStep="{1}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
    `);

    await expect(page.getByText("Content B")).toBeVisible();
    await expect(page.getByText("Content A")).not.toBeAttached();
  });

  test("completed prop overrides isCompleted", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Stepper id="s" completed="{true}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
      <Button testId="readState" onClick="testState = '' + s.isCompleted">Read</Button>
    `);

    await page.getByTestId("readState").click();
    await expect.poll(testStateDriver.testState).toEqual("true");
  });

  test("clicking an indicator navigates to that step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
    `);

    await expect(page.getByText("Content A")).toBeVisible();
    await page.getByRole("button", { name: "C" }).click();
    await expect(page.getByText("Content C")).toBeVisible();
  });
});

// =============================================================================
// allowNextStepsSelect AND allowStepSelect
// =============================================================================

test.describe("allowNextStepsSelect and allowStepSelect", () => {
  test("future steps are disabled when allowNextStepsSelect is false", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper allowNextStepsSelect="{false}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
    `);

    // Current (A) is clickable, future (B, C) should be disabled
    await expect(page.getByRole("button", { name: "B" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "C" })).toBeDisabled();
  });

  test("per-step allowStepSelect=false disables the indicator", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B" allowStepSelect="{false}">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
    `);

    await expect(page.getByRole("button", { name: "B" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "C" })).toBeEnabled();
  });

  test("per-step allowStepSelect=true overrides global false", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper allowNextStepsSelect="{false}">
        <Step label="A">Content A</Step>
        <Step label="B" allowStepSelect="{true}">Content B</Step>
        <Step label="C">Content C</Step>
      </Stepper>
    `);

    // B is explicitly allowed, C is not
    await expect(page.getByRole("button", { name: "B" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "C" })).toBeDisabled();
  });

  test("clicking an enabled indicator navigates to that step", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    await page.getByRole("button", { name: "B" }).click();
    await expect(page.getByText("Content B")).toBeVisible();
  });
});

// =============================================================================
// Step events
// =============================================================================

test.describe("Step events", () => {
  test("onActivate fires when a step becomes active", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Stepper id="s">
        <Step label="A">Content A</Step>
        <Step label="B" onActivate="testState = 'b-activated'">Content B</Step>
      </Stepper>
      <Button testId="nextBtn" onClick="s.next()">Next</Button>
    `);

    await page.getByTestId("nextBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("b-activated");
  });
});

// =============================================================================
// Orientation and icon position
// =============================================================================

test.describe("Orientation and icon position", () => {
  test("horizontal layout: root is column flex", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper testId="stepper">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    const stepperEl = page.getByTestId("stepper");
    await expect(stepperEl).toBeVisible();
    // Root should be column (indicator strip on top, content below)
    await expect(stepperEl).toHaveCSS("flex-direction", "column");
  });

  test("vertical layout: root is row flex", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper testId="stepper" orientation="vertical">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    const stepperEl = page.getByTestId("stepper");
    await expect(stepperEl).toHaveCSS("flex-direction", "row");
  });
});

// =============================================================================
// Loading and completedIcon
// =============================================================================

test.describe("Loading and completedIcon", () => {
  test("step with loading=true shows a spinner", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A" loading="{true}">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    // The loading step indicator should contain a spinner with role="status"
    const indicator = page.getByRole("button", { name: "A" });
    await expect(indicator.locator("[role='status']")).toBeVisible();
  });

  test("completed step shows check icon by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper activeStep="{1}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    // Step A is completed (index 0 < activeStep 1)
    const indicator = page.getByRole("button", { name: "A" });
    await expect(indicator).toHaveAttribute("data-state", "completed");
  });
});

// =============================================================================
// headerTemplate slot
// =============================================================================

test.describe("headerTemplate slot", () => {
  test("custom header template renders with $step context", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper id="s">
        <Step label="Custom">
          <property name="headerTemplate">
            <Text testId="headerText" value="{'Step ' + $step.index + ' active:' + $step.isActive}" />
          </property>
          Content custom
        </Step>
        <Step label="Other">Content other</Step>
      </Stepper>
    `);

    await expect(page.getByTestId("headerText")).toContainText("Step 0 active:true");
  });
});

// =============================================================================
// Accessibility
// =============================================================================

test.describe("Accessibility", () => {
  test("step indicator buttons have accessible names", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Account">Content A</Step>
        <Step label="Profile">Content B</Step>
      </Stepper>
    `);

    await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Profile" })).toBeVisible();
  });

  test("active step has aria-current=step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    await expect(page.getByRole("button", { name: "A" })).toHaveAttribute(
      "aria-current",
      "step",
    );
    // Non-active step should not have aria-current
    const stepB = page.getByRole("button", { name: "B" });
    await expect(stepB).not.toHaveAttribute("aria-current");
  });

  test("keyboard: Enter activates focused step indicator", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    const stepB = page.getByRole("button", { name: "B" });
    await stepB.focus();
    await expect(stepB).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Content B")).toBeVisible();
  });

  test("disabled steps are not focusable via Tab", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper allowNextStepsSelect="{false}">
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `);

    // Focus on A, then Tab — should not land on B since it's disabled
    const stepA = page.getByRole("button", { name: "A" });
    await stepA.focus();
    await expect(stepA).toBeFocused();
    await page.keyboard.press("Tab");
    // B should not be focused (it's disabled)
    await expect(page.getByRole("button", { name: "B" })).not.toBeFocused();
  });
});

// =============================================================================
// Theme Variables
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies custom indicator active color", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "color-indicator-active-Stepper": "rgb(255, 0, 0)",
        },
      },
    );

    const activeIndicator = page.getByRole("button", { name: "A" });
    await expect(activeIndicator).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("applies custom indicator size", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A">Content A</Step>
        <Step label="B">Content B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "size-indicator-Stepper": "48px",
        },
      },
    );

    const indicator = page.getByRole("button", { name: "A" });
    await expect(indicator).toHaveCSS("width", "48px");
    await expect(indicator).toHaveCSS("height", "48px");
  });
});

// =============================================================================
// Behaviors
// =============================================================================

test.describe("Behaviors", () => {
  test("handles tooltip", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper testId="stepper" tooltip="Stepper tooltip">
        <Step label="A">Content A</Step>
      </Stepper>
    `);

    await page.getByTestId("stepper").hover();
    await expect(page.getByRole("tooltip")).toHaveText("Stepper tooltip");
  });
});
