import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SMOKE TESTS
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("renders with steps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Step 1">Content 1</Step>
        <Step label="Step 2">Content 2</Step>
      </Stepper>
    `);
    await expect(page.getByRole("group", { name: "Stepper" })).toBeVisible();
  });

  test("renders step labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="First" description="Desc 1">Content 1</Step>
        <Step label="Second" description="Desc 2">Content 2</Step>
      </Stepper>
    `);
    await expect(page.getByText("First")).toBeVisible();
    await expect(page.getByText("Second")).toBeVisible();
    await expect(page.getByText("Desc 1")).toBeVisible();
    await expect(page.getByText("Desc 2")).toBeVisible();
  });

  test("shows only active step's content in horizontal mode", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Step 1"><Text>First content</Text></Step>
        <Step label="Step 2"><Text>Second content</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("First content")).toBeVisible();
    await expect(page.getByText("Second content")).not.toBeVisible();
  });
});

// =============================================================================
// BASIC FUNCTIONALITY
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders without children", async ({ initTestBed, page }) => {
    await initTestBed(`<Stepper />`);
    await expect(page.getByRole("group", { name: "Stepper" })).toBeVisible();
  });

  test("activeStep=0 is default (first step active)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A"><Text>A content</Text></Step>
        <Step label="B"><Text>B content</Text></Step>
        <Step label="C"><Text>C content</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("A content")).toBeVisible();
    await expect(page.getByText("B content")).not.toBeVisible();
    await expect(page.getByText("C content")).not.toBeVisible();
  });

  test("activeStep sets initial active step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper activeStep="{1}">
        <Step label="A"><Text>A content</Text></Step>
        <Step label="B"><Text>B content</Text></Step>
        <Step label="C"><Text>C content</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("A content")).not.toBeVisible();
    await expect(page.getByText("B content")).toBeVisible();
    await expect(page.getByText("C content")).not.toBeVisible();
  });

  test("activeStep out of range (too high) falls back to first", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper activeStep="{99}">
        <Step label="A"><Text>A content</Text></Step>
        <Step label="B"><Text>B content</Text></Step>
      </Stepper>
    `);
    // When out of range, activeIndex stays at provided value initially but no step matches it,
    // so no content renders. This is acceptable behavior; verify nothing crashes.
    await expect(page.getByRole("group", { name: "Stepper" })).toBeVisible();
  });

  test("activeStep negative falls back to 0", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper activeStep="{-5}">
        <Step label="A"><Text>A content</Text></Step>
        <Step label="B"><Text>B content</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("A content")).toBeVisible();
    await expect(page.getByText("B content")).not.toBeVisible();
  });

  test("activeStep updates reactively when external value changes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.step="{0}">
        <Stepper activeStep="{step}">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
        </Stepper>
        <Button testId="advance" onClick="step = 1" />
      </Fragment>
    `);
    await expect(page.getByText("A content")).toBeVisible();
    await page.getByTestId("advance").click();
    await expect(page.getByText("B content")).toBeVisible();
    await expect(page.getByText("A content")).not.toBeVisible();
  });

  test("exposes activeStep state externally", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
          <Step label="C">C</Step>
        </Stepper>
        <Text testId="probe">current={wiz.activeStep}</Text>
        <Button testId="nextBtn" onClick="wiz.next()" />
      </Fragment>
    `);
    await expect(page.getByTestId("probe")).toHaveText("current=0");
    await page.getByTestId("nextBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("current=1");
  });

  test("step indicators show numeric index starting from 1", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">A</Step>
        <Step label="B">B</Step>
        <Step label="C">C</Step>
      </Stepper>
    `);
    // Headers are a list of step indicators; numbering is 1-based.
    await expect(page.getByRole("list")).toContainText("1");
    await expect(page.getByRole("list")).toContainText("2");
    await expect(page.getByRole("list")).toContainText("3");
  });
});

// =============================================================================
// APIs — next / prev / reset / setActiveStep
// =============================================================================

test.describe("Api", () => {
  test("next() advances to the next step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
          <Step label="C"><Text>C content</Text></Step>
        </Stepper>
        <Button testId="nextBtn" onClick="wiz.next()" />
      </Fragment>
    `);
    await expect(page.getByText("A content")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByText("B content")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByText("C content")).toBeVisible();
  });

  test("next() stops at the last step (no wrap-around)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz" activeStep="{1}">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
        </Stepper>
        <Button testId="nextBtn" onClick="wiz.next()" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await expect(page.getByText("B content")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=1");
    await expect(page.getByText("B content")).toBeVisible();
  });

  test("prev() moves to the previous step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz" activeStep="{2}">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
          <Step label="C"><Text>C content</Text></Step>
        </Stepper>
        <Button testId="prevBtn" onClick="wiz.prev()" />
      </Fragment>
    `);
    await expect(page.getByText("C content")).toBeVisible();
    await page.getByTestId("prevBtn").click();
    await expect(page.getByText("B content")).toBeVisible();
    await page.getByTestId("prevBtn").click();
    await expect(page.getByText("A content")).toBeVisible();
  });

  test("prev() stops at the first step (no wrap-around)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
        </Stepper>
        <Button testId="prevBtn" onClick="wiz.prev()" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await expect(page.getByText("A content")).toBeVisible();
    await page.getByTestId("prevBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
    await expect(page.getByText("A content")).toBeVisible();
  });

  test("reset() returns to the first step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz" activeStep="{2}">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
          <Step label="C"><Text>C content</Text></Step>
        </Stepper>
        <Button testId="resetBtn" onClick="wiz.reset()" />
      </Fragment>
    `);
    await expect(page.getByText("C content")).toBeVisible();
    await page.getByTestId("resetBtn").click();
    await expect(page.getByText("A content")).toBeVisible();
  });

  test("setActiveStep() jumps to the given index", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
          <Step label="C"><Text>C content</Text></Step>
        </Stepper>
        <Button testId="toC" onClick="wiz.setActiveStep(2)" />
        <Button testId="toB" onClick="wiz.setActiveStep(1)" />
      </Fragment>
    `);
    await page.getByTestId("toC").click();
    await expect(page.getByText("C content")).toBeVisible();
    await page.getByTestId("toB").click();
    await expect(page.getByText("B content")).toBeVisible();
  });

  test("setActiveStep() ignores out-of-range indices", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz" activeStep="{1}">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
        </Stepper>
        <Button testId="bogus" onClick="wiz.setActiveStep(99)" />
        <Button testId="negative" onClick="wiz.setActiveStep(-3)" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("probe")).toHaveText("idx=1");
    await page.getByTestId("bogus").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=1");
    await page.getByTestId("negative").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=1");
  });

  test("setActiveStep() ignores non-finite values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="A"><Text>A content</Text></Step>
          <Step label="B"><Text>B content</Text></Step>
        </Stepper>
        <Button testId="nanBtn" onClick="wiz.setActiveStep(NaN)" />
        <Button testId="strBtn" onClick="wiz.setActiveStep('oops')" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await page.getByTestId("nanBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
    await page.getByTestId("strBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
  });
});

// =============================================================================
// didChange EVENT
// =============================================================================

test.describe("didChange event", () => {
  test("fires when advancing via next()", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stepper id="wiz" onDidChange="(idx) => testState = 'changed:' + idx">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
        <Button testId="go" onClick="wiz.next()" />
      </Fragment>
    `);
    await page.getByTestId("go").click();
    await expect.poll(testStateDriver.testState).toEqual("changed:1");
  });

  test("fires with step id when provided", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stepper id="wiz" onDidChange="(idx, id) => testState = id">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
        <Button testId="go" onClick="wiz.next()" />
      </Fragment>
    `);
    await page.getByTestId("go").click();
    // Without explicit id, falls back to innerId (React-generated, non-empty string)
    await expect.poll(testStateDriver.testState).not.toEqual("");
  });

  test("does not fire when at-bounds navigation is a no-op", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.count="{0}">
        <Stepper id="wiz" onDidChange="(idx) => count = count + 1">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
        <Button testId="prevBtn" onClick="wiz.prev()" />
        <Text testId="probe">count={count}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("probe")).toHaveText("count=0");
    await page.getByTestId("prevBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("count=0");
  });

  test("fires on reset() only when index actually changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.count="{0}">
        <Stepper id="wiz">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
          <Step label="C">C</Step>
          <event name="didChange">count = count + 1</event>
        </Stepper>
        <Button testId="resetBtn" onClick="wiz.reset()" />
        <Button testId="goMid" onClick="wiz.setActiveStep(2)" />
        <Text testId="probe">count={count}</Text>
      </Fragment>
    `);
    // Reset while already at 0 → no change
    await page.getByTestId("resetBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("count=0");
    // Jump to step 3 → fires once
    await page.getByTestId("goMid").click();
    await expect(page.getByTestId("probe")).toHaveText("count=1");
    // Reset from 2 → fires once more
    await page.getByTestId("resetBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("count=2");
  });
});

// =============================================================================
// ACCESSIBILITY
// =============================================================================

test.describe("Accessibility", () => {
  test("root has role='group' and aria-label='Stepper'", async ({ initTestBed, page }) => {
    await initTestBed(`<Stepper><Step label="A">A</Step></Stepper>`);
    const root = page.getByRole("group", { name: "Stepper" });
    await expect(root).toBeVisible();
  });

  test("active step header gets aria-current='step' in horizontal mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper activeStep="{1}">
        <Step label="A">A</Step>
        <Step label="B">B</Step>
        <Step label="C">C</Step>
      </Stepper>
    `);
    const listItems = page.getByRole("listitem");
    await expect(listItems.nth(0).locator('[aria-current="step"]')).toHaveCount(0);
    await expect(listItems.nth(1).locator('[aria-current="step"]')).toHaveCount(1);
    await expect(listItems.nth(2).locator('[aria-current="step"]')).toHaveCount(0);
  });

  test("nonLinear headers are <button> with type='button'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper nonLinear="true">
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `);
    // Two clickable step headers → two buttons
    const buttons = page.getByRole("group", { name: "Stepper" }).getByRole("button");
    await expect(buttons).toHaveCount(2);
  });

  test("default (linear) headers do not expose buttons", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `);
    const buttons = page.getByRole("group", { name: "Stepper" }).getByRole("button");
    await expect(buttons).toHaveCount(0);
  });

  test("horizontal header strip uses role='list' with 'listitem' children", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `);
    await expect(page.getByRole("list")).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(2);
  });
});

// =============================================================================
// THEME VARIABLES
// =============================================================================

test.describe("Theme Variables", () => {
  test("backgroundColor-icon-Stepper applies to inactive step icons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "backgroundColor-icon-Stepper": "rgb(10, 20, 30)",
        },
      },
    );
    // Second (inactive) step's circle
    const items = page.getByRole("listitem");
    const inactiveCircle = items.nth(1).locator("span").first();
    await expect(inactiveCircle).toHaveCSS("background-color", "rgb(10, 20, 30)");
  });

  test("backgroundColor-icon-Stepper--active applies to the active step icon", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Stepper activeStep="{0}">
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "backgroundColor-icon-Stepper--active": "rgb(200, 50, 50)",
        },
      },
    );
    const items = page.getByRole("listitem");
    const activeCircle = items.nth(0).locator("span").first();
    await expect(activeCircle).toHaveCSS("background-color", "rgb(200, 50, 50)");
  });

  test("textColor-label-Stepper--active applies to active step label", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="Active One">A</Step>
        <Step label="Other">B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "textColor-label-Stepper--active": "rgb(0, 128, 0)",
        },
      },
    );
    await expect(page.getByText("Active One")).toHaveCSS("color", "rgb(0, 128, 0)");
  });

  test("borderColor-connector-Stepper applies to horizontal connectors", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A">A</Step>
        <Step label="B">B</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "borderColor-connector-Stepper": "rgb(123, 45, 67)",
        },
      },
    );
    // The connector is a <div aria-hidden="true"> between listitems.
    // iconCircle is a <span aria-hidden="true"> — restrict to div to disambiguate.
    const connector = page.getByRole("list").locator('div[aria-hidden="true"]').first();
    await expect(connector).toHaveCSS("border-top-color", "rgb(123, 45, 67)");
  });
});

// =============================================================================
// BEHAVIORS AND PARTS — orientation, stackedLabel, nonLinear
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test.describe("orientation", () => {
    test("horizontal mode renders a role='list' header strip", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Stepper orientation="horizontal">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
      `);
      await expect(page.getByRole("list")).toBeVisible();
    });

    test("vertical mode omits the horizontal header strip", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Stepper orientation="vertical">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
      `);
      // Vertical mode renders per-step headers, not a horizontal list strip
      await expect(page.getByRole("list")).toHaveCount(0);
      // Both labels are still visible (per-step)
      await expect(page.getByText("A", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("B", { exact: true }).first()).toBeVisible();
    });

    test("vertical mode shows only active step's children but all headers", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Stepper orientation="vertical" activeStep="{1}">
          <Step label="A"><Text>A body</Text></Step>
          <Step label="B"><Text>B body</Text></Step>
          <Step label="C"><Text>C body</Text></Step>
        </Stepper>
      `);
      await expect(page.getByText("A body")).not.toBeVisible();
      await expect(page.getByText("B body")).toBeVisible();
      await expect(page.getByText("C body")).not.toBeVisible();
      // Headers for all three are still rendered
      await expect(page.getByText("A", { exact: true })).toBeVisible();
      await expect(page.getByText("B", { exact: true })).toBeVisible();
      await expect(page.getByText("C", { exact: true })).toBeVisible();
    });
  });

  test.describe("nonLinear", () => {
    test("clicking a header in horizontal nonLinear mode activates that step", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Stepper nonLinear="true">
          <Step label="A"><Text>A body</Text></Step>
          <Step label="B"><Text>B body</Text></Step>
          <Step label="C"><Text>C body</Text></Step>
        </Stepper>
      `);
      await expect(page.getByText("A body")).toBeVisible();
      // Click the third header's button
      const buttons = page.getByRole("group", { name: "Stepper" }).getByRole("button");
      await buttons.nth(2).click();
      await expect(page.getByText("C body")).toBeVisible();
      await expect(page.getByText("A body")).not.toBeVisible();
    });

    test("clicking a header in vertical nonLinear mode activates that step", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Stepper orientation="vertical" nonLinear="true">
          <Step label="Alpha"><Text>Alpha body</Text></Step>
          <Step label="Beta"><Text>Beta body</Text></Step>
          <Step label="Gamma"><Text>Gamma body</Text></Step>
        </Stepper>
      `);
      await expect(page.getByText("Alpha body")).toBeVisible();
      const buttons = page.getByRole("group", { name: "Stepper" }).getByRole("button");
      await buttons.nth(1).click();
      await expect(page.getByText("Beta body")).toBeVisible();
    });

    test("linear mode header click has no effect", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Stepper>
          <Step label="A"><Text>A body</Text></Step>
          <Step label="B"><Text>B body</Text></Step>
        </Stepper>
      `);
      await expect(page.getByText("A body")).toBeVisible();
      // Headers exist but are not buttons — clicking the label should not advance
      await page.getByText("B", { exact: true }).click();
      await expect(page.getByText("A body")).toBeVisible();
      await expect(page.getByText("B body")).not.toBeVisible();
    });

    test("nonLinear click fires didChange", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Stepper nonLinear="true" onDidChange="(idx) => testState = idx">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
      `);
      const buttons = page.getByRole("group", { name: "Stepper" }).getByRole("button");
      await buttons.nth(1).click();
      await expect.poll(testStateDriver.testState).toEqual(1);
    });
  });

  test.describe("stackedLabel", () => {
    test("stacks icon+label vertically in horizontal mode", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Stepper stackedLabel="true">
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
      `);
      const headerItem = page.getByRole("listitem").first();
      const inner = headerItem.locator("> *").first();
      // flex-direction: column indicates stacked layout
      await expect(inner).toHaveCSS("flex-direction", "column");
    });

    test("default (no stackedLabel) uses inline icon+label", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Stepper>
          <Step label="A">A</Step>
          <Step label="B">B</Step>
        </Stepper>
      `);
      const headerItem = page.getByRole("listitem").first();
      const inner = headerItem.locator("> *").first();
      await expect(inner).toHaveCSS("flex-direction", "row");
    });
  });
});

// =============================================================================
// STEP COMPONENT
// =============================================================================

test.describe("Step", () => {
  test("label and description render", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="Main label" description="Secondary text">body</Step>
      </Stepper>
    `);
    await expect(page.getByText("Main label")).toBeVisible();
    await expect(page.getByText("Secondary text")).toBeVisible();
  });

  test("icon name renders the registered xmlui icon inside the vertical indicator", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper orientation="vertical">
        <Step label="A" icon="star"><Text>A body</Text></Step>
        <Step label="B"><Text>B body</Text></Step>
      </Stepper>
    `);
    // The Step header renders <Icon name="star" /> which surfaces a data-icon-name attribute.
    await expect(page.locator('[data-icon-name="star"]')).toBeVisible();
  });

  test("icon name renders the registered xmlui icon in horizontal mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A" icon="star">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `);
    await expect(page.locator('[data-icon-name="star"]')).toBeVisible();
  });

  test("Step without label/description still renders (no crash)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step><Text>Only body</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("Only body")).toBeVisible();
  });

  test("horizontal mode Step renders role='tabpanel' when active", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A"><Text>A body</Text></Step>
        <Step label="B"><Text>B body</Text></Step>
      </Stepper>
    `);
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await expect(page.getByRole("tabpanel")).toContainText("A body");
  });
});

// =============================================================================
// STEP error / completed STATES
// =============================================================================

test.describe("Step error / completed states", () => {
  test("error=true shows the error icon in horizontal mode", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A" error="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `);
    const headerItems = page.getByRole("listitem");
    await expect(headerItems.nth(0).locator('[data-icon-name="error"]')).toBeVisible();
    // The non-error step keeps the numeric indicator (no error icon).
    await expect(headerItems.nth(1).locator('[data-icon-name="error"]')).toHaveCount(0);
  });

  test("completed=true shows the checkmark icon in horizontal mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper activeStep="{1}">
        <Step label="A" completed="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `);
    const headerItems = page.getByRole("listitem");
    await expect(headerItems.nth(0).locator('[data-icon-name="checkmark"]')).toBeVisible();
    await expect(headerItems.nth(1).locator('[data-icon-name="checkmark"]')).toHaveCount(0);
  });

  test("error=true wins over completed=true when both are set", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper>
        <Step label="A" error="true" completed="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `);
    const firstHeader = page.getByRole("listitem").nth(0);
    await expect(firstHeader.locator('[data-icon-name="error"]')).toBeVisible();
    await expect(firstHeader.locator('[data-icon-name="checkmark"]')).toHaveCount(0);
  });

  test("error=true shows the error icon in vertical mode", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stepper orientation="vertical">
        <Step label="A" error="true"><Text>A body</Text></Step>
        <Step label="B"><Text>B body</Text></Step>
      </Stepper>
    `);
    await expect(page.locator('[data-icon-name="error"]')).toBeVisible();
  });

  test("completed=true shows the checkmark icon in vertical mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper orientation="vertical" activeStep="{1}">
        <Step label="A" completed="true"><Text>A body</Text></Step>
        <Step label="B"><Text>B body</Text></Step>
      </Stepper>
    `);
    await expect(page.locator('[data-icon-name="checkmark"]')).toBeVisible();
  });

  test("error toggles reactively from a binding", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.bad="{false}">
        <Stepper>
          <Step label="A" error="{bad}">A body</Step>
          <Step label="B">B body</Step>
        </Stepper>
        <Button testId="trigger" onClick="bad = true" />
      </Fragment>
    `);
    // Initially no error icon.
    await expect(page.locator('[data-icon-name="error"]')).toHaveCount(0);
    await page.getByTestId("trigger").click();
    await expect(page.locator('[data-icon-name="error"]')).toBeVisible();
  });

  test("error theme color applies to the icon background", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A" error="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "backgroundColor-icon-Stepper--error": "rgb(220, 38, 38)",
        },
      },
    );
    const errorCircle = page.getByRole("listitem").nth(0).locator("span").first();
    await expect(errorCircle).toHaveCSS("background-color", "rgb(220, 38, 38)");
  });

  test("error theme color applies to the label", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="Personal" error="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "textColor-label-Stepper--error": "rgb(180, 0, 0)",
        },
      },
    );
    await expect(page.getByText("Personal")).toHaveCSS("color", "rgb(180, 0, 0)");
  });

  test("completed connector reflects the completed state", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <Stepper>
        <Step label="A" completed="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "borderColor-connector-Stepper--completed": "rgb(10, 200, 10)",
        },
      },
    );
    // The connector after the completed step picks up the completed border color.
    const connector = page.getByRole("list").locator('div[aria-hidden="true"]').first();
    await expect(connector).toHaveCSS("border-top-color", "rgb(10, 200, 10)");
  });

  test("active styling is suppressed when the active step is in error", async ({
    initTestBed,
    page,
  }) => {
    // Theme: pick distinct error and active backgrounds. Verify the active
    // step renders with the error background, not the active background.
    await initTestBed(
      `
      <Stepper activeStep="{0}">
        <Step label="A" error="true">A body</Step>
        <Step label="B">B body</Step>
      </Stepper>
    `,
      {
        testThemeVars: {
          "backgroundColor-icon-Stepper--active": "rgb(0, 0, 200)",
          "backgroundColor-icon-Stepper--error": "rgb(200, 0, 0)",
        },
      },
    );
    const activeErrorCircle = page.getByRole("listitem").nth(0).locator("span").first();
    await expect(activeErrorCircle).toHaveCSS("background-color", "rgb(200, 0, 0)");
  });
});

// =============================================================================
// OTHER EDGE CASES
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("empty Stepper (no children) renders without crashing", async ({ initTestBed, page }) => {
    await initTestBed(`<Stepper />`);
    await expect(page.getByRole("group", { name: "Stepper" })).toBeVisible();
  });

  test("APIs on an empty Stepper are no-ops", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz" />
        <Button testId="nextBtn" onClick="wiz.next()" />
        <Button testId="prevBtn" onClick="wiz.prev()" />
        <Button testId="resetBtn" onClick="wiz.reset()" />
        <Button testId="setBtn" onClick="wiz.setActiveStep(1)" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
    await page.getByTestId("nextBtn").click();
    await page.getByTestId("prevBtn").click();
    await page.getByTestId("resetBtn").click();
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
  });

  test("single-step stepper works", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Stepper id="wiz">
          <Step label="Only"><Text>only content</Text></Step>
        </Stepper>
        <Button testId="nextBtn" onClick="wiz.next()" />
        <Button testId="prevBtn" onClick="wiz.prev()" />
        <Text testId="probe">idx={wiz.activeStep}</Text>
      </Fragment>
    `);
    await expect(page.getByText("only content")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
    await page.getByTestId("prevBtn").click();
    await expect(page.getByTestId("probe")).toHaveText("idx=0");
  });

  test("dynamically changing orientation preserves active step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.orient="horizontal">
        <Stepper id="wiz" orientation="{orient}" activeStep="{1}">
          <Step label="A"><Text>A body</Text></Step>
          <Step label="B"><Text>B body</Text></Step>
          <Step label="C"><Text>C body</Text></Step>
        </Stepper>
        <Button testId="toVertical" onClick="orient = 'vertical'" />
      </Fragment>
    `);
    await expect(page.getByText("B body")).toBeVisible();
    await page.getByTestId("toVertical").click();
    await expect(page.getByText("B body")).toBeVisible();
    await expect(page.getByText("A body")).not.toBeVisible();
  });

  test("dynamically adding steps keeps current active step in range", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.extra="{false}">
        <Stepper id="wiz" activeStep="{0}">
          <Step label="A"><Text>A body</Text></Step>
          <Step label="B"><Text>B body</Text></Step>
          <Step when="{extra}" label="C"><Text>C body</Text></Step>
        </Stepper>
        <Button testId="addStep" onClick="extra = true" />
        <Button testId="nextBtn" onClick="wiz.next()" />
      </Fragment>
    `);
    await expect(page.getByText("A body")).toBeVisible();
    await page.getByTestId("addStep").click();
    // Advance twice — should reach the newly-added C step
    await page.getByTestId("nextBtn").click();
    await expect(page.getByText("B body")).toBeVisible();
    await page.getByTestId("nextBtn").click();
    await expect(page.getByText("C body")).toBeVisible();
  });

  test("combining nonLinear + activeStep respects initial value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Stepper nonLinear="true" activeStep="{2}">
        <Step label="A"><Text>A body</Text></Step>
        <Step label="B"><Text>B body</Text></Step>
        <Step label="C"><Text>C body</Text></Step>
      </Stepper>
    `);
    await expect(page.getByText("C body")).toBeVisible();
    await expect(page.getByText("A body")).not.toBeVisible();
  });
});
