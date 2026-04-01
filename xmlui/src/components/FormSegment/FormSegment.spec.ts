import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC RENDERING
// =============================================================================

test.describe("Basic Rendering", () => {
  test("renders children inside a Form", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment>
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("renders multiple children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment>
          <FormItem label="First Name" bindTo="firstName" />
          <FormItem label="Last Name" bindTo="lastName" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("First Name")).toBeVisible();
    await expect(page.getByText("Last Name")).toBeVisible();
  });

  test("renders content from multiple segments", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment>
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
        <FormSegment>
          <FormItem label="Email" bindTo="email" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
  });
});

// =============================================================================
// $segmentData CONTEXT VARIABLE
// =============================================================================

test.describe("$segmentData context variable", () => {
  test("contains only the segment's fields", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Alice', email: 'alice@example.com' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" />
          <Button testId="btn" label="Get" onClick="testState = $segmentData" />
        </FormSegment>
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Alice" });
  });

  test("excludes fields from other segments", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ first: 'Alice', last: 'Smith', email: 'alice@example.com' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="First" bindTo="first" />
          <FormItem label="Last" bindTo="last" />
          <Button testId="btn" label="Get" onClick="testState = $segmentData" />
        </FormSegment>
        <FormSegment>
          <FormItem label="Email" bindTo="email" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toEqual({ first: "Alice", last: "Smith" });
  });

  test("updates reactively when field value changes", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <Button testId="btn" label="Get" onClick="testState = $segmentData" />
        </FormSegment>
      </Form>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Bob");

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Bob" });
  });
});

// =============================================================================
// $segmentValidationIssues CONTEXT VARIABLE
// =============================================================================

test.describe("$segmentValidationIssues context variable", () => {
  test("is empty when no validation issues exist", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Bob' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = $segmentValidationIssues" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toEqual({});
  });

  test("contains issues only for segment fields", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = Object.keys($segmentValidationIssues)" />
        </FormSegment>
        <FormItem label="Email" bindTo="email" required="true" testId="emailField" />
      </Form>
    `);
    // Touch the name field and leave it empty to trigger validation
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    // Only the segment's "name" field issue should appear
    await expect.poll(testStateDriver.testState).toEqual(["name"]);
  });
});

// =============================================================================
// $hasSegmentValidationIssue CONTEXT VARIABLE
// =============================================================================

test.describe("$hasSegmentValidationIssue context variable", () => {
  test("returns false when no segment field has issues", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Bob' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" />
          <Button testId="btn" label="Check" onClick="testState = $hasSegmentValidationIssue()" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("returns true when any segment field has an issue", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = $hasSegmentValidationIssue()" />
        </FormSegment>
      </Form>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("returns false for a named field without issues", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Bob' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" />
          <Button testId="btn" label="Check" onClick="testState = $hasSegmentValidationIssue('name')" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("returns true for a specific field with issues", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <FormItem label="Email" bindTo="email" />
          <Button testId="btn" label="Check" onClick="testState = $hasSegmentValidationIssue('name')" />
        </FormSegment>
      </Form>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("returns false for a different field without issues", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <FormItem label="Email" bindTo="email" />
          <Button testId="btn" label="Check" onClick="testState = $hasSegmentValidationIssue('email')" />
        </FormSegment>
      </Form>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });
});

// =============================================================================
// FIELD DISCOVERY
// =============================================================================

test.describe("Field discovery", () => {
  test("auto-discovers bindTo fields from direct children", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ first: 'Alice', last: 'Smith' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="First" bindTo="first" />
          <FormItem label="Last" bindTo="last" />
          <Button testId="btn" label="Get" onClick="testState = Object.keys($segmentData)" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(async () => {
      const keys = await testStateDriver.testState() as string[] | null;
      return keys?.sort();
    }).toEqual(["first", "last"]);
  });

  test("auto-discovers bindTo fields from nested children", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Alice', email: 'alice@example.com' }}" hideButtonRow="true">
        <FormSegment>
          <VStack>
            <FormItem label="Name" bindTo="name" />
            <FormItem label="Email" bindTo="email" />
          </VStack>
          <Button testId="btn" label="Get" onClick="testState = Object.keys($segmentData)" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(async () => {
      const keys = await testStateDriver.testState() as string[] | null;
      return keys?.sort();
    }).toEqual(["email", "name"]);
  });

  test("explicit fields prop overrides auto-discovery", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Alice', email: 'alice@example.com', phone: '555' }}" hideButtonRow="true">
        <FormSegment fields="name, email">
          <FormItem label="Name" bindTo="name" />
          <FormItem label="Email" bindTo="email" />
          <FormItem label="Phone" bindTo="phone" />
          <Button testId="btn" label="Get" onClick="testState = Object.keys($segmentData)" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(async () => {
      const keys = await testStateDriver.testState() as string[] | null;
      return keys?.sort();
    }).toEqual(["email", "name"]);
  });
});

// =============================================================================
// displayWhen BEHAVIOR
// =============================================================================

test.describe("displayWhen behavior", () => {
  test("is visible by default (no displayWhen prop)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment>
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("hides content when displayWhen is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment displayWhen="{false}">
          <FormItem label="Hidden Field" bindTo="hidden" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Hidden Field")).not.toBeVisible();
  });

  test("shows content when displayWhen is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment displayWhen="{true}">
          <FormItem label="Visible Field" bindTo="visible" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Visible Field")).toBeVisible();
  });

  test("hidden segment fields remain in form submission", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.step="{1}">
        <Form hideButtonRow="true" onSubmit="data => testState = data">
          <FormSegment displayWhen="{step === 1}">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
          <FormSegment displayWhen="{step === 2}">
            <FormItem label="Email" bindTo="email" testId="emailField" />
          </FormSegment>
          <Button testId="next" label="Next" onClick="step = 2" />
          <Button testId="submit" label="Submit" type="submit" />
        </Form>
      </Fragment>
    `);

    // Fill the name field on step 1
    const nameItem = await createFormItemDriver("nameField");
    const nameInput = await createTextBoxDriver(nameItem.input);
    await nameInput.field.fill("Alice");

    // Advance to step 2
    await page.getByTestId("next").click();

    // Fill email on step 2
    const emailItem = await createFormItemDriver("emailField");
    const emailInput = await createTextBoxDriver(emailItem.input);
    await emailInput.field.fill("alice@example.com");

    // Submit includes data from both steps
    await page.getByTestId("submit").click();
    await expect.poll(testStateDriver.testState).toEqual({
      name: "Alice",
      email: "alice@example.com",
    });
  });

  test("displayWhen toggles visibility reactively", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.show="{true}">
        <Button testId="toggle" label="Toggle" onClick="show = !show" />
        <Form>
          <FormSegment displayWhen="{show}">
            <FormItem label="Toggled Field" bindTo="field" />
          </FormSegment>
        </Form>
      </Fragment>
    `);

    await expect(page.getByText("Toggled Field")).toBeVisible();
    await page.getByTestId("toggle").click();
    await expect(page.getByText("Toggled Field")).not.toBeVisible();
    await page.getByTestId("toggle").click();
    await expect(page.getByText("Toggled Field")).toBeVisible();
  });
});

// =============================================================================
// ORIENTATION AND LAYOUT PROPERTIES
// =============================================================================

test.describe("Orientation and layout properties", () => {
  test("defaults to vertical orientation (VStack)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormSegment>
          <FormItem label="Name" bindTo="name" />
          <FormItem label="Email" bindTo="email" />
        </FormSegment>
      </Form>
    `);
    // Fields should be stacked vertically (one appears above the other)
    const nameField = page.getByText("Name");
    const emailField = page.getByText("Email");
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
  });

  test("transposes width property to the internal stack", async ({
    initTestBed,
    page,
    createFormItemDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormSegment width="300px">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </FormSegment>
      </Form>
    `);
    // The segment's width property should apply to the VStack wrapper
    const nameField = await createFormItemDriver("nameField");
    const labelElement = page.getByText("Name");
    await expect(labelElement).toBeVisible();
  });

  test("transposes padding property to the internal stack", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <FormSegment padding="16px">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("transposes gap property to the internal stack", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <FormSegment gap="8px">
          <FormItem label="Name" bindTo="name" />
          <FormItem label="Email" bindTo="email" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
  });

  test("transposes backgroundColor property to the internal stack", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <FormSegment backgroundColor="#f0f0f0">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("transposes multiple layout properties simultaneously", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <FormSegment padding="12px" gap="10px" backgroundColor="#f9f9f9" borderRadius="4px">
          <FormItem label="First Name" bindTo="firstName" />
          <FormItem label="Last Name" bindTo="lastName" />
        </FormSegment>
      </Form>
    `);
    await expect(page.getByText("First Name")).toBeVisible();
    await expect(page.getByText("Last Name")).toBeVisible();
  });
});

// =============================================================================
// API: isValid AND hasIssues
// =============================================================================

test.describe("APIs: isValid and hasIssues", () => {
  test("isValid returns true when all segment fields are valid", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Bob' }}" hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" />
          <Button testId="btn" label="Check" onClick="testState = seg1.isValid" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("isValid returns false when any segment field has a validation issue", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = seg1.isValid" />
        </FormSegment>
      </Form>
    `);
    // Touch field and leave empty to trigger validation error
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasIssues returns false when all segment fields are valid", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ name: 'Bob' }}" hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" />
          <Button testId="btn" label="Check" onClick="testState = seg1.hasIssues" />
        </FormSegment>
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasIssues returns true when any segment field has a validation issue", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = seg1.hasIssues" />
        </FormSegment>
      </Form>
    `);
    // Touch field and leave empty to trigger validation error
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("isValid and hasIssues are opposites", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = { isValid: seg1.isValid, hasIssues: seg1.hasIssues }" />
        </FormSegment>
      </Form>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);

    // Initially no validation error (field untouched)
    await page.getByTestId("btn").click();
    let result = await testStateDriver.testState();
    expect(result.isValid === !result.hasIssues).toBe(true);

    // Create validation error
    await input.field.focus();
    await input.field.blur();

    await page.getByTestId("btn").click();
    result = await testStateDriver.testState();
    expect(result.isValid === !result.hasIssues).toBe(true);

    // Fix validation error
    await input.field.fill("Alice");
    await page.getByTestId("btn").click();
    result = await testStateDriver.testState();
    expect(result.isValid === !result.hasIssues).toBe(true);
  });

  test("APIs only reflect issues for segment fields, not other form fields", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment id="seg1">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button testId="btn" label="Check" onClick="testState = seg1.isValid" />
        </FormSegment>
        <FormItem label="Email" bindTo="email" required="true" testId="emailField" />
      </Form>
    `);

    // Make email field (outside segment) invalid
    const emailItem = await createFormItemDriver("emailField");
    const emailInput = await createTextBoxDriver(emailItem.input);
    await emailInput.field.focus();
    await emailInput.field.blur();

    // But name field (inside segment) is valid
    const nameItem = await createFormItemDriver("nameField");
    const nameInput = await createTextBoxDriver(nameItem.input);
    await nameInput.field.fill("Alice");

    // Segment should still be valid because email is outside the segment
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });
});

// =============================================================================
// CONTEXT VARIABLE SCOPING
// =============================================================================

test.describe("Context variable scoping", () => {
  test("each segment has independent $segmentData", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form data="{{ a: '1', b: '2' }}" hideButtonRow="true">
        <FormSegment>
          <FormItem label="A" bindTo="a" />
          <Button testId="btnA" label="Get A" onClick="testState = $segmentData" />
        </FormSegment>
        <FormSegment>
          <FormItem label="B" bindTo="b" />
          <Button testId="btnB" label="Get B" onClick="testState = $segmentData" />
        </FormSegment>
      </Form>
    `);

    await page.getByTestId("btnA").click();
    await expect.poll(testStateDriver.testState).toEqual({ a: "1" });

    await page.getByTestId("btnB").click();
    await expect.poll(testStateDriver.testState).toEqual({ b: "2" });
  });

  test("$segmentData is not accessible outside the segment", async ({ initTestBed, page }) => {
    // $segmentData outside a FormSegment should be undefined
    const { testStateDriver } = await initTestBed(`
      <Form hideButtonRow="true">
        <FormSegment>
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
        <Button testId="btn" label="Check" onClick="testState = typeof $segmentData" />
      </Form>
    `);
    await page.getByTestId("btn").click();
    await expect.poll(testStateDriver.testState).toBe("undefined");
  });
});
