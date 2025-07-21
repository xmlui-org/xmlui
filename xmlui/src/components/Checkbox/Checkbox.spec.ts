import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with default props", async ({ initTestBed, createCheckboxDriver }) => {
  await initTestBed(`<Checkbox />`);
  const driver = await createCheckboxDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toHaveAttribute("type", "checkbox");
});

// =============================================================================
// EDGE CASE TESTS ?? (could be under Basic func tests)
// =============================================================================

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test("component labelPosition=start positions label before input", async ({
  initTestBed,
  createCheckboxDriver,
}) => {
  await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="start" />`);
  const driver = await createCheckboxDriver();
  const { left: checkboxLeft, right: checkboxRight } = await getBounds(driver.field);
  const { left: labelLeft, right: labelRight } = await getBounds(driver.label);

  // Verify the component renders successfully with start position
  await expect(driver.label).toBeVisible();
  await expect(driver.field).toBeVisible();
  expect(labelLeft).toBeLessThan(checkboxLeft);
  expect(labelRight).toBeLessThan(checkboxRight);
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

// role, label, aria, keyboard, touch

test("component has correct accessibility attributes", async ({
  initTestBed,
  createCheckboxDriver,
}) => {
  await initTestBed(`<Checkbox label="Accept terms" />`);
  const driver = await createCheckboxDriver();
  await expect(driver.field).toHaveAttribute("type", "checkbox");
  await expect(driver.field).toHaveAttribute("role", "checkbox");
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.skip(
  "component validationStatus=error shows error styling",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createCheckboxDriver }) => {},
);

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test("component didChange event fires on state change", async ({
  initTestBed,
  createCheckboxDriver,
}) => {
  const { testStateDriver } = await initTestBed(`<Checkbox onDidChange="testState = 'changed'" />`);
  const driver = await createCheckboxDriver();
  await driver.click();
  await expect.poll(testStateDriver.testState).toEqual("changed");
});

// =============================================================================
// API TESTS
// =============================================================================

// =============================================================================
// CUSTOM INPUT TEMPLATE TESTS
// =============================================================================

test.skip(
  "component inputTemplate renders custom input",
  SKIP_REASON.XMLUI_BUG("setting inputTemplate throws error"),
  async ({ initTestBed, createButtonDriver }) => {
  //   await initTestBed(`
  //   <Checkbox>
  //     <Button id="custom-checkbox" />
  //   </Checkbox>
  // `);
  // const driver = await createButtonDriver("custom-checkbox");
  // await expect(driver.component).toBeVisible();
  },
);

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.skip("component applies theme backgroundColor", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {});

// =============================================================================
// PERFORMANCE TESTS (This is a cool set of tests!)
// =============================================================================

// no memory leak, fast user input response, rapid prop change
