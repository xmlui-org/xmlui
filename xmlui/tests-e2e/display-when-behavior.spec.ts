import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// displayWhen BEHAVIOR TESTS
//
// The `displayWhen` behavior wraps a component in a div that toggles
// `display: none` rather than unmounting the React subtree.
// Unlike `when`, the component tree stays mounted at all times.
// =============================================================================

test.describe("displayWhen behavior — visibility", () => {
  test("component is visible when displayWhen is true", async ({ page, initTestBed }) => {
    await initTestBed(`<Text testId="t" value="hello" displayWhen="{true}" />`);
    await expect(page.getByTestId("t")).toBeVisible();
  });

  test("component is hidden (display:none) when displayWhen is false", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<Text testId="t" value="hello" displayWhen="{false}" />`);
    // Element is in the DOM but not visible
    await expect(page.getByTestId("t")).toBeHidden();
    await expect(page.getByTestId("t")).toBeAttached();
  });

  test("component is visible when displayWhen is absent (default)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<Text testId="t" value="hello" />`);
    await expect(page.getByTestId("t")).toBeVisible();
  });

  test("toggling displayWhen shows and hides the component", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.show="{true}">
        <Text testId="t" value="hello" displayWhen="{show}" />
        <Button testId="toggle" label="Toggle" onClick="show = !show" />
      </App>
    `);

    await expect(page.getByTestId("t")).toBeVisible();

    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("t")).toBeHidden();
    await expect(page.getByTestId("t")).toBeAttached();

    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("t")).toBeVisible();
  });

  test("children stay mounted in the DOM when displayWhen is false", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <VStack displayWhen="{false}">
        <Text testId="child" value="inside" />
      </VStack>
    `);
    // Child is in the DOM even though its parent is hidden
    await expect(page.getByTestId("child")).toBeAttached();
  });
});

test.describe("displayWhen behavior — form field preservation", () => {
  test("hidden form fields are included in submitted data", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Form
          data="{{ name: 'Alice', note: 'hidden value' }}"
          onSubmit="(data) => testState = data.note"
          saveLabel="Submit"
        >
          <TextBox testId="name" label="Name" bindTo="name" />
          <TextBox testId="note" label="Note" bindTo="note" displayWhen="{false}" />
        </Form>
      </App>
    `);

    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(testStateDriver.testState).toEqual("hidden value");
  });

  test("value typed into a field before it is hidden is preserved after hiding", async ({
    page,
    initTestBed,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.showNote="{true}">
        <Form
          data="{{ note: '' }}"
          onSubmit="(data) => testState = data.note"
          saveLabel="Submit"
        >
          <TextBox testId="note" label="Note" bindTo="note" displayWhen="{showNote}" />
          <Button testId="hide" label="Hide" onClick="showNote = false" />
        </Form>
      </App>
    `);

    const noteDriver = await createTextBoxDriver("note");
    await noteDriver.input.fill("preserved");
    await page.getByTestId("hide").click();
    // Field is now hidden but still mounted
    await expect(page.getByTestId("note")).toBeHidden();
    await expect(page.getByTestId("note")).toBeAttached();

    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(testStateDriver.testState).toEqual("preserved");
  });

  test("wizard pattern: all steps submit complete data", async ({ page, initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.step="{1}">
        <Form
          data="{{ firstName: '', lastName: '' }}"
          hideButtonRow="{true}"
          onSubmit="(data) => testState = data.firstName + ' ' + data.lastName"
        >
          <VStack displayWhen="{step === 1}">
            <TextBox testId="firstName" label="First Name" bindTo="firstName" />
            <Button testId="next" label="Next" onClick="step = 2" />
          </VStack>
          <VStack displayWhen="{step === 2}">
            <TextBox testId="lastName" label="Last Name" bindTo="lastName" />
            <Button testId="submit" label="Create" type="submit" />
          </VStack>
        </Form>
      </App>
    `);

    // Step 1 — fill first name
    const firstNameDriver = await createTextBoxDriver("firstName");
    await firstNameDriver.input.fill("Jane");
    await page.getByTestId("next").click();

    // Step 2 — fill last name and submit
    await expect(page.getByTestId("lastName")).toBeVisible();
    const lastNameDriver = await createTextBoxDriver("lastName");
    await lastNameDriver.input.fill("Doe");
    await page.getByTestId("submit").click();

    // Both values from both steps should appear in the submitted payload
    await expect.poll(testStateDriver.testState).toEqual("Jane Doe");
  });
});

test.describe("displayWhen behavior — interaction with other behaviors", () => {
  test("displayWhen works with label behavior", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.show="{true}">
        <TextBox testId="tb" label="Email" displayWhen="{show}" />
        <Button testId="hide" label="Hide" onClick="show = false" />
      </App>
    `);

    await expect(page.getByText("Email")).toBeVisible();
    await page.getByTestId("hide").click();
    await expect(page.getByText("Email")).toBeHidden();
    await expect(page.getByTestId("tb")).toBeAttached();
  });

  test("displayWhen coexists with tooltip behavior", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Text
        testId="t"
        value="hello"
        tooltip="A tip"
        displayWhen="{true}"
      />
    `);
    await expect(page.getByTestId("t")).toBeVisible();
  });
});
