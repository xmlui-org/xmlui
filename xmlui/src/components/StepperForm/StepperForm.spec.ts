import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SMOKE TESTS
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("renders one step per FormSegment with auto-generated nav buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha">
          <Text>Alpha body</Text>
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
        <FormSegment label="Beta">
          <Text>Beta body</Text>
        </FormSegment>
      </StepperForm>
    `);
    // Stepper renders with both step labels.
    await expect(page.getByRole("group", { name: "Stepper" })).toBeVisible();
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();

    // Only the first step's content is visible.
    await expect(page.getByText("Alpha body")).toBeVisible();
    await expect(page.getByText("Beta body")).not.toBeVisible();

    // First step: Next is auto-rendered, Back is not.
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).not.toBeVisible();
  });
});

// =============================================================================
// AUTO-GENERATED NAVIGATION
// =============================================================================

test.describe("auto-generated navigation", () => {
  test("Next button advances to the next step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Beta body")).toBeVisible();
    await expect(page.getByText("Alpha body")).not.toBeVisible();
  });

  test("Back button moves to the previous step", async ({ initTestBed, page }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Beta body")).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Alpha body")).toBeVisible();
    await expect(page.getByText("Beta body")).not.toBeVisible();
  });

  test("the last step renders a Submit button instead of Next", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
  });

  test("backLabel/nextLabel/submitLabel customize the auto-buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm
        data="{{ name: '' }}"
        backLabel="Previous"
        nextLabel="Continue"
        submitLabel="Finish">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Finish" })).toBeVisible();
  });
});

// =============================================================================
// VALIDITY-DRIVEN BUTTON STATE
// =============================================================================

test.describe("validity-driven button state", () => {
  test("Next is disabled while the FormSegment is invalid", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
        </FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeDisabled();

    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Alice");
    await expect(next).toBeEnabled();
  });

  test("Submit is disabled while the last FormSegment is invalid", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '', email: '' }}">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
        <FormSegment label="Beta">
          <FormItem label="Email" bindTo="email" required="true" testId="emailField" />
        </FormSegment>
      </StepperForm>
    `);
    await page.getByRole("button", { name: "Next" }).click();
    const submit = page.getByRole("button", { name: "Submit" });
    await expect(submit).toBeDisabled();

    const formItem = await createFormItemDriver("emailField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("a@b.com");
    await expect(submit).toBeEnabled();
  });
});

// =============================================================================
// FORM INTEGRATION
// =============================================================================

test.describe("form integration", () => {
  test("data prop seeds form fields across steps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <StepperForm data="{{ name: 'Alice' }}">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </StepperForm>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("onSubmit fires with the cleaned form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <StepperForm
        data="{{ name: '' }}"
        onSubmit="(d) => testState = d.name">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </FormSegment>
      </StepperForm>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Bob");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(testStateDriver.testState).toBe("Bob");
  });
});

// =============================================================================
// FORWARDED STEPPER PROPS
// =============================================================================

test.describe("forwarded Stepper props", () => {
  test("stepperOrientation=horizontal renders the role='list' header strip", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    // Default is horizontal: a horizontal Stepper renders the listed step headers.
    await expect(page.getByRole("list")).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(2);
  });

  test("stepperOrientation=vertical omits the horizontal header strip", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}" stepperOrientation="vertical">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    await expect(page.getByRole("list")).toHaveCount(0);
    // Both labels are still rendered as per-step headers.
    await expect(page.getByText("Alpha", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Beta", { exact: true }).first()).toBeVisible();
  });

  test("stepperNonLinear=true makes step headers clickable", async ({ initTestBed, page }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}" stepperNonLinear="true">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    // Both step headers are rendered as <button> elements when stepperNonLinear is true.
    const headerButtons = page.getByRole("listitem").locator("button");
    await expect(headerButtons).toHaveCount(2);
    // Clicking the second header activates the second step.
    await headerButtons.nth(1).click();
    await expect(page.getByText("Beta body")).toBeVisible();
    await expect(page.getByText("Alpha body")).not.toBeVisible();
  });

  test("stepperStackedLabel=true stacks icon+label vertically in horizontal mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}" stepperStackedLabel="true">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);
    const headerItem = page.getByRole("listitem").first();
    const inner = headerItem.locator("> *").first();
    await expect(inner).toHaveCSS("flex-direction", "column");
  });
});

// =============================================================================
// FORWARDED FORM APIs
// =============================================================================

test.describe("forwarded Form APIs", () => {
  test("update() merges values into the form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <StepperForm id="sf" data="{{ name: 'initial' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </StepperForm>
        <Button testId="updateBtn" onClick="sf.update({ name: 'patched' })" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await expect(input.field).toHaveValue("initial");
    await page.getByTestId("updateBtn").click();
    await expect(input.field).toHaveValue("patched");
  });

  test("getData() returns the current form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <StepperForm id="sf" data="{{ name: 'Eve' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </StepperForm>
        <Button testId="readBtn" onClick="testState = sf.getData()" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Frank");
    await page.getByTestId("readBtn").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Frank" });
  });

  test("reset() restores the initial form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <StepperForm id="sf" data="{{ name: 'Original' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </StepperForm>
        <Button testId="resetBtn" onClick="sf.reset()" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Modified");
    await expect(input.field).toHaveValue("Modified");
    await page.getByTestId("resetBtn").click();
    await expect(input.field).toHaveValue("Original");
  });
});
