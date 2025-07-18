import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";
import { labelPositionValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("component renders with default props", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<Form></Form>`, {});
  
  // Check that the component is visible
  await expect(page.locator("form")).toBeVisible();
});

test.skip("component renders with form items", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form>
      <FormItem label="Name" />
      <FormItem label="Email" />
    </Form>
  `, {});
  
  // Check that form items are rendered
  await expect(page.locator("text=Name")).toBeVisible();
  await expect(page.locator("text=Email")).toBeVisible();
});

test.skip("component renders save and cancel buttons by default", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<Form></Form>`, {});
  
  // Check that buttons are rendered with default labels
  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
});

test.skip("component renders custom button labels", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form cancelLabel="Go Back" saveLabel="Submit">
    </Form>
  `, {});
  
  // Check that buttons have custom labels
  await expect(page.getByRole("button", { name: "Go Back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
});

test.skip("component submits data correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Form data="{{ name: 'John', email: 'john@example.com' }}" onSubmit="data => testState = data">
      <FormItem label="Name" bindTo="name" />
      <FormItem label="Email" bindTo="email" />
    </Form>
  `, {});
  
  // Click save button to submit the form
  await page.getByRole("button", { name: "Save" }).click();
  
  // Check that the submit event fired with correct data
  await expect.poll(() => testStateDriver.testState).toEqual({
    name: "John",
    email: "john@example.com"
  });
});

test.skip("component handles API submission with submitUrl", async ({ initTestBed, createFormDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(
    `<Form submitUrl="/test" />`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );
  const driver = await createFormDriver();
  await driver.submitForm();

  const request = await driver.getSubmitResponse("/test");
  expect(request.ok()).toEqual(true);
});

test.skip("component handles malformed data input gracefully", async ({
  initTestBed,
  createFormDriver,
}) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<Form data="{}" />`);
  await expect((await createFormDriver()).component).not.toBeAttached();
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form>
      <FormItem label="Username" required={true} />
      <FormItem label="Password" type="password" />
    </Form>
  `, {});
  
  // Check that form has semantic role
  await expect(page.locator("form")).toHaveAttribute("role", "form");
  
  // Check that required form items have required attribute
  const usernameInput = page.locator("input").first();
  await expect(usernameInput).toHaveAttribute("required", "");
  
  // Check that labels are properly associated with inputs
  const labels = page.locator("label");
  await expect(labels).toHaveCount(2);
});

test.skip("component is keyboard accessible", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form>
      <FormItem label="Name" />
      <FormItem label="Email" />
    </Form>
  `, {});
  
  // Tab through the form elements
  await page.keyboard.press("Tab");
  await expect(page.locator("input").first()).toBeFocused();
  
  await page.keyboard.press("Tab");
  await expect(page.locator("input").nth(1)).toBeFocused();
  
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Save" })).toBeFocused();
  
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.skip("component handles different visual states", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  // Test with standard layout
  await initTestBed(`
    <Form>
      <FormItem label="Name" />
    </Form>
  `, {});
  
  await expect(page.locator("form")).toBeVisible();
  
  // Test with vertical layout
  await initTestBed(`
    <Form itemLabelPosition="top">
      <FormItem label="Name" />
    </Form>
  `, {});
  
  await expect(page.locator("form")).toBeVisible();
  
  // Test with horizontal layout
  await initTestBed(`
    <Form itemLabelPosition="left">
      <FormItem label="Name" />
    </Form>
  `, {});
  
  await expect(page.locator("form")).toBeVisible();
});

test.skip("component transitions smoothly between states", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Fragment var.isEditing="false">
      <Form enabled={isEditing}>
        <FormItem label="Name" />
      </Form>
      <Button onClick="isEditing = !isEditing">Toggle Edit Mode</Button>
    </Fragment>
  `, {});
  
  // Check initial disabled state
  await expect(page.locator("input")).toBeDisabled();
  
  // Toggle to editing mode
  await page.getByRole("button", { name: "Toggle Edit Mode" }).click();
  
  // Check that form is now enabled
  await expect(page.locator("input")).toBeEnabled();
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("component handles null and undefined props gracefully", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  // Test with undefined props
  await initTestBed(`<Form />`, {});
  await expect(page.locator("form")).toBeVisible();
  
  // Test with null data
  await initTestBed(`<Form data={null} />`, {});
  await expect(page.locator("form")).toBeVisible();
});

test.skip("component handles special characters in form data", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form data="{{ name: 'José María', description: 'Special chars: & < > " \'' }}">
      <FormItem label="Name" bindTo="name" />
      <FormItem label="Description" bindTo="description" />
    </Form>
  `, {});
  
  // Check that special characters are displayed correctly
  const nameInput = page.locator("input").first();
  await expect(nameInput).toHaveValue("José María");
  
  const descriptionInput = page.locator("input").nth(1);
  await expect(descriptionInput).toHaveValue("Special chars: & < > \" '");
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.skip("component memoization prevents unnecessary re-renders", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Fragment var.renderCount="0">
      <Form data="{{ name: 'Test' }}" onValidated="_ => testState = (testState || 0) + 1">
        <FormItem label="Name" bindTo="name" />
      </Form>
      <Button testId="unrelated" onClick="testState = testState">Unrelated Action</Button>
    </Fragment>
  `, {});
  
  // Get initial render count
  const initialCount = await testStateDriver.testState || 0;
  
  // Perform unrelated action that shouldn't cause form re-render
  await page.getByTestId("unrelated").click();
  
  // Check that form didn't re-render
  await expect.poll(() => testStateDriver.testState).toEqual(initialCount);
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component works correctly with other form-related components", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Form>
      <FormItem label="Name" />
      <FormItem label="Email" type="email" />
      <FormItem label="Password" type="password" />
      <FormItem label="Remember me" type="checkbox" />
    </Form>
  `, {});
  
  // Check that all form items are rendered
  await expect(page.locator("text=Name")).toBeVisible();
  await expect(page.locator("text=Email")).toBeVisible();
  await expect(page.locator("text=Password")).toBeVisible();
  await expect(page.locator("text=Remember me")).toBeVisible();
  
  // Check that inputs have correct types
  await expect(page.locator("input").nth(1)).toHaveAttribute("type", "email");
  await expect(page.locator("input").nth(2)).toHaveAttribute("type", "password");
  await expect(page.locator("input").nth(3)).toHaveAttribute("type", "checkbox");
});

// =============================================================================
// ORIGINAL TEST SUITE
// =============================================================================

test("mock service responds", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(
    `
    <Form submitUrl="/test" />`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );
  const driver = await createFormDriver();
  await driver.submitForm();

  const request = await driver.getSubmitResponse("/test");
  expect(request.ok()).toEqual(true);
});

// --- data

test("Form does not render if data receives malformed input", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`<Form data="{}" />`);
  await expect((await createFormDriver()).component).not.toBeAttached();
});

  // --- $data

  test("$data is correctly bound to form data", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`
        <Form data="{{ field: 'test' }}">
          <FormItem label="testField" bindTo="field">
            <Button testId="custom" label="{$data.field}" />
          </FormItem>
        </Form> `);
    const driver = await createButtonDriver("custom");
    await expect(driver.component).toHaveExplicitLabel("test");
  });

  test(
    "$data is correctly undefined if data is not set in props",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createButtonDriver }) => {
      await initTestBed(`
        <Form>
          <FormItem label="testField" bindTo="field">
            <Button testId="custom" label="{$data.field}" />
          </FormItem>
        </Form> `);
      const driver = await createButtonDriver("custom");
      await expect(driver.component).toHaveExplicitLabel(undefined);
    },
  );

  // --- --- enabled

  test.skip(
    "Form buttons and contained FormItems are enabled",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "Form buttons and contained FormItems are disabled",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  // --- --- submit

  test("submit only triggers when enabled", async ({ initTestBed, createFormDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Form enabled="false" data="{{ name: 'John' }}" onSubmit="testState = true">
        <FormItem bindTo="name" />
      </Form>`,
    );
    const driver = await createFormDriver();
    await expect(driver.getSubmitButton()).toBeDisabled();

    await driver.submitForm("keypress");
    await expect.poll(testStateDriver.testState).toEqual(null);
  });

  test("submit with unbound fields", async ({ page, initTestBed, createFormDriver }) => {
    await initTestBed(`
      <Fragment var.output="none">
        <Form testId="form"
          data="{{ firstname: 'James', lastname: 'Clewell' }}"
          onSubmit="args => output = JSON.stringify(args)">
          <FormItem label="Firstname" bindTo="firstname" />
          <FormItem label="Middle name" initialValue="Robert" />
          <FormItem label="Lastname" />
        </Form>
        <Text testId="text">{output}</Text>
      </Fragment>
    `);
    const driver = await createFormDriver("form");
    await driver.submitForm();
    await expect(page.getByTestId("text")).toHaveText('{"firstname":"James"}');
  });

  test(`submit with type 'items'`, async ({
    initTestBed,
    createFormDriver,
    createButtonDriver,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data" testId="form">
        <FormItem testId="formItem" type="items" bindTo="arrayItems" id="arrayItems">
            <FormItem bindTo="name" testId="text{$itemIndex}"/>
        </FormItem>
        <Button testId="addButton" onClick="arrayItems.addItem()"/>
      </Form>`);

    await (await createButtonDriver("addButton")).click();
    await (await createFormItemDriver("text0")).textBox.fill("John");
    await (await createButtonDriver("addButton")).click();
    await (await createFormItemDriver("text1")).textBox.fill("Peter");
    const driver = await createFormDriver("form");
    await driver.submitForm();
    await expect.poll(testStateDriver.testState).toStrictEqual({
      arrayItems: [{ name: "John" }, { name: "Peter" }],
    });
  });

  test(`submit with type 'items', empty bindTo`, async ({
    initTestBed,
    createFormDriver,
    createButtonDriver,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="data => testState = data" testId="form">
        <FormItem testId="formItem" type="items" bindTo="arrayItems" id="arrayItems">
            <FormItem testId="text{$itemIndex}" bindTo=""/>
        </FormItem>
        <Button testId="addButton" onClick="arrayItems.addItem()"/>
      </Form>`);

    await (await createButtonDriver("addButton")).click();
    await (await createFormItemDriver("text0")).textBox.fill("John");
    await (await createButtonDriver("addButton")).click();
    await (await createFormItemDriver("text1")).textBox.fill("Peter");
    const driver = await createFormDriver("form");
    await driver.submitForm();
    await expect.poll(testStateDriver.testState).toStrictEqual({
      arrayItems: ["John", "Peter"],
    });
  });

// --- Testing

// --- --- buttonRowTemplate

test("buttonRowTemplate can render buttons", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`
    <Form>
      <property name="buttonRowTemplate">
        <Button testId="submitBtn" type="submit" label="Hello Button" />
      </property>
    </Form>`);
  await expect((await createButtonDriver("submitBtn")).component).toBeAttached();
});

test.skip(
  "buttonRowTemplate replaces built-in buttons",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test("setting buttonRowTemplate without buttons still runs submit on Enter", async ({
  initTestBed,
  createFormDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="testState = true">
      <property name="buttonRowTemplate">
        <Fragment />
      </property>
      <FormItem bindTo="name" />
    </Form>
  `);
  const driver = await createFormDriver();

  await driver.submitForm("keypress");
  await expect.poll(testStateDriver.testState).toBe(true);
});

// --- --- itemLabelPosition

labelPositionValues.forEach((pos) => {
  test.skip(
    `label position ${pos} is applied by default for all FormItems`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    `label position ${pos} is not applied if overridden in FormItem`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- --- itemLabelWidth: Should we use this? Can we re-evaluate?

// --- --- itemLabelBreak: We should talk about this

test.skip(
  "FormItem labels break to next line",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "no label breaks if overriden in FormItem",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- data

test("data accepts an object", async ({
  initTestBed,
  createFormItemDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(`
    <Form data="{{ field1: 'test' }}">
      <FormItem testId="inputField" bindTo="field1" />
    </Form>
  `);
  const driver = await createFormItemDriver("inputField");
  await expect((await createTextBoxDriver(driver.input)).field).toHaveValue("test");
});

test(`data accepts primitive`, async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`
    <Form data="test">
      <FormItem bindTo="field1" />
    </Form>
  `);
  const component = (await createFormDriver()).component;
  await expect(component).toBeAttached();
});

test(`data accepts empty array`, async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`
    <Form data="{[]}">
      <FormItem bindTo="field1" />
    </Form>
  `);
  const component = (await createFormDriver()).component;
  await expect(component).toBeAttached();
});

// TODO
test.fixme(
  "data accepts relative URL endpoint",
  async ({ initTestBed, createFormItemDriver, createTextBoxDriver }) => {
    await initTestBed(
      `
      <Form data="/test">
        <FormItem testId="inputField" bindTo="name" />
      </Form>`,
      {
        apiInterceptor: {
          operations: {
            test: {
              url: "/test",
              method: "get",
              handler: `return { name: 'John' };`,
            },
          },
        },
      },
    );
    const driver = await createFormItemDriver("inputField");
    await expect((await createTextBoxDriver(driver.input)).field).toHaveValue("John");
  },
);

// TODO
test.fixme(
  "data accepts external URL endpoint",
  SKIP_REASON.TEST_NOT_WORKING(
    "Mock's not working for some reason, can access unmocked URLs though",
  ),
  async ({ initTestBed, createFormDriver, createFormItemDriver, createTextBoxDriver }) => {
    // data="https://api.spacexdata.com/v3/history/1"
    await initTestBed(`
    <Form data="https://example.com/test">
      <FormItem testId="inputField" bindTo="title" />
    </Form>
  `);
    const formDriver = await createFormDriver();
    const formItemDriver = await createFormItemDriver("inputField");

    await formDriver.mockExternalApi("**/*/test", { body: { name: "John" } });
    await expect((await createTextBoxDriver(formItemDriver.input)).field).toHaveValue("John");
  },
);

// --- --- cancelLabel: In the future we need to have a test case for the hideCancel prop

test.skip(
  "cancel button uses default label if cancelLabel is not set",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip("cancel button is rendered with cancelLabel", async ({ initTestBed }) => {});

// saveLabel

test.skip(
  "save button is rendered with default label if saveLabel is set to empty string",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "save button is rendered with saveLabel",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// saveInProgressLabel

test.skip(
  "save in progress label shows up on submission",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "save in progress label does not get stuck after submission is done",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// swapCancelAndSave

test.skip(
  "built-in button row order flips if swapCancelAndSave is true",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- submitUrl

test("form submits to correct url", async ({ initTestBed, createFormDriver }) => {
  const endpoint = "/test";
  await initTestBed(
    `
    <Form data="{{ name: 'John' }}" submitUrl="${endpoint}" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: endpoint,
            method: "post",
            handler: `{ return true; }`,
          },
        },
      },
    },
  );
  const driver = await createFormDriver();

  await driver.submitForm();
  const response = await driver.getSubmitResponse(endpoint);
  expect(response.ok()).toBe(true);
  expect(new URL(response.url()).pathname).toBe(endpoint);
});

// --- submitMethod

// NOTE: GET doesn't work because GET/HEAD cannot have a 'body'
["post", "put", "delete"].forEach((method) => {
  test(`${method} REST op on submit`, async ({ initTestBed, createFormDriver }) => {
    await initTestBed(`<Form submitUrl="/test" submitMethod="${method}" />`, {
      apiInterceptor: {
        operations: {
          testPost: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
          testPut: {
            url: "/test",
            method: "put",
            handler: `return true;`,
          },
          testDelete: {
            url: "/test",
            method: "delete",
            handler: `return true;`,
          },
        },
      },
    });
    const driver = await createFormDriver();
    const request = await driver.getSubmitRequest("/test", method, "click");
    expect(request.failure()).toBeNull();
  });
});

// --- submitting the Form

test("submit triggers when clicking save/submit button", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(
    `
    <Form data="{{ name: 'John' }}" submitUrl="/test" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );
  const driver = await createFormDriver();

  const request = await driver.getSubmitRequest("/test", "POST", "click");
  expect(request.failure()).toBeNull();
});

test("submit triggers when pressing Enter", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(
    `
    <Form data="{{ name: 'John' }}" submitUrl="/test" submitMethod="post">
      <FormItem bindTo="name" />
    </Form>`,
    {
      apiInterceptor: {
        operations: {
          test: {
            url: "/test",
            method: "post",
            handler: `return true;`,
          },
        },
      },
    },
  );
  const driver = await createFormDriver();

  const request = await driver.getSubmitRequest("/test", "POST", "keypress");
  expect(request.failure()).toBeNull();
});

test("user cannot submit with clientside errors present", async ({
  initTestBed,
  createFormDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="testState = true">
      <FormItem bindTo="name" required="true" />
    </Form>
  `);
  const driver = await createFormDriver();

  // The onSubmit event should have been triggered if not for the client error of an empty required field
  await driver.submitForm("click");
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- canceling

test.skip(
  "cancel only triggers when enabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- reset: TODO

// --- backend validation summary

const errorDisplayInterceptor: ApiInterceptorDefinition = {
  initialize: `
    $state.items = {
      [10]: { name: "Smith", id: 10 }
    };
    $state.currentId = 10;
  `,
  operations: {
    "no-validation-error": {
      url: "/no-validation-error",
      method: "post",
      handler: `return true;`,
    },
    "general-validation-error": {
      url: "/general-validation-error",
      method: "post",
      handler: `
        throw Errors.HttpError(404,
          {
            message: "General error message from the backend",
            issues: [
              { message: "Error for the whole form", severity: "error" },
              { message: "Warning for the whole form", severity: "warning" },
            ]
          }
        );
      `,
    },
    "field-validation-error": {
      url: "/field-validation-error",
      method: "post",
      handler: `
        throw Errors.HttpError(404,
          {
            message: "Field error message from the backend",
            issues: [
              { field: "test", message: "Display warning", severity: "warning" },
            ]
          }
        );
      `,
    },
  },
};

test("submitting with errors shows validation summary", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`<Form submitUrl="/general-validation-error" submitMethod="post" />`, {
    apiInterceptor: errorDisplayInterceptor,
  });
  const driver = await createFormDriver();
  await driver.submitForm();
  await expect(await driver.getValidationSummary()).toBeVisible();
});

test("submitting without errors does not show summary", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`<Form submitUrl="/no-validation-error" submitMethod="post" />`, {
    apiInterceptor: errorDisplayInterceptor,
  });
  const driver = await createFormDriver();
  await driver.submitForm();
  await expect(await driver.getValidationSummary()).not.toBeVisible();
});

test("general error messages are rendered in the summary", async ({
  initTestBed,
  createFormDriver,
  createValidationDisplayDriver,
}) => {
  await initTestBed(`<Form submitUrl="/general-validation-error" submitMethod="post" />`, {
    apiInterceptor: errorDisplayInterceptor,
  });
  const formDriver = await createFormDriver();
  await formDriver.submitForm();

  // TODO: strip this down -> it's verbose but hard to read
  const warningDisplay = await createValidationDisplayDriver(
    await formDriver.getValidationDisplaysBySeverity("warning"),
  );
  const errorDisplay = await createValidationDisplayDriver(
    await formDriver.getValidationDisplaysBySeverity("error"),
  );

  expect(await warningDisplay.getText()).toContain("Warning for the whole form");
  expect(await errorDisplay.getText()).toContain("Error for the whole form");
});

test("field-related errors are rendered at FormItems", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
}) => {
  await initTestBed(
    `
      <Form submitUrl="/field-validation-error" submitMethod="post">
        <FormItem testId="testField" bindTo="test" label="test" />
      </Form>`,
    {
      apiInterceptor: errorDisplayInterceptor,
    },
  );
  const formDriver = await createFormDriver();
  const fieldDriver = await createFormItemDriver("testField");

  await formDriver.submitForm();
  await expect(await fieldDriver.getValidationStatusIndicator()).toHaveAttribute(
    fieldDriver.validationStatusTag,
    "warning",
  );
});

test("field-related errors map to correct FormItems", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
}) => {
  await initTestBed(
    `
      <Form submitUrl="/field-validation-error" submitMethod="post">
        <FormItem testId="testField" bindTo="test" label="test" />
        <FormItem testId="testField2" bindTo="test2" label="test2" />
      </Form>`,
    {
      apiInterceptor: errorDisplayInterceptor,
    },
  );
  const formDriver = await createFormDriver();
  const fieldDriver = await createFormItemDriver("testField");

  await formDriver.submitForm();
  await expect(await fieldDriver.getValidationStatusIndicator()).toHaveAttribute(
    fieldDriver.validationStatusTag,
    "warning",
  );
});

test.skip(
  "field-related errors disappear if user updates FormItems",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// NOTE: this could be multiple tests
test.skip(
  "user can close all parts of the summary according to severity",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "submitting with errors 2nd time after user close shows summary again",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "Form shows confirmation dialog if warnings are present",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- Smart Form Cases

const smartCrudInterceptor: ApiInterceptorDefinition = {
  initialize: `
    $state.items = {
      [10]: { name: "Smith", id: 10 }
    };
    $state.currentId = 10;
  `,
  operations: {
    create: {
      url: "/entities",
      method: "post",
      handler: `() => {
        $state.currentId++;
        $state.items[$state.currentId] = $requestBody;
        $state.items[$state.currentId].id = $state.currentId;

        return $state.items[$state.currentId];
      }`,
    },
    read: {
      url: "/entities/:id",
      method: "get",
      handler: `() => {
        return $state.items[$pathParams.id];
      }`,
    },
    update: {
      url: "/entities/:id",
      method: "put",
      handler: `() => {
        $state.items[$pathParams.id] = { ...$state.items[$pathParams.id], ...$requestBody };
        return $state.items[$pathParams.id];
      }`,
    },
  },
};

test("create form works with submitUrl", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(
    `
    <Form submitUrl="/entities">
      <FormItem bindTo="name" testId="nameInput"/>
    </Form>
  `,
    { apiInterceptor: smartCrudInterceptor },
  );
  const formDriver = await createFormDriver();
  const inputElement = (await createFormItemDriver("nameInput")).input;
  const fieldDriver = await createTextBoxDriver(inputElement);

  await fieldDriver.field.fill("John");
  await formDriver.submitForm("click");

  const response = await formDriver.getSubmitResponse();
  expect(await response.json()).toEqual({
    name: "John",
    id: 11,
  });
});

test.skip(
  "edit form works with data url",
  SKIP_REASON.TEST_INFRA_BUG(`
    Somehow the initTestBed does not initialize the Form properly,
    thus the test will fail.
    Doing the same with the "initApp" or initComponent functions will work.

    Need to investigate.
    `),
  async ({ initTestBed, createFormDriver, createFormItemDriver, createTextBoxDriver }) => {
    await initTestBed(
      `
      <Form submitUrl="/entities/10">
        <FormItem bindTo="name" testId="nameInput"/>
      </Form>
    `,
      { apiInterceptor: smartCrudInterceptor },
    );
    const formDriver = await createFormDriver();
    const inputElement = (await createFormItemDriver("nameInput")).input;
    const fieldDriver = await createTextBoxDriver(inputElement);

    await expect(fieldDriver.field).toHaveValue("Smith");

    await fieldDriver.field.fill("EDITED-Smith");
    await formDriver.submitForm("click");

    const response = await formDriver.getSubmitResponse();
    expect(await response.json()).toEqual({
      name: "EDITED-Smith",
      id: 10,
    });
  },
);
// ORIGINAL TEST BELOW
/*
test("edit form works with data url", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
        <Form data="/entities/10">
            <FormItem bindTo="name" testId="nameInput"/>
        </Form>
    `,
    apiInterceptor: crudInterceptor,
  });
  await expect(page.getByTestId("nameInput").getByRole("textbox")).toHaveValue("Smith");
  const responsePromise = page.waitForResponse((response) => response.url().includes("/entities"));
  await page.getByTestId("nameInput").getByRole("textbox").fill("EDITED-Smith");
  await page.locator("button[type='submit']").click();

  const response = await responsePromise;
  const responseBody = await response.json();
  expect(responseBody).toEqual({
    name: "EDITED-Smith",
    id: 10,
  });
});
*/

test("regression: data url through modal context", async ({
  initTestBed,
  createButtonDriver,
  createFormDriver,
  createFormItemDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(
    `
      <Fragment>
        <Button testId="openModalButton" onClick="modal.open({data: '/entities/10'})"/>
        <ModalDialog id="modal">
          <Form testId="modalForm" data="{$param.data}" submitUrl="{$param.submitUrl}">
             <FormItem bindTo="name" testId="nameInput"/>
          </Form>
        </ModalDialog>
      </Fragment>
    `,
    {
      apiInterceptor: smartCrudInterceptor,
    },
  );
  const formDriver = await createFormDriver("modalForm");
  const inputElement = (await createFormItemDriver("nameInput")).input;
  const inputDriver = await createTextBoxDriver(inputElement);

  (await createButtonDriver("openModalButton")).click();

  await expect(inputDriver.field).toHaveValue("Smith");

  await inputDriver.field.fill("EDITED-Smith");
  await formDriver.submitForm("click");

  const response = await formDriver.getSubmitResponse();
  expect(await response.json()).toEqual({
    name: "EDITED-Smith",
    id: 10,
  });
});

// --- Conditional Rendering Cases

test("can submit with invisible required field", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
  createTextBoxDriver,
  page,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="testState = true">
      <FormItem testId="select" bindTo="authenticationType"
        type="select" label="Authentication Type:" initialValue="{0}">
        <Option value="{0}" label="Password" />
        <Option value="{1}" label="Public Key" />
      </FormItem>
      <FormItem label="name1" testId="name1" bindTo="name1"
        required="true" when="{$data.authenticationType == 0}"/>
      <FormItem label="name2" testId="name2" bindTo="name2"
        required="true" when="{$data.authenticationType == 1}"/>
    </Form>
  `);
  const formDriver = await createFormDriver();
  const selectDriver = await createFormItemDriver("select");
  const textfieldElement = (await createFormItemDriver("name2")).input;
  const textfieldDriver = await createTextBoxDriver(textfieldElement);

  await selectDriver.component.click();
  await page.getByLabel("Public Key").click();
  await textfieldDriver.field.fill("John");
  await formDriver.submitForm();

  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("conditional fields keep the state", async ({
  initTestBed,
  createFormItemDriver,
  createOptionDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(`
    <Form>
      <FormItem testId="select" bindTo="authenticationType"
        type="radioGroup" label="Authentication Type:" initialValue="{0}">
        <Option value="{0}" label="Password" testId="password"/>
        <Option value="{1}" label="Public Key" testId="publicKey" />
      </FormItem>
      <FormItem label="name1" testId="name1" bindTo="name1"
        required="true" when="{$data.authenticationType == 0}"/>
      <FormItem label="name2" testId="name2" bindTo="name2"
        required="true" when="{$data.authenticationType == 1}"/>
    </Form>
  `);
  const option1Driver = await createFormItemDriver("password");
  const option2Driver = await createOptionDriver("publicKey");
  const textfield1Element = (await createFormItemDriver("name1")).input;
  const textfield1Driver = await createTextBoxDriver(textfield1Element);
  const textfield2Element = (await createFormItemDriver("name2")).input;
  const textfield2Driver = await createTextBoxDriver(textfield2Element);

  await textfield1Driver.field.fill("name1");
  await option2Driver.click();
  await textfield2Driver.field.fill("name2");
  await option1Driver.click();

  await expect(textfield1Driver.field).toHaveValue("name1");
});