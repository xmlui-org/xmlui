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
