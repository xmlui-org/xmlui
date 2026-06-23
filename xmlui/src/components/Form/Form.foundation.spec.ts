import { expect, test } from "../../testing/fixtures";

test.describe("Form foundation", () => {
  test("initializes FormItem values from form data and submits the mutated values", async ({
    initTestBed,
    page,
    createFormDriver,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.testState="{''}">
        <Form
          testId="form"
          data="{{ name: 'Ada' }}"
          onSubmit="data => testState = data.name">
          <FormItem testId="nameItem" bindTo="name" label="Name" />
        </Form>
      </App>
    `);

    const item = await createFormItemDriver("nameItem");
    await expect(item.input).toHaveValue("Ada");

    await item.input.fill("Grace");
    const form = await createFormDriver("form");
    await form.submitButton.click();

    await expect.poll(testStateDriver.testState).toEqual("Grace");
    await expect(page.getByTestId("nameItem")).toContainText("Name");
  });

  test("shows required validation and blocks submit until the field has a value", async ({
    initTestBed,
    createFormDriver,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.testState="{''}">
        <Form testId="form" onSubmit="data => testState = data.name">
          <FormItem
            testId="nameItem"
            bindTo="name"
            label="Name"
            required="{true}"
            requiredInvalidMessage="Name is required" />
        </Form>
      </App>
    `);

    const form = await createFormDriver("form");
    const item = await createFormItemDriver("nameItem");

    await form.submitButton.click();
    await expect(item.error).toHaveText("Name is required");
    await expect.poll(testStateDriver.testState).toEqual("");

    await item.input.fill("Ada");
    await form.submitButton.click();
    await expect(item.error).toBeHidden();
    await expect.poll(testStateDriver.testState).toEqual("Ada");
  });

  test("cancel resets form values and raises cancel", async ({
    initTestBed,
    createFormDriver,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.testState="{''}">
        <Form
          testId="form"
          data="{{ name: 'Ada' }}"
          onCancel="testState = 'cancelled'">
          <FormItem testId="nameItem" bindTo="name" label="Name" />
        </Form>
      </App>
    `);

    const form = await createFormDriver("form");
    const item = await createFormItemDriver("nameItem");
    await item.input.fill("Grace");
    await form.cancelButton.click();

    await expect(item.input).toHaveValue("Ada");
    await expect.poll(testStateDriver.testState).toEqual("cancelled");
  });
});

