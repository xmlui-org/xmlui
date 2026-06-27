import { expect, test } from "../../testing/fixtures";

test.describe("StepperForm foundation", () => {
  test("renders one step per FormSegment with generated navigation buttons", async ({
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

    await expect(page.getByLabel("Stepper")).toBeVisible();
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();
    await expect(page.getByText("Alpha body")).toBeVisible();
    await expect(page.getByText("Beta body")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).not.toBeVisible();
  });

  test("Next and Back navigate between steps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <StepperForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </StepperForm>
    `);

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Beta body")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Alpha body")).toBeVisible();
  });

  test("customizes generated button labels", async ({ initTestBed, page }) => {
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

  test("submits the shared form data from the final step", async ({
    initTestBed,
    page,
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

    await page.getByRole("textbox", { name: "Name" }).fill("Bob");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect.poll(testStateDriver.testState).toBe("Bob");
  });

  test("forwards reset, update, and getData APIs to the inner Form", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <StepperForm id="sf" data="{{ name: 'Initial' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </StepperForm>
        <Button testId="updateBtn" onClick="sf.update({ name: 'Patched' })" />
        <Button testId="readBtn" onClick="testState = sf.getData()" />
        <Button testId="resetBtn" onClick="sf.reset()" />
      </Fragment>
    `);

    const input = page.getByRole("textbox", { name: "Name" });
    await expect(input).toHaveValue("Initial");
    await page.getByTestId("updateBtn").click();
    await expect(input).toHaveValue("Patched");
    await page.getByTestId("readBtn").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Patched" });
    await page.getByTestId("resetBtn").click();
    await expect(input).toHaveValue("Initial");
  });
});

test.describe("StepperForm old suite deferred cases", () => {
  test("Next is disabled while the active FormSegment is invalid", async ({
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

  test("stepperStackedLabel=true stacks icon and label with old Stepper markup", async ({
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
