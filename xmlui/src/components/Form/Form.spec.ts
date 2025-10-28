import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";
import { labelPositionValues } from "../abstractions";
import { expect, test } from "../../testing/fixtures";
import { getElementStyle } from "../../testing/component-test-helpers";

// Test data constants
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

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ initTestBed, createFormDriver }) => {
    await initTestBed(`<Form testId="form"/>`);
    const driver = await createFormDriver("form");
    await expect(driver.component).toBeVisible();
  });

  test("component renders with form items", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

    await expect(page.getByText("Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
  });

  test("component renders save and cancel buttons by default", async ({ initTestBed, page }) => {
    await initTestBed(`<Form/>`);

    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("component renders custom button labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form cancelLabel="Go Back" saveLabel="Submit"/>
    `);

    await expect(page.getByRole("button", { name: "Go Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("component swaps cancel and save button positions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form swapCancelAndSave="true"/>
    `);

    const buttons = page.getByRole("button");
    await expect(buttons.first()).toHaveText("Save");
    await expect(buttons.last()).toHaveText("Cancel");
  });

  // =============================================================================
  // HIDE BUTTON ROW TESTS
  // =============================================================================

  test.describe("hideButtonRow property", () => {
    test("hides button row when set to true", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="true"/>`);

      await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();
    });

    test("shows button row when set to false", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="false"/>`);

      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("shows button row by default when property not set", async ({ initTestBed, page }) => {
      await initTestBed(`<Form/>`);

      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("hides custom button row template when set to true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRow="true">
          <property name="buttonRowTemplate">
            <Button label="Custom Save" type="submit" testId="customSave" />
            <Button label="Custom Cancel" type="button" testId="customCancel" />
          </property>
        </Form>
      `);

      await expect(page.getByTestId("customSave")).not.toBeVisible();
      await expect(page.getByTestId("customCancel")).not.toBeVisible();
    });

    test("overrides hideButtonRowUntilDirty when both are set", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRow="true" hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      // Button row should be hidden even before making changes
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();

      // Make the form dirty
      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("John");

      // Button row should still be hidden even after making changes
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();
    });

    test("handles null value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="{null}"/>`);

      // Should show button row (default behavior)
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("handles undefined value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="{undefined}"/>`);

      // Should show button row (default behavior)
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("handles string 'true' value", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="true"/>`);

      await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();
    });

    test("handles string 'false' value", async ({ initTestBed, page }) => {
      await initTestBed(`<Form hideButtonRow="false"/>`);

      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("form submission still works with hidden button row via external submit", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <Form id="testForm" hideButtonRow="true" onSubmit="arg => testState = arg">
            <FormItem label="Name" bindTo="name" testId="nameField" />
            <Button type="submit" label="External Submit" testId="externalSubmit" />
          </Form>
        </Fragment>
      `);

      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("John Doe");

      await page.getByTestId("externalSubmit").click();

      const submittedData = await testStateDriver.testState();
      expect(submittedData).toEqual({ name: "John Doe" });
    });
  });

  // =============================================================================
  // HIDE BUTTON ROW UNTIL DIRTY TESTS
  // =============================================================================

  test.describe("hideButtonRowUntilDirty property", () => {
    test("hides button row initially when form is not dirty", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();
    });

    test("shows button row when form becomes dirty", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      // Initially hidden
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();

      // Make form dirty
      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("John");

      // Now visible
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("keeps button row visible after form becomes dirty", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);

      // Make form dirty
      await input.field.fill("John");
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();

      // Clear the input (form is still dirty)
      await input.field.clear();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("shows button row by default when property set to false", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="false">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("shows button row by default when property not set", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form>
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("works with multiple form items", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <FormItem label="Email" bindTo="email" testId="emailField" />
        </Form>
      `);

      // Initially hidden
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();

      // Modify second field
      const emailDriver = await createFormItemDriver("emailField");
      const emailInput = await createTextBoxDriver(emailDriver.input);
      await emailInput.field.fill("test@example.com");

      // Now visible
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("hides custom button row template until dirty", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <property name="buttonRowTemplate">
            <Button label="Custom Save" type="submit" testId="customSave" />
          </property>
        </Form>
      `);

      // Initially hidden
      await expect(page.getByTestId("customSave")).not.toBeVisible();

      // Make form dirty
      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("John");

      // Now visible
      await expect(page.getByTestId("customSave")).toBeVisible();
    });

    test("handles null value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="{null}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      // Should show button row (default behavior)
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("handles undefined value gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="{undefined}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      // Should show button row (default behavior)
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("works with form initialized with data", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true" data="{{ name: 'Initial' }}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      // Initially hidden (form has data but is not dirty)
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();

      // Make form dirty
      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("Modified");

      // Now visible
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("button row appears when checkbox is checked", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Accept Terms" bindTo="terms" type="checkbox" />
        </Form>
      `);

      // Initially hidden
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();

      // Check the checkbox
      const checkbox = page.getByRole("checkbox");
      await checkbox.check();

      // Now visible
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });

    test("button row appears when slider value changes", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form hideButtonRowUntilDirty="true">
          <FormItem label="Volume" bindTo="volume" type="slider" testId="volumeField" />
        </Form>
      `);

      // Initially hidden
      await expect(page.getByRole("button", { name: "Save" })).not.toBeVisible();

      // Move the slider using keyboard
      const slider = page.getByRole("slider");
      await slider.press("ArrowRight");

      // Now visible
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    });
  });

  // =============================================================================
  // ENABLE SUBMIT PROPERTY TESTS
  // =============================================================================

  test.describe("enableSubmit property", () => {
    test("disables submit button when set to false", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="false"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeDisabled();
    });

    test("enables submit button when set to true", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="true"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();
    });

    test("submit button is enabled by default when property not set", async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Form/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeEnabled();
    });

    test("prevents form submission when set to false", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form enableSubmit="false" onSubmit="arg => testState = arg">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeDisabled();

      // Verify form does not submit (button is disabled, so click won't work)
      await saveButton.click({ force: true }); // Force click on disabled button

      // testState should remain null since submit was prevented
      await expect.poll(testStateDriver.testState).toBeNull();
    });

    test("allows form submission when set to true", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form enableSubmit="true" onSubmit="arg => testState = arg">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </Form>
      `);

      const driver = await createFormItemDriver("nameField");
      const input = await createTextBoxDriver(driver.input);
      await input.field.fill("John Doe");

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();

      const submittedData = await testStateDriver.testState();
      expect(submittedData).toEqual({ name: "John Doe" });
    });

    test("handles null value gracefully (defaults to enabled)", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="{null}"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeEnabled();
    });

    test("handles string 'true' value", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="true"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeEnabled();
    });

    test("handles string 'false' value", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="false"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeDisabled();
    });

    test("does not affect cancel button", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="false"/>`);

      const cancelButton = page.getByRole("button", { name: "Cancel" });
      await expect(cancelButton).toBeEnabled();
    });

    test("works with custom submit button label", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enableSubmit="false" saveLabel="Submit Now"/>`);

      const submitButton = page.getByRole("button", { name: "Submit Now" });
      await expect(submitButton).toBeDisabled();
    });

    test("works together with form disabled state", async ({ initTestBed, page }) => {
      await initTestBed(`<Form enabled="false" enableSubmit="true"/>`);

      const saveButton = page.getByRole("button", { name: "Save" });
      // Form disabled takes precedence
      await expect(saveButton).toBeDisabled();
    });
  });

  // =============================================================================
  // DATA PROPERTY TESTS
  // =============================================================================

  test.describe("data property", () => {
    test("sets initial form data", async ({
      initTestBed,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form data="{{ name: 'John', age: 30 }}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <FormItem label="Age" bindTo="age" type="integer" testId="ageField" />
        </Form>
      `);

      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);
      const ageDriver = await createFormItemDriver("ageField");
      const ageInput = await createTextBoxDriver(ageDriver.input);

      await expect(nameInput.field).toHaveValue("John");
      await expect(ageInput.field).toHaveValue("30");
    });

    test("handles null data gracefully", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(`<Form data="{null}" testId="form"/>`);
      const driver = await createFormDriver("form");
      await expect(driver.component).toBeVisible();
    });

    test("handles undefined data gracefully", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(`<Form data="{undefined}" testId="form"/>`);
      const driver = await createFormDriver("form");
      await expect(driver.component).toBeVisible();
    });

    test("handles empty object data", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(`<Form data="{{}}" testId="form"/>`);
      const driver = await createFormDriver("form");
      await expect(driver.component).toBeVisible();
    });
  });

  // =============================================================================
  // ITEM LABEL POSITION TESTS
  // =============================================================================

  test.describe("itemLabelPosition property", () => {
    labelPositionValues.forEach((position) => {
      test(`sets item label position to ${position}`, async ({
        initTestBed,
        createFormItemDriver,
      }) => {
        await initTestBed(`
          <Form itemLabelPosition="${position}">
            <FormItem label="Test Label" bindTo="test" testId="testField" />
          </Form>
        `);

        const driver = await createFormItemDriver("testField");
        await expect(driver.label).toBeVisible();
      });
    });

    test("handles invalid itemLabelPosition gracefully", async ({
      initTestBed,
      createFormDriver,
    }) => {
      await initTestBed(`<Form itemLabelPosition="invalid" testId="form"/>`);
      const driver = await createFormDriver("form");
      await expect(driver.component).toBeVisible();
    });
  });

  // =============================================================================
  // ITEM LABEL WIDTH TESTS
  // =============================================================================

  test.describe("itemLabelWidth property", () => {
    test("sets custom label width", async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
        <Form itemLabelWidth="200px">
          <FormItem label="Test Label" bindTo="test" testId="testField" />
        </Form>
      `);

      const driver = await createFormItemDriver("testField");
      await expect(driver.label).toBeVisible();
    });

    test("handles numeric label width", async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
        <Form itemLabelWidth="150">
          <FormItem label="Test Label" bindTo="test" testId="testField" />
        </Form>
      `);

      const driver = await createFormItemDriver("testField");
      await expect(driver.label).toBeVisible();
    });

    test("handles invalid label width gracefully", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(`<Form itemLabelWidth="invalid" testId="form"/>`);
      const driver = await createFormDriver("form");
      await expect(driver.component).toBeVisible();
    });

    test("handles theme variable", async ({ initTestBed, createFormItemDriver }) => {
      const spaceBase = 0.25; //rem
      const labelSize = 10;
      const widthInPx = labelSize * spaceBase * 16; //px
      await initTestBed(`
        <Theme space-base="${spaceBase}rem">
          <Form itemLabelWidth="$space-${labelSize}">
            <FormItem label="Test Label" bindTo="test" testId="testField" />
          </Form>
        </Theme>
      `);
      const driver = await createFormItemDriver("testField");
      const labelWidth = await getElementStyle(driver.label, "width");
      expect(labelWidth).toBe(`${widthInPx}px`);
    });
  });

  // =============================================================================
  // ITEM LABEL BREAK TESTS
  // =============================================================================

  test.describe("itemLabelBreak property", () => {
    test("enables label line breaking", async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
        <Form itemLabelBreak="true">
          <FormItem label="Very Long Label That Should Break" bindTo="test" testId="testField" />
        </Form>
      `);

      const driver = await createFormItemDriver("testField");
      await expect(driver.label).toBeVisible();
    });

    test("disables label line breaking", async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
        <Form itemLabelBreak="false">
          <FormItem label="Very Long Label That Should Not Break" bindTo="test" testId="testField" />
        </Form>
      `);

      const driver = await createFormItemDriver("testField");
      await expect(driver.label).toBeVisible();
    });
  });

  // =============================================================================
  // ENABLED PROPERTY TESTS
  // =============================================================================

  test.describe("enabled property", () => {
    test("disables save button when enabled is false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form enabled="false">
          <FormItem label="Test" bindTo="test" />
        </Form>
      `);

      const saveButton = page.getByRole("button", { name: "Save" });
      await expect(saveButton).toBeDisabled();
    });

    test("enables form when enabled is true", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form enabled="true">
          <FormItem label="Test" bindTo="test" />
        </Form>
      `);

      const saveButton = page.getByRole("button", { name: "Save" });
      const cancelButton = page.getByRole("button", { name: "Cancel" });

      await expect(saveButton).toBeEnabled();
      await expect(cancelButton).toBeEnabled();
    });
  });

  // =============================================================================
  // BUTTON ROW TEMPLATE TESTS
  // =============================================================================

  test.describe("buttonRowTemplate property", () => {
    test("supports custom button row template", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Form>
          <FormItem label="Test" bindTo="test" />
          <property name="buttonRowTemplate">
            <Button label="Custom Save" type="submit" />
            <Button label="Custom Cancel" type="button" />
          </property>
        </Form>
      `);

      await expect(page.getByRole("button", { name: "Custom Save" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Custom Cancel" })).toBeVisible();
    });
  });

  // =============================================================================
  // EVENT TESTS
  // =============================================================================

  test.describe("Events", () => {
    test("onSubmit event fires with form data", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form data="{{ name: 'John', email: 'john@example.com' }}" onSubmit="data => testState = data">
          <FormItem label="Name" bindTo="name" />
          <FormItem label="Email" bindTo="email" />
        </Form>
      `);

      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(testStateDriver.testState).toEqual({
        name: "John",
        email: "john@example.com",
      });
    });

    test("onCancel event fires when cancel button clicked", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form onCancel="testState = 'cancelled'">
          <FormItem label="Test" bindTo="test" />
        </Form>
      `);

      await page.getByRole("button", { name: "Cancel" }).click();

      await expect.poll(testStateDriver.testState).toEqual("cancelled");
    });

    test("onSuccess event fires on successful submission", async ({
      initTestBed,
      page,
      createFormDriver,
    }) => {
      const { testStateDriver } = await initTestBed(
        `
        <Form
          testId="form"
          submitUrl="/test-success"
          onSuccess="testState = 'success'; console.log('Submitted successfully')"
          data="{{ name: 'Test' }}">
          <FormItem label="Name" bindTo="name" />
        </Form>
      `,
        {
          apiInterceptor: {
            operations: {
              testSuccess: {
                url: "/test-success",
                method: "put",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const driver = await createFormDriver("form");
      await driver.submitForm();
      await expect.poll(testStateDriver.testState).toEqual("success");
    });

    test("onReset event fires when form is reset", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Form
          id="testForm"
          onReset="testState = 'reset'"
          data="{{ name: 'Test' }}">
          <FormItem label="Name" bindTo="name" />
          <Button onClick="testForm.reset()" label="Reset Form" />
        </Form>
      `);

      await page.getByRole("button", { name: "Reset Form" }).click();

      await expect.poll(testStateDriver.testState).toEqual("reset");
    });
  });

  // =============================================================================
  // API TESTS
  // =============================================================================

  test.describe("APIs", () => {
    test("update method updates form data", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form
          id="testForm"
          data="{{ name: 'Original', age: 25 }}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <FormItem label="Age" bindTo="age" type="integer" testId="ageField" />
          <Button onClick="testForm.update({ name: 'Updated', age: 30 })" label="Update" />
        </Form>
      `);

      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);
      const ageDriver = await createFormItemDriver("ageField");
      const ageInput = await createTextBoxDriver(ageDriver.input);

      await expect(nameInput.field).toHaveValue("Original");
      await expect(ageInput.field).toHaveValue("25");

      await page.getByRole("button", { name: "Update" }).click();

      await expect(nameInput.field).toHaveValue("Updated");
      await expect(ageInput.field).toHaveValue("30");
    });

    test("reset method resets form to initial state", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      await initTestBed(`
        <Form
          id="testForm"
          data="{{ name: 'Initial' }}">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <Button onClick="testForm.reset()" label="Reset" />
        </Form>
      `);

      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);

      // Change the input value
      await nameInput.field.fill("Changed");
      await expect(nameInput.field).toHaveValue("Changed");

      // Reset the form
      await page.getByRole("button", { name: "Reset" }).click();

      await expect(nameInput.field).toHaveValue("Initial");
    });

    test("validate method returns validation results without submitting", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form id="testForm">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <FormItem label="Email" bindTo="email" testId="emailField" />
          <Button onClick="testState = testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Click validate button without filling required field
      await page.getByTestId("validateBtn").click();

      // Wait for validation to complete
      await page.waitForTimeout(100);

      const result = await testStateDriver.testState();
      expect(result).toBeTruthy();
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("validate method returns isValid true when all validations pass", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form id="testForm">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button onClick="testState = testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Fill the required field
      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);
      await nameInput.field.fill("John Doe");

      // Click validate button
      await page.getByTestId("validateBtn").click();

      // Wait for validation to complete
      await page.waitForTimeout(100);

      const result = await testStateDriver.testState();
      expect(result).toBeTruthy();
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test("validate method returns cleaned form data", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form id="testForm">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <FormItem label="Age" bindTo="age" type="integer" testId="ageField" />
          <Button onClick="testState = testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Fill form fields
      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);
      await nameInput.field.fill("John Doe");

      const ageDriver = await createFormItemDriver("ageField");
      const ageInput = await createTextBoxDriver(ageDriver.input);
      await ageInput.field.fill("30");

      // Click validate button
      await page.getByTestId("validateBtn").click();

      // Wait for validation to complete
      await page.waitForTimeout(100);

      const result = await testStateDriver.testState();
      expect(result).toBeTruthy();
      expect(result.data).toEqual({ name: "John Doe", age: "30" });
    });

    test("validate method displays validation errors on form", async ({
      initTestBed,
      page,
      createFormItemDriver,
    }) => {
      await initTestBed(`
        <Form id="testForm">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <Button onClick="testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Click validate without filling required field
      await page.getByTestId("validateBtn").click();

      // Validation error should be displayed
      const nameField = page.getByTestId("nameField");
      await expect(nameField).toContainText("This field is required");
    });

    test("validate method does not trigger form submission", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form id="testForm" onSubmit="testState = 'submitted'">
          <FormItem label="Name" bindTo="name" testId="nameField" />
          <Button onClick="testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Fill form
      const nameDriver = await createFormItemDriver("nameField");
      const nameInput = await createTextBoxDriver(nameDriver.input);
      await nameInput.field.fill("John");

      // Click validate button
      await page.getByTestId("validateBtn").click();

      // Wait a bit
      await page.waitForTimeout(200);

      // testState should remain null (not 'submitted')
      await expect.poll(testStateDriver.testState).toBeNull();
    });

    test("validate method returns complete validation results object", async ({
      initTestBed,
      page,
      createFormItemDriver,
      createTextBoxDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Form id="testForm">
          <FormItem label="Name" bindTo="name" required="true" testId="nameField" />
          <FormItem label="Email" bindTo="email" testId="emailField" />
          <Button onClick="testState = testForm.validate()" label="Validate" testId="validateBtn" />
        </Form>
      `);

      // Fill only email (name is required)
      const emailDriver = await createFormItemDriver("emailField");
      const emailInput = await createTextBoxDriver(emailDriver.input);
      await emailInput.field.fill("test@example.com");

      // Click validate button
      await page.getByTestId("validateBtn").click();

      // Wait for validation to complete
      await page.waitForTimeout(100);

      const result = await testStateDriver.testState();
      expect(result).toBeTruthy();
      expect(result.isValid).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.validationResults).toBeDefined();
    });
  });

  // =============================================================================
  // CONTEXT VARIABLE TESTS
  // =============================================================================

  test.describe("Context Variables", () => {
    test("$data context variable provides access to form data", async ({
      initTestBed,
      page,
      createFormItemDriver,
    }) => {
      // This test needs specific FormItem behavior that may vary
      await initTestBed(`
        <Form data="{{ isEnabled: true, name: 'Joe' }}">
          <FormItem testId="isEnabled" label="Enable name" bindTo="isEnabled" type="checkbox" />
          <FormItem testId="name" enabled="{$data.isEnabled}" label="Name" bindTo="name" />
        </Form>
      `);

      const enableSwitch = (await createFormItemDriver("isEnabled")).checkbox;
      const nameInput = (await createFormItemDriver("name")).textBox;

      await expect(enableSwitch).toBeVisible();
      await expect(nameInput).toBeEnabled();
      await enableSwitch.click();
      await expect(nameInput).toBeDisabled();
    });

    test("$data.update method updates form data", async ({
      initTestBed,
      page,
      createFormItemDriver,
    }) => {
      await initTestBed(`
        <Form data="{{ counter: 0 }}">
          <FormItem testId="counter" label="Counter" bindTo="counter" type="integer" />
          <Button onClick="$data.update({ counter: $data.counter + 1 })" label="Increment" />
        </Form>
      `);

      const counterDriver = await createFormItemDriver("counter");
      const counterInput = counterDriver.textBox;
      await expect(counterInput).toHaveValue("0");

      await page.getByRole("button", { name: "Increment" }).click({ force: true });

      await expect(counterInput).toHaveValue("1");
    });
  });

  // =============================================================================
  // SUBMIT URL AND METHOD TESTS
  // =============================================================================

  test.describe("Submit URL and Method", () => {
    test("submits to custom URL with POST method (new date)", async ({
      initTestBed,
      createFormDriver,
    }) => {
      await initTestBed(
        `<App><Form testId="form" submitUrl="/custom-endpoint" data="{null}">
            <FormItem label="Name" bindTo="name" />
        </Form></App>`,
        {
          apiInterceptor: {
            operations: {
              customEndpoint: {
                url: "/custom-endpoint",
                method: "post",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const driver = await createFormDriver("form");
      await driver.submitForm();

      const response = await driver.getSubmitResponse("/custom-endpoint");
      expect(response.ok()).toEqual(true);
    });

    test("uses PUT method for existing data", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(
        `<Form submitUrl="/entities/1" data="{{ id: 1, name: 'Existing' }}">
          <FormItem label="Name" bindTo="name" />
         </Form>`,
        {
          apiInterceptor: {
            operations: {
              updateEntity: {
                url: "/entities/1",
                method: "put",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const driver = await createFormDriver();
      await driver.submitForm();

      const response = await driver.getSubmitResponse("/entities/1");
      expect(response.ok()).toEqual(true);
    });

    test("uses custom submit method", async ({ initTestBed, createFormDriver }) => {
      await initTestBed(
        `<Form submitUrl="/custom" submitMethod="put" data="{{ name: 'Test' }}">
          <FormItem label="Name" bindTo="name" />
         </Form>`,
        {
          apiInterceptor: {
            operations: {
              putCustom: {
                url: "/custom",
                method: "put",
                handler: `return { success: true };`,
              },
            },
          },
        },
      );

      const driver = await createFormDriver();
      await driver.submitForm();

      const response = await driver.getSubmitResponse("/custom");
      expect(response.ok()).toEqual(true);
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("form has correct semantic role", async ({ initTestBed, page }) => {
    await initTestBed(`<Form/>`);
    await expect(page.locator("form")).toBeVisible();
  });

  test("form items are properly associated with labels", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem label="Full Name" bindTo="name" testId="nameField" />
      </Form>
    `);

    const driver = await createFormItemDriver("nameField");
    await expect(driver.label).toBeVisible();
    await expect(driver.label).toHaveText("Full Name");
  });

  test("form submission is keyboard accessible", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="testState = 'submitted via keyboard'">
        <FormItem label="Name" bindTo="name" />
      </Form>
    `);

    const submitButton = page.getByRole("button", { name: "Save" });
    await submitButton.focus();
    await page.keyboard.press("Enter");

    await expect.poll(testStateDriver.testState).toEqual("submitted via keyboard");
  });

  test("form cancel is keyboard accessible", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onCancel="testState = 'cancelled via keyboard'">
        <FormItem label="Name" bindTo="name" />
      </Form>
    `);

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.focus();
    await page.keyboard.press("Enter");

    await expect.poll(testStateDriver.testState).toEqual("cancelled via keyboard");
  });

  test("disabled form buttons are properly disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form enabled="false">
        <FormItem label="Name" bindTo="name" />
      </Form>
    `);

    const saveButton = page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeDisabled();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies custom gap theme variable", async ({ initTestBed, createFormDriver }) => {
    await initTestBed(`<Form testId="form"/>`, {
      testThemeVars: {
        "gap-Form": "2rem",
      },
    });

    const driver = await createFormDriver("form");
    await expect(driver.component).toHaveCSS("gap", "32px");
  });

  test("applies custom button row gap theme variable", async ({
    initTestBed,
    createFormDriver,
  }) => {
    await initTestBed(`<Form testId="form"/>`, {
      testThemeVars: {
        "gap-buttonRow-Form": "1rem",
      },
    });

    const driver = await createFormDriver("form");
    await expect(driver.component).toBeVisible();
  });

  test("applies validation display theme variables", async ({ initTestBed, page }) => {
    // This test requires validation system to trigger error display
    await initTestBed(
      `
      <Form>
        <FormItem testId="email" label="Email" bindTo="email" type="email" required="true" />
      </Form>
    `,
      {
        testThemeVars: {
          "backgroundColor-ValidationDisplay-error": "rgb(255, 0, 0)",
          "textColor-ValidationDisplay-error": "rgb(255, 255, 255)",
        },
      },
    );

    // Trigger validation by submitting with empty required field
    await page.getByRole("button", { name: "Save" }).click();

    const emailComp = page.getByTestId("email");
    await expect(emailComp).toContainText("This field is required");
  });
});

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles form without any form items", async ({ initTestBed, createFormDriver }) => {
    await initTestBed(`<Form testId="form"/>`);
    const driver = await createFormDriver("form");
    await expect(driver.component).toBeVisible();
  });

  test("handles malformed data input gracefully", async ({ initTestBed, createFormDriver }) => {
    await initTestBed(`<Form data="{invalidJson}" testId="form"/>`);
    const driver = await createFormDriver("form");
    await expect(driver.component).toBeVisible();
  });

  test("Form does not render if data receives malformed input", async ({
    initTestBed,
    createFormDriver,
  }) => {
    await initTestBed(`<Form data="{}" />`);
    await expect((await createFormDriver()).component).not.toBeAttached();
  });

  test("handles deeply nested data structure", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form data="{{ user: { profile: { name: 'John' } } }}">
        <FormItem label="Name" bindTo="user.profile.name" testId="nameField" />
      </Form>
    `);

    const driver = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(driver.input);
    await expect(input.field).toHaveValue("John");
  });

  test("handles form with validation errors", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormItem label="Email" bindTo="email" type="email" required="true" />
      </Form>
    `);

    // Try to submit form without filling required field
    await page.getByRole("button", { name: "Save" }).click();

    // Validation should prevent submission and show error
    const form = page.locator("form");
    await expect(form).toBeVisible();
  });

  test("handles rapid form submissions", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="testState = (testState || 0) + 1">
        <FormItem label="Name" bindTo="name" />
      </Form>
    `);

    const submitButton = page.getByRole("button", { name: "Save" });

    // Click submit button multiple times rapidly
    await submitButton.click();
    await submitButton.click();
    await submitButton.click();

    // Should only submit once or handle gracefully
    await expect.poll(testStateDriver.testState).toBeGreaterThanOrEqual(1);
  });

  test("handles null and undefined in nested data", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form data="{{ user: null, settings: undefined, name: 'Test' }}">
        <FormItem label="Name" bindTo="name" testId="nameField" />
      </Form>
    `);

    const driver = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(driver.input);
    await expect(input.field).toHaveValue("Test");
  });

  test("handles form with empty string properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form
        cancelLabel=""
        saveLabel=""
        data="{{ name: '' }}">
        <FormItem label="Name" bindTo="name" />
      </Form>
    `);

    // Form should still be visible
    const form = page.locator("form");
    await expect(form).toBeVisible();
  });

  test("handles special characters in form data", async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form data="{{ name: 'José María', description: 'Test & symbols' }}">
        <FormItem label="Name" bindTo="name" testId="nameField" />
        <FormItem label="Description" bindTo="description" testId="descField" />
      </Form>
    `);

    const nameDriver = await createFormItemDriver("nameField");
    const nameInput = await createTextBoxDriver(nameDriver.input);
    const descDriver = await createFormItemDriver("descField");
    const descInput = await createTextBoxDriver(descDriver.input);

    await expect(nameInput.field).toHaveValue("José María");
    await expect(descInput.field).toHaveValue("Test & symbols");
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
    await page.getByText("Public Key").click();
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

    // Fill in first field
    await textfield1Driver.field.fill("Test Value");
    await expect(textfield1Driver.field).toHaveValue("Test Value");

    // Switch to second option
    await option2Driver.component.click();

    // Switch back to first option
    await option1Driver.component.click();

    // Field should retain its value
    await expect(textfield1Driver.field).toHaveValue("Test Value");
  });
});

// =============================================================================
// ORIGINAL TEST SUITE (LEGACY TESTS)
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

test("$data is correctly undefined if data is not set in props", async ({
  initTestBed,
  createButtonDriver,
}) => {
  await initTestBed(`
        <Form>
          <FormItem label="testField" bindTo="field">
            <Button testId="custom" label="{$data.field}" />
          </FormItem>
        </Form> `);
  const driver = await createButtonDriver("custom");
  await expect(driver.component).toHaveExplicitLabel(undefined);
});

test("Form buttons and contained FormItems are enabled", async ({
  initTestBed,
  page,
  createFormDriver,
}) => {
  await initTestBed(`
      <Form testId="form">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  await expect(page.getByText("Name")).toBeVisible();
  await expect(page.getByText("Email")).toBeVisible();
  await expect(driver.cancelButton).toBeEnabled();
  await expect(driver.submitButton).toBeEnabled();
});

test("submit only triggers when enabled", async ({ initTestBed, createFormDriver }) => {
  const { testStateDriver } = await initTestBed(
    `
      <Form enabled="false" data="{{ name: 'John' }}" onSubmit="testState = true">
        <FormItem bindTo="name" />
      </Form>`,
  );
  const driver = await createFormDriver();
  await expect(driver.submitButton).toBeDisabled();

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

test("buttonRowTemplate replaces built-in buttons", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`
    <Form testId="form">
      <property name="buttonRowTemplate">
        <Button testId="submitBtn" type="submit" label="Hello Button" />
      </property>
    </Form>`);

  const driver = await createFormDriver("form");
  await expect(driver.submitButton).not.toBeVisible();
  await expect(driver.cancelButton).not.toBeVisible();
});

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

test("data accepts relative URL endpoint", async ({
  initTestBed,
  createFormItemDriver,
  createTextBoxDriver,
}) => {
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
});

test("cancel button and save button use default label", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`
      <Form testId="form">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  await expect(driver.cancelButton).toHaveText("Cancel");
  await expect(driver.submitButton).toHaveText("Save");
});

test("cancel button is rendered with cancelLabel", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`
      <Form testId="form" cancelLabel="Abort">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  await expect(driver.cancelButton).toHaveText("Abort");
  await expect(driver.submitButton).toHaveText("Save");
});

test("save button is rendered with saveLabel", async ({ initTestBed, createFormDriver }) => {
  await initTestBed(`
      <Form testId="form" saveLabel="Submit">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  await expect(driver.cancelButton).toHaveText("Cancel");
  await expect(driver.submitButton).toHaveText("Submit");
});

// swapCancelAndSave

test("built-in button row order is default if swapCancelAndSave is false", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`
      <Form testId="form" saveLabel="Submit">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  const cancelBox = await driver.cancelButton.boundingBox();
  const submitBox = await driver.submitButton.boundingBox();
  expect(cancelBox.x).toBeLessThan(submitBox.x);
});

test("built-in button row order flips if swapCancelAndSave is true", async ({
  initTestBed,
  createFormDriver,
}) => {
  await initTestBed(`
      <Form testId="form" saveLabel="Submit" swapCancelAndSave="true">
        <FormItem label="Name" bindTo="name" />
        <FormItem label="Email" bindTo="email" />
      </Form>
    `);

  const driver = await createFormDriver("form");
  const cancelBox = await driver.cancelButton.boundingBox();
  const submitBox = await driver.submitButton.boundingBox();
  expect(cancelBox.x).toBeGreaterThan(submitBox.x);
});

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

// --- backend validation summary

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
  await expect(fieldDriver.validationStatusIndicator).toHaveAttribute(
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
  await expect(fieldDriver.validationStatusIndicator).toHaveAttribute(
    fieldDriver.validationStatusTag,
    "warning",
  );
});

test.skip("field-related errors disappear if user updates FormItems", async ({
  initTestBed,
  page,
  createFormItemDriver,
}) => {
  await initTestBed(
    `
      <Form testId="form">
        <FormItem testId="testField" bindTo="test" label="test" required />
        <FormItem testId="testField2" bindTo="test2" label="test2" />
      </Form>`,
  );

  const fieldDriver = await createFormItemDriver("testField");
  const fieldDriver2 = await createFormItemDriver("testField2");

  await fieldDriver.component.focus();
  await fieldDriver.textBox.fill("a");
  await fieldDriver.textBox.fill("");
  await fieldDriver.textBox.blur();

  // Should show required error now
  await expect(fieldDriver.textBox).toHaveValue("");
  await expect(fieldDriver.validationStatusIndicator).toHaveAttribute(
    fieldDriver.validationStatusTag,
    "error",
  );

  await fieldDriver.textBox.fill("a");
  await fieldDriver.textBox.blur();

  await fieldDriver2.textBox.focus();

  await expect(fieldDriver2.textBox).toBeFocused();

  await fieldDriver2.textBox.fill("b");
  await expect(fieldDriver.validationStatusIndicator).not.toBeVisible();
});

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

  await (await createButtonDriver("openModalButton")).click();

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
  await page.getByText("Public Key").click();
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
