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

  test("Select with 'bindTo' updates Form data", async ({ initTestBed, page, createSelectDriver }) => {
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
});

// =============================================================================
// BEHAVIOR CONTEXT TESTS
// =============================================================================

test.describe("Behavior Context", () => {
  test("input without 'bindTo' in Form does not participate in form data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data">
        <TextBox testId="textbox" initialValue="test" />
      </Form>
    `);

    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveValue("test");
    
    await page.getByRole("button", { name: "Save" }).click();

    // Empty object since there's no bindTo
    await expect.poll(testStateDriver.testState).toEqual({});
  });

  test("input inside FormItem uses FormItem binding (not behavior)", async ({ initTestBed, page }) => {
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

  test("FormItem and standalone inputs coexist correctly", async ({
    initTestBed,
    page,
  }) => {
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
  test("'required' validation shows error with validationMode onChanged", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <TextBox testId="textbox" bindTo="name" required="true" requiredInvalidMessage="This field is required" label="Test" validationMode="onChanged" />
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
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

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

  test("comparing: FormItem validation works", async ({
    initTestBed,
    page,
    createFormDriver,
  }) => {
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