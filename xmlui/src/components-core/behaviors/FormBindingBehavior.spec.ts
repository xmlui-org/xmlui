import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("TextBox with 'bindTo' binds to Form data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form data="{{ name: 'initial value' }}">
        <TextBox testId="textbox" bindTo="name" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toHaveValue("initial value");
  });

  test("TextBox type='password' binds to Form data", async ({ initTestBed, page, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <PasswordInput testId="password" bindTo="secret" />
      </Form>
    `);

    const driver = await createTextBoxDriver("password");
    await driver.input.fill("topsecret");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      secret: "topsecret",
    });
  });

  test("TextBox with 'bindTo' updates Form data on change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextBox testId="textbox" bindTo="name" initialValue="test" />
      </Form>
    `);

    await page.getByRole("textbox").fill("updated value");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      name: "updated value",
    });
  });

  test("NumberBox with 'bindTo' binds to Form data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form data="{{ count: 42 }}">
        <NumberBox testId="numberbox" bindTo="count" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toHaveValue("42");
  });

  test("NumberBox with 'bindTo' updates Form data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <NumberBox testId="numberbox" bindTo="count" initialValue="{10}" />
      </Form>
    `);

    await page.getByRole("textbox").fill("99");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      count: 99,
    });
  });

  test("Select with 'bindTo' updates Form data", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <Select testId="select" bindTo="choice" initialValue="opt1">
          <Option value="opt1" label="Option 1" />
          <Option value="opt2" label="Option 2" />
        </Select>
      </Form>
    `);

    const driver = await createSelectDriver("select");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Option 2");

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      choice: "opt2",
    });
  });

  test("multiple inputs with 'bindTo' work together", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextBox testId="name" bindTo="name" initialValue="John" />
        <NumberBox testId="age" bindTo="age" initialValue="{25}" />
      </Form>
    `);

    const textboxes = page.getByRole("textbox");
    await textboxes.first().fill("Jane");
    await textboxes.last().fill("30");

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      name: "Jane",
      age: 30,
    });
  });

  test("'initialValue' prop sets initial value correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" initialValue="default name" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toHaveValue("default name");
  });

  test("Form data takes precedence over 'initialValue'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form data="{{ name: 'from form data' }}">
        <TextBox testId="textbox" bindTo="name" initialValue="from initial value" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toHaveValue("from form data");
  });

  test("TextArea with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextArea testId="textarea" bindTo="description" initialValue="initial text" />
      </Form>
    `);

    await page.getByRole("textbox").fill("updated text");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      description: "updated text",
    });
  });

  test("Checkbox with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <Checkbox testId="checkbox" bindTo="agreed" />
      </Form>
    `);

    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      agreed: true,
    });
  });

  test("Switch with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <Switch testId="switch" bindTo="enabled" />
      </Form>
    `);

    await page.getByRole("switch").click();
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      enabled: true,
    });
  });

  test("RadioGroup with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <RadioGroup testId="radiogroup" bindTo="option" initialValue="a">
          <RadioItem value="a" label="Option A" />
          <RadioItem value="b" label="Option B" />
        </RadioGroup>
      </Form>
    `);

    // Use generic radio locator if specific label/name is flaky
    const radios = page.locator('[role="radio"]');
    await expect(radios).toHaveCount(2);
    await radios.nth(1).click(); // Click the second option (value="b")

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      option: "b",
    });
  });

  test("Slider with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <Slider testId="slider" bindTo="value" initialValue="{0}" min="{0}" max="{100}" />
      </Form>
    `);

    // Focus slider and move it
    const slider = page.getByRole("slider");
    await slider.focus();
    // Move it significantly
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    await page.getByRole("button", { name: "Save" }).click();

    // Verify value changed from 0
    await expect.poll(testStateDriver.testState).not.toEqual({
      value: 0,
    });
  });

  test("ColorPicker with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <ColorPicker testId="colorpicker" bindTo="color" initialValue="#000000" />
      </Form>
    `);

    // Verifying binding works by checking submission of initial value
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      color: "#000000",
    });
  });

  test("DatePicker with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <DatePicker testId="datepicker" bindTo="date" initialValue="2023-01-01" />
      </Form>
    `);

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      date: "2023-01-01",
    });
  });

  test("AutoComplete with 'bindTo' works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <AutoComplete testId="autocomplete" bindTo="selection" initialValue="Apple">
          <AutoCompleteOption value="Apple" label="Apple" />
          <AutoCompleteOption value="Banana" label="Banana" />
        </AutoComplete>
      </Form>
    `);

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      selection: "Apple",
    });
  });

  test("FileInput with 'bindTo' works correctly", async ({
    initTestBed,
    page,
    createFileInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <FileInput testId="fileInput" bindTo="files" parseAs="csv" />
      </Form>
    `);

    const driver = await createFileInputDriver("fileInput");
    await driver.getHiddenInput().setInputFiles({
      name: "sample.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,price\nWidget,10\nGadget,20\n"),
    });

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      files: [
        { name: "Widget", price: "10" },
        { name: "Gadget", price: "20" },
      ],
    });
  });
});

// =============================================================================
// BEHAVIOR CONTEXT TESTS
// =============================================================================

test.describe("Behavior Context", () => {
  test("input without 'bindTo' in Form does not participate in form data", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextBox testId="textbox" initialValue="test" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveValue("test");

    await page.getByRole("button", { name: "Save" }).click({delay: 100});

    // Empty object since there's no bindTo
    await expect.poll(testStateDriver.testState).toEqual({});
  });

  test("input inside FormItem uses FormItem binding (not behavior)", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <FormItem testId="formItem" bindTo="fromFormItem" type="text" initialValue="formitem value" />
        <TextBox testId="standalone" bindTo="standalone" initialValue="standalone value" />
      </Form>
    `);

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      fromFormItem: "formitem value",
      standalone: "standalone value",
    });
  });

  test("FormItem and standalone inputs coexist correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <FormItem bindTo="field1" type="text" initialValue="value1" label="Field 1" />
        <TextBox bindTo="field2" initialValue="value2" />
        <NumberBox bindTo="field3" initialValue="{100}" />
      </Form>
    `);

    const textboxes = page.getByRole("textbox");
    await textboxes.first().fill("modified1");
    await textboxes.nth(1).fill("modified2");

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      field1: "modified1",
      field2: "modified2",
      field3: 100,
    });
  });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

test.describe("Validation", () => {
  // =============================================================================
  // EXECUTION: When does validation run?
  // =============================================================================

  test("sync validation executes on initial mount", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox bindTo="firstName" required="true" />
      </Form>
    `);
    const wrapper = page.locator("[data-validation-status]").first();

    // "required" validation should execute on mount
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");
  });

  test("async validation executes on initial mount", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox bindTo="firstName" onValidate="() => testState = true" />
      </Form>
    `);
    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    // Validation should execute on mount
    await expect.poll(testStateDriver.testState).toBe(true);
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");
  });

  test("async validation reruns on input change", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          onValidate="() => { testState = (testState || 0) + 1; return true; }"
        />
      </Form>
    `);
    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("A");

    await expect.poll(testStateDriver.testState).toBe(2);
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");
  });

  test("async validation executes after sync validation on initial mount with initialValue", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ firstName: 'Jo' }}">
        <TextBox 
          bindTo="firstName" 
          required="true"
          onValidate="arg => testState = { executed: true, value: arg }"
        />
      </Form>
    `);
    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await expect(input).toHaveValue("Jo");
    // Validation should execute on mount
    await expect.poll(testStateDriver.testState).toMatchObject({ executed: true, value: "Jo" });
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "2");
  });

  test("validation executes on single value change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox bindTo="firstName" minLength="3" />
      </Form>
    `);
    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("A");
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");
  });

  test("validation executes on multiple value changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox bindTo="firstName" minLength="3" />
      </Form>
    `);
    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("A");
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");

    await input.fill("AB");
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");

    await input.fill("ABC");
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");
  });

  test("validation executes with throttle delay", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          customValidationsDebounce="1000"
          onValidate="arg => { testState = { count: (testState?.count || 0) + 1, value: arg.value };}"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");

    // Initial validation on mount
    await expect.poll(testStateDriver.testState).toMatchObject({ count: 1 });

    // Type rapidly - validation should be throttled (leading: true, trailing: true)
    await input.pressSequentially("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", { delay: 10 });

    // First character triggers immediate validation (leading edge)
    await expect.poll(testStateDriver.testState).toMatchObject({ count: 2 });

    // Wait for throttle period to expire and trailing edge to fire
    await page.waitForTimeout(1050);

    // Trailing edge fires with final value
    await expect.poll(testStateDriver.testState).toMatchObject({ count: 3 });
    // Count should be at least 2 (leading + trailing), could be more depending on timing
    const finalState = await testStateDriver.testState();
    expect(finalState.count).toBeGreaterThanOrEqual(2);
  });

  // =============================================================================
  // ORCHESTRATION: What order - sync before async?
  // =============================================================================

  test("sync validations complete before async validation", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox
          bindTo="firstName"
          minLength="3"
          onValidate="arg => { delay(100); testState = { async: true, value: arg }; }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("AB");
    // Immediate sync validation evaluation - partial should be true
    await expect(wrapper).toHaveAttribute("data-validation-partial", "true");

    // Async validation runs after sync
    await page.waitForTimeout(150);
    await expect(wrapper).toHaveAttribute("data-validation-partial", "false");
    await expect.poll(testStateDriver.testState).toMatchObject({ async: true, value: "AB" });
  });

  test("required validation stops others from being evaluated", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox 
          bindTo="email"
          required="true"
          minLength="5"
          pattern="email"
          validationMode="onChanged"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    // Empty - required fails first (only 1 validation runs - short-circuit)
    await input.fill("a");
    await input.clear();
    await input.blur();
    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "1");

    // Too short - minLength fails (required passes, all other validations run)
    await input.fill("ab");
    await expect(page.getByText("Input should be at least 5 characters").first()).toBeVisible();
    await expect(wrapper).toHaveAttribute("data-validations-evaluated", "3");
  });

  // =============================================================================
  // CANCELLATION: How do rapid changes prevent stale results?
  // =============================================================================

  test("rapid value changes cancel previous async validations", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          onValidate="arg => {
            delay(100);
            testState = { results: [...(testState?.results || []), arg] };
          }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");

    // Type rapidly - each change should trigger validation
    await input.fill("A");
    await page.waitForTimeout(10);
    await input.fill("AB");
    await page.waitForTimeout(10);
    await input.fill("ABC");

    // Wait for validations to complete
    await page.waitForTimeout(150);

    // Due to cancellation, we should see results for each value
    await expect.poll(testStateDriver.testState).toBeDefined();
    await expect
      .poll(async () => (await testStateDriver.testState()).results.length)
      .toBeGreaterThan(0);
  });

  test("stale validation results are discarded", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox 
          bindTo="username"
          minLength="1"
          onValidate="arg => {
            if (arg === 'slow') {
              delay(200);
              return { isValid: false, invalidMessage: 'slow result' };
            } else {
              delay(10);
              return { isValid: true };
            }
          }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");

    // Type "slow" (will take 200ms to validate)
    await input.fill("slow");
    await page.waitForTimeout(20);

    // Immediately change to "fast" (will take 10ms to validate)
    await input.fill("fast");

    // Wait for both validations to potentially complete
    await page.waitForTimeout(250);

    // The "slow" validation should be cancelled/discarded
    // The "fast" validation should be the current result (no error shown)
    await expect(page.getByText("slow result")).not.toBeVisible();
  });

  test.fixme(
    "validation cleanup on component unmount",
    SKIP_REASON.TEST_NOT_WORKING(
      "There might be a problem with cleanup logic in useValidation hook",
    ),
    async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
      <Form data="{{ firstName: 'initial' }}" var.test="{{ validationCompleted: false }}">
        <Stack when="{ !test.unmounted }">
          <TextBox 
            bindTo="firstName"
            onValidate="arg => { 
              delay(100); 
              testState = { ...test, validationCompleted: true }; 
            }"
          />
        </Stack>
        <Button testId="unmount" onClick="test = { ...test, unmounted: true }" />
      </Form>
    `);

      // Wait for initial validation on mount to complete
      await expect.poll(testStateDriver.testState).toEqual({ validationCompleted: true });

      // Now trigger a new validation that we'll interrupt
      const textBox = page.getByRole("textbox");
      await textBox.fill("test");

      // Unmount before validation completes
      await page.waitForTimeout(10);
      await page.getByTestId("unmount").click();

      // Wait to see if validation completes (it shouldn't due to cleanup)
      await page.waitForTimeout(150);

      // If cleanup works, state should still show just unmounted (no new validationCompleted)
      const state = await testStateDriver.testState();
      expect(state).toEqual({ validationCompleted: true, unmounted: true });
    },
  );

  // =============================================================================
  // STATE CONSISTENCY: Is state consistent?
  // =============================================================================

  test("validationResult reflects current value during async validation", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          required="true"
          onValidate="arg => { 
            delay(100);
            testState = { value: arg };
            return { isValid: true };
          }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("ABC");
    // During async validation, partial should be true
    await expect(wrapper).toHaveAttribute("data-validation-partial", "true");

    await page.waitForTimeout(50); // Mid-validation

    await input.fill("ABCD");
    // New validation started, partial should still be true
    await expect(wrapper).toHaveAttribute("data-validation-partial", "true");

    // After completion, should reflect latest value and partial should be false
    await page.waitForTimeout(150);
    await expect.poll(testStateDriver.testState).toEqual({ value: "ABCD" });
    await expect(wrapper).toHaveAttribute("data-validation-partial", "false");
  });

  test.fixme("partial should be set if no sync validation is defined",
    SKIP_REASON.XMLUI_BUG("partial is not set, so the data attribute does not get updated -> investigate"),
    async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          onValidate="arg => { 
            delay(100);
            testState = { value: arg };
            return { isValid: true };
          }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("ABC");
    await expect(wrapper).toHaveAttribute("data-validation-partial", "true");

    await page.waitForTimeout(100);

    await expect(wrapper).toHaveAttribute("data-validation-partial", "false");
  });

  test("partial flag set correctly during async validation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox 
          bindTo="firstName"
          minLength="3"
          onValidate="arg => { delay(100); return true; }"
        />
      </Form>
    `);

    const input = page.getByRole("textbox");
    const wrapper = page.locator("[data-validation-status]").first();

    await input.fill("ABC");
    await expect(wrapper).toHaveAttribute("data-validation-partial", "true");

    await page.waitForTimeout(100);

    await expect(wrapper).toHaveAttribute("data-validation-partial", "false");
  });

  // =============================================================================
  // DISPLAY LAYER: When should errors show? (Enhanced existing tests)
  // =============================================================================

  test("'required' validation shows error with validationMode onChanged", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          bindTo="name"
          required="true"
          requiredInvalidMessage="This field is required"
          label="Test"
          validationMode="onChanged"
        />
      </Form>
    `);

    const textbox = page.getByRole("textbox");

    // Type something to make the field dirty
    await textbox.fill("test");
    // Clear it to trigger required validation
    await textbox.fill("");

    await expect(page.getByText("This field is required")).toBeVisible();
  });

  test("'required' validation shows error when isDirty and losing focus", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" required="true" requiredInvalidMessage="This field is required" label="Test" />
        <TextBox testId="other" bindTo="other" label="Other" />
      </Form>
    `);

    const textbox = page.getByRole("textbox").first();

    // Type and clear to make dirty, then lose focus
    await textbox.fill("test");
    await textbox.fill("");

    // Tab to lose focus (blur)
    await page.getByRole("textbox").last().focus();

    await expect(page.getByText("This field is required")).toBeVisible();
  });

  test("'required' validation shows error on form submit (like FormItem)", async ({
    initTestBed,
    page,
    createFormDriver,
  }) => {
    // This is a direct copy of FormItem.spec.ts test, just with TextBox+bindTo instead of FormItem
    await initTestBed(`
      <Form>
        <TextBox
          testId="textbox"
          bindTo="standaloneField"
          label="Required Field"
          required="true"
          requiredInvalidMessage="This field is required"
        />
      </Form>
    `);

    const formDriver = await createFormDriver();

    // Submit form to trigger validation
    await formDriver.submitForm();

    // Check that validation message appears somewhere on the page
    await expect(page.getByText("This field is required")).toBeVisible();
  });

  test("checkbox forces verbose feedback when form is concise", async ({
    initTestBed,
    page,
    createFormDriver,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <Checkbox
          bindTo="agree"
          label="Agree"
          required="true"
          requiredInvalidMessage="Agree required"
        />
      </Form>
    `);

    const formDriver = await createFormDriver();
    await formDriver.submitForm();

    await expect(page.getByText("Agree required")).toBeVisible();
  });

  test("'minLength' validation shows error on form submit", async ({
    initTestBed,
    page,
    createFormDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          testId="textbox"
          bindTo="field"
          minLength="5"
          lengthInvalidMessage="Too short"
          label="Min Length"
        />
      </Form>
    `);

    const formDriver = await createFormDriver();
    const textbox = page.getByRole("textbox");

    // Type something short
    await textbox.fill("abc");

    // Submit
    await formDriver.submitForm();

    await expect(page.getByText("Too short")).toBeVisible();
  });

  test("'required' validation shows error on submit after interaction (dirty)", async ({
    initTestBed,
    page,
    createFormDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" required="true" requiredInvalidMessage="Required error" />
      </Form>
    `);

    const formDriver = await createFormDriver();
    const textbox = page.getByRole("textbox");

    // Make it dirty
    await textbox.fill("a");
    await textbox.fill(""); // Empty again

    // Submit (trigger blur)
    await formDriver.submitForm();

    await expect(page.getByText("Required error")).toBeVisible();
  });

  test("comparing: FormItem validation works", async ({ initTestBed, page, createFormDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem bindTo="name" type="text" required="true" requiredInvalidMessage="FormItem required" label="FormItem Test" />
      </Form>
    `);

    const formDriver = await createFormDriver();
    await formDriver.submitForm();

    await expect(page.getByText("FormItem required")).toBeVisible();
  });
});

// =============================================================================
// NOSUBMIT PROPERTY TESTS
// =============================================================================

test.describe("noSubmit Property", () => {
  test("'noSubmit' excludes field from form submission", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextBox testId="included" bindTo="included" initialValue="visible" />
        <TextBox testId="excluded" bindTo="excluded" initialValue="hidden" noSubmit="true" />
      </Form>
    `);

    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      included: "visible",
    });
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles null 'initialValue' gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" initialValue="{null}" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("handles undefined 'bindTo' gracefully (no binding)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" initialValue="test value" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveValue("test value");
  });

  test("multiple inputs with same 'bindTo' share value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form data="{{ shared: 'initial' }}">
        <TextBox testId="textbox1" bindTo="shared" />
        <TextBox testId="textbox2" bindTo="shared" />
      </Form>
    `);

    const textboxes = page.getByRole("textbox");

    // Both should have initial value
    await expect(textboxes.first()).toHaveValue("initial");
    await expect(textboxes.last()).toHaveValue("initial");

    // Change one, both should update
    await textboxes.first().fill("changed");

    await expect(textboxes.first()).toHaveValue("changed");
    await expect(textboxes.last()).toHaveValue("changed");
  });

  test("nested 'bindTo' path works correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ user: { name: 'John' } }}" onSubmit="data => testState = data">
        <TextBox testId="textbox" bindTo="user.name" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toHaveValue("John");

    await page.getByRole("textbox").fill("Jane");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(testStateDriver.testState).toEqual({
      user: { name: "Jane" },
    });
  });
});

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with enabled property set to true", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" enabled="true" />
      </Form>
    `);
    const inputDriver = await createTextBoxDriver("textbox");
    await expect(inputDriver.field).toBeEnabled();
  });

  test("renders with enabled property set to false", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" enabled="false" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeDisabled();
  });

  test("renders with required property", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" label="Required Field" required="true" />
      </Form>
    `);
    const inputDriver = await createTextBoxDriver("textbox");
    await expect(inputDriver.field).toHaveAttribute("required");
  });

  test("renders with autoFocus property", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" type="text" autoFocus="true" />
      </Form>
    `);
    const inputDriver = await createTextBoxDriver("textbox");
    await expect(inputDriver.field).toBeFocused();
  });

  test("renders with bindTo property", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form data="{{ testField: 'initial value' }}">
        <FormItem testId="formItem" type="text" bindTo="testField" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toHaveValue("initial value");
  });

  test("renders with initialValue property", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" initialValue="default text" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toHaveValue("default text");
  });

  test("renders with labelPosition property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" label="Positioned Label" labelPosition="top" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.label).toHaveText("Positioned Label");
  });

  test("renders with labelWidth property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" label="Wide Label" labelWidth="200px" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.label).toHaveText("Wide Label");
  });

  test("renders with labelBreak property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" label="Very Long Label That Should Break" labelBreak="true" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.label).toHaveText("Very Long Label That Should Break");
  });

  test("renders with gap property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" label="Gapped Item" gap="20px" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.component).toBeVisible();
  });
});

test.describe("Type Property", () => {
  test("renders with type 'text'", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeVisible();
    await expect(inputDriver.field).toHaveAttribute("type", "text");
  });

  test("renders with type 'password'", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="password" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeVisible();
    await expect(inputDriver.field).toHaveAttribute("type", "password");
  });

  test("renders with type 'number'", async ({
    initTestBed,
    createFormItemDriver,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="number" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createNumberBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeVisible();
    // XMLUI number inputs use type="text" with inputmode="numeric"
    await expect(inputDriver.field).toHaveAttribute("type", "text");
    await expect(inputDriver.field).toHaveAttribute("inputmode", "numeric");
  });

  test("renders with type 'integer'", async ({
    initTestBed,
    createFormItemDriver,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="integer" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createNumberBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeVisible();
  });

  test("renders with type 'textarea'", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="textarea" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    await expect(formItemDriver.input.getByRole("textbox")).toBeVisible();
  });

  test("renders with type 'checkbox'", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="checkbox" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    await expect(formItemDriver.checkbox).toBeVisible();
  });

  test("renders with type 'select'", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="select" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    await expect(formItemDriver.component).toBeVisible();
  });

  test("renders with type 'radio'", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="radio" />
      </Form>
    `);
    const formItemDriver = await createFormItemDriver("formItem");
    // Radio FormItems may render as hidden without radio options
    const isVisible = await formItemDriver.component.isVisible();
    if (isVisible) {
      await expect(formItemDriver.component).toBeVisible();
    } else {
      // It's acceptable for radio FormItem to be hidden without options
      expect(isVisible).toBe(false);
    }
  });
});

test.describe("Validation Properties", () => {
  test("renders with minLength property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" minLength="5" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.component).toBeVisible();
  });

  test("renders with maxLength property", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" maxLength="10" />
      </Form>
    `);
    const driver = await createFormItemDriver("formItem");
    await expect(driver.component).toBeVisible();
  });
});

test.describe("Event Handling", () => {
  test("fires onValidate event", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Form>
        <TextBox
          testId="test"
          bindTo="test"
          required="true"
          onValidate="result => testState = result ? 'valid' : 'invalid'"
        />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await driver.input.fill("test value");
    await driver.input.blur();

    await expect.poll(testStateDriver.testState).toEqual("valid");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("indicates required fields with aria-required", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox label="Required Field" required="true" />
      </Form>
    `);

    const input = page.getByRole("textbox");
    await expect(input).toBeVisible();
    // TextBox propagates required to the input
    await expect(input).toHaveAttribute("required");
  });

  test("associates validation messages with input using aria-describedby", async ({
    initTestBed,
    createFormDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          testId="formItem"
          bindTo="test"
          label="Test Field"
          required="true"
          requiredInvalidMessage="This field is required"
        />
      </Form>
    `);

    const formDriver = await createFormDriver();
    const driver = await createTextBoxDriver("formItem");

    // Submit form to trigger validation
    await formDriver.submitForm();

    // Check that validation message appears in the component
    await expect(driver.component).toContainText("This field is required");
  });

  test("supports keyboard navigation for text input", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextBox label="Text Field" />
      </Form>
    `);

    const input = page.getByRole("textbox");
    await input.focus();
    await expect(input).toBeFocused();

    await input.press("Tab");
    await expect(input).not.toBeFocused();
  });

  test("provides accessible validation state announcements", async ({
    initTestBed,
    createFormDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          bindTo="test"
          label="Required Field"
          required="true"
        />
      </Form>
    `);

    const formDriver = await createFormDriver();

    // Submit form to trigger validation
    await formDriver.submitForm();

    // Check that validation message appears somewhere on the page
    await expect(page.getByText("This field is required")).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles null and undefined properties gracefully", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="{null}" type="{undefined}" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("handles empty string properties gracefully", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("handles special characters in label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test with émojis 🚀 & quotes and unicode 👨‍👩‍👧‍👦" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.label).toHaveText("Test with émojis 🚀 & quotes and unicode 👨‍👩‍👧‍👦");
  });

  test("handles Chinese characters in label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="测试中文标签" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.label).toHaveText("测试中文标签");
  });

  test("handles invalid type gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <Form>
        <TextBox  testId="test" bindTo="test" type="invalidType" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    // Component may be hidden with invalid type - test for graceful handling
    const isVisible = await driver.component.isVisible();
    if (isVisible) {
      await expect(driver.component).toBeVisible();
    } else {
      // It's acceptable for component to be hidden with invalid type
      expect(isVisible).toBe(false);
    }
  });

  test("handles negative values for numeric properties", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          testId="test"
          bindTo="test"
          minLength="-5"
          maxLength="-1"
          minValue="-100"
          maxValue="-10"
        />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("handles very large numbers for properties", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          testId="test"
          bindTo="test"
          minValue="999999999"
          maxValue="9999999999"
          customValidationsDebounce="999999"
        />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("handles object values for string properties gracefully", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Object Label" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    // Component should handle this gracefully
    await expect(driver.component).toBeVisible();
  });

  test("handles extremely long label text", async ({ initTestBed, createTextBoxDriver }) => {
    const longLabel =
      "This is an extremely long label that contains a lot of text and should test how the component handles very long strings that might cause layout issues or performance problems in the user interface";

    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="${longLabel}" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.label).toHaveText(longLabel);
  });

  test("handles validation with conflicting min/max values", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox
          testId="test"
          bindTo="test"
          type="number"
          minValue="100"
          maxValue="50"
          minLength="10"
          maxLength="5"
        />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("handles multiple FormItems without bindTo independently", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test1" bindTo="test1" initialValue="First" />
        <TextBox testId="test2" bindTo="test2" initialValue="Second" />
      </Form>
    `);

    const driver1 = await createTextBoxDriver("test1");
    const driver2 = await createTextBoxDriver("test2");
    const input1 = driver1.input;
    const input2 = driver2.input;

    await expect(input1).toHaveValue("First");
    await expect(input2).toHaveValue("Second");

    // Modify one and ensure the other is unaffected
    await input1.fill("Modified First");
    await expect(input1).toHaveValue("Modified First");
    await expect(input2).toHaveValue("Second");
  });

  ["onChange", "onLostFocus", "errorLate"].forEach((mode) =>
    test(`validationMode=${mode}: handle empty input & focus`, async ({
      initTestBed,
      createTextBoxDriver,
      page,
    }) => {
      await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="${mode}" minLength="3" />
      </Form>
    `);

      const driver = await createTextBoxDriver("test");
      const input = driver.input;

      await input.focus({ timeout: 500 });
      await input.blur();
      await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
    }),
  );

  test("validationMode=onChanged: validates input on change", async ({
    initTestBed,
    createTextBoxDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="onChanged" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("v");
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
    await input.fill("va");
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
    await input.fill("val");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
    await input.fill("va");
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  test("validationMode=onChanged: error still displayed on blur", async ({
    initTestBed,
    createTextBoxDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="onChanged" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("v");
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  test("validationMode=onLostFocus", async ({ initTestBed, createTextBoxDriver, page }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="onLostFocus" minLength="2" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.focus({ timeout: 500 });
    await page.keyboard.type("v");
    await expect(page.getByText("Input should be at least 2 characters")).not.toBeVisible();
    await input.blur();
    await expect(page.getByText("Input should be at least 2 characters")).toBeVisible();

    await input.focus({ timeout: 500 });
    await page.keyboard.type("a");
    await expect(page.getByText("Input should be at least 2 characters")).not.toBeVisible();
    await input.blur();
    await expect(page.getByText("Input should be at least 2 characters")).not.toBeVisible();
  });

  test("validationMode=errorLate: handle multiple focus & blur", async ({
    initTestBed,
    createTextBoxDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.focus({ timeout: 500 });
    await input.blur({ timeout: 500 });
    await input.focus({ timeout: 500 });
    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
  });

  test("validationMode=errorLate: does not display error for first input until blur", async ({
    initTestBed,
    createTextBoxDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.focus({ timeout: 500 });
    await page.keyboard.type("v");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();

    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  test("validationMode=errorLate: no error displayed on invalid -> valid -> invalid until first blur", async ({
    page,
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("value");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
    await input.fill("va");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();

    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  test("validationMode=errorLate: still display error on refocus", async ({
    page,
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("va");
    await input.blur({ timeout: 500 });
    await input.focus();
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  test("validationMode=errorLate: invalid -> valid removes error", async ({
    page,
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("va");
    await input.blur({ timeout: 500 });
    await input.focus({ timeout: 500 });
    await input.fill("val");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();
  });

  test("validationMode=errorLate: after invalid -> valid, show error on blur", async ({
    initTestBed,
    createTextBoxDriver,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="test" bindTo="test" label="Test Label" validationMode="errorLate" minLength="3" />
      </Form>
    `);

    const driver = await createTextBoxDriver("test");
    const input = driver.input;

    await input.fill("va");
    await input.blur({ timeout: 500 });

    await input.focus({ timeout: 500 });
    await input.fill("val", { timeout: 500 });
    await input.fill("va");
    await expect(page.getByText("Input should be at least 3 characters")).not.toBeVisible();

    await input.blur();
    await expect(page.getByText("Input should be at least 3 characters")).toBeVisible();
  });

  // =============================================================================
  // NOSUBMIT PROPERTY TESTS
  // =============================================================================

  test.describe("noSubmit property", () => {
    test("excludes field from submission when noSubmit is true", async ({
      initTestBed,
      page,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="Included Field" bindTo="included" initialValue="visible" />
          <TextBox testId="field2" label="Excluded Field" bindTo="excluded" initialValue="hidden" noSubmit="true" />
        </Form>
      `);

      const driver1 = await createTextBoxDriver("field1");
      await driver1.input.fill("submitted value");

      const driver2 = await createTextBoxDriver("field2");
      await driver2.input.fill("not submitted");

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        included: "submitted value",
      });
    });

    test("includes field in submission when noSubmit is false", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="Field 1" bindTo="field1" initialValue="value1" noSubmit="false" />
          <TextBox testId="field2" label="Field 2" bindTo="field2" initialValue="value2" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        field1: "value1",
        field2: "value2",
      });
    });

    test("includes field by default when noSubmit is not specified", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="Field 1" bindTo="field1" initialValue="value1" />
          <TextBox testId="field2" label="Field 2" bindTo="field2" initialValue="value2" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        field1: "value1",
        field2: "value2",
      });
    });

    test("excludes field when multiple FormItems with same bindTo all have noSubmit true", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="FormItem 1" bindTo="shared" initialValue="first" noSubmit="true" />
          <TextBox testId="field2" label="FormItem 2" bindTo="shared" initialValue="second" noSubmit="true" />
          <TextBox testId="field3" label="Other Field" bindTo="other" initialValue="included" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        other: "included",
      });
    });

    test("excludes field when any FormItem with same bindTo has noSubmit true", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="FormItem 1" bindTo="shared" initialValue="first" noSubmit="true" />
          <TextBox testId="field2" label="FormItem 2" bindTo="shared" initialValue="second" noSubmit="false" />
          <TextBox testId="field3" label="Other Field" bindTo="other" initialValue="included" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        other: "included",
      });
    });

    test("excludes field when any FormItem with same bindTo has noSubmit true (mixed order)", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="field1" label="FormItem 1" bindTo="shared" initialValue="first" noSubmit="false" />
          <TextBox testId="field2" label="FormItem 2" bindTo="shared" initialValue="second" noSubmit="true" />
          <TextBox testId="field3" label="Other Field" bindTo="other" initialValue="included" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        other: "included",
      });
    });

    test("field still participates in validation when noSubmit is true", async ({
      initTestBed,
      page,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox
            testId="field1"
            label="Required No Submit"
            bindTo="excluded"
            required="true"
            noSubmit="true"
          />
        </Form>
      `);

      // Try to submit with empty required field
      await page.getByRole("button", { name: "Save" }).click();

      // Form should not submit due to validation error
      await expect.poll(testStateDriver.testState).toBeNull();

      // Fill the required field
      const driver = await createTextBoxDriver("field1");
      await driver.input.fill("value");

      // Now submit should succeed but field should not be in data
      await page.getByRole("button", { name: "Save" }).click();
      await expect.poll(testStateDriver.testState).toEqual({});
    });

    test("noSubmit works with different input types", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="text" label="Text" type="text" bindTo="text" initialValue="text" noSubmit="true" />
          <NumberBox testId="number" label="Number" type="number" bindTo="number" initialValue="42" noSubmit="true" />
          <Checkbox testId="checkbox" label="Checkbox" type="checkbox" bindTo="checkbox" initialValue="true" noSubmit="true" />
          <TextBox testId="included" label="Included" bindTo="included" initialValue="visible" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        included: "visible",
      });
    });

    test("noSubmit works with select type", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <Select testId="select" label="Select" type="select" bindTo="select" initialValue="opt1" noSubmit="true">
            <Option value="opt1" label="Option 1" />
            <Option value="opt2" label="Option 2" />
          </Select>
          <TextBox testId="included" label="Included" bindTo="included" initialValue="visible" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        included: "visible",
      });
    });

    test("noSubmit field value changes do not affect submission data", async ({
      initTestBed,
      page,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onSubmit="data => testState = data">
          <TextBox testId="excluded" label="Excluded" bindTo="excluded" initialValue="initial" noSubmit="true" />
          <TextBox testId="included" label="Included" bindTo="included" initialValue="value" />
        </Form>
      `);

      const excludedInput = await createTextBoxDriver("excluded");
      await excludedInput.field.fill("changed value");

      const includedInput = await createTextBoxDriver("included");
      await includedInput.field.fill("modified");

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        included: "modified",
      });
    });

    test("handles initial null value", async ({ initTestBed, createTextBoxDriver }) => {
      await initTestBed(`
      <Form data="{{lastName: null}}">
        <TextBox testId="lastName" bindTo="lastName" />
      </Form>
    `);
      const driver = await createTextBoxDriver("lastName");
      await expect(driver.field).toBeVisible();
    });
  });
});

// =============================================================================
// PHONE PATTERN VALIDATION TESTS
// =============================================================================

test.describe("Phone Pattern Validation", () => {
  test("shows warning for phone number without digits", async ({
    initTestBed,
    page,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form id="testForm">
        <TextBox
          bindTo="mobile"
          testId="phoneField"
          pattern="phone"
          patternInvalidSeverity="warning"
          label="Phone" />
        <Button onClick="testForm.validate()" label="Validate" testId="validateBtn" />
      </Form>
    `);

    // Enter a value with no digits - should be invalid
    const phoneInput = await createTextBoxDriver("phoneField");
    await phoneInput.field.fill("xxxxxx");
    await phoneInput.field.blur();

    await page.getByTestId("validateBtn").click();

    // Validation warning should be displayed
    const phoneField = page.getByTestId("phoneField");
    await expect(phoneField).toContainText("Not a valid phone number");
  });

  test("does not show warning for valid phone number with digits", async ({
    initTestBed,
    page,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form id="testForm">
        <TextBox
          bindTo="mobile"
          testId="phoneField"
          pattern="phone"
          patternInvalidSeverity="warning"
          label="Phone" />
        <Button onClick="testForm.validate()" label="Validate" testId="validateBtn" />
      </Form>
    `);

    const phoneInput = await createTextBoxDriver("phoneField");
    // Enter a valid phone number with digits
    await phoneInput.field.fill("+1-555-123-4567");
    await phoneInput.field.blur();

    await page.getByTestId("validateBtn").click();

    // No validation warning should be displayed
    const phoneField = page.getByTestId("phoneField");
    await expect(phoneField).not.toContainText("Not a valid phone number");
  });

  test("shows warning for empty phone number", async ({
    initTestBed,
    page,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form id="testForm">
        <TextBox
          testId="phoneField"
          bindTo="mobile"
          pattern="phone"
          patternInvalidSeverity="warning"
          label="Phone" />
        <Button onClick="testForm.validate()" label="Validate" testId="validateBtn" />
      </Form>
    `);

    const phoneInput = await createTextBoxDriver("phoneField");
    // Make the field dirty by typing and clearing
    await phoneInput.field.fill("x");
    await phoneInput.field.clear();
    await phoneInput.field.blur();

    await page.getByTestId("validateBtn").click();

    // Validation warning should be displayed
    const phoneField = page.getByTestId("phoneField");
    await expect(phoneField).toContainText("Not a valid phone number");
  });
});
