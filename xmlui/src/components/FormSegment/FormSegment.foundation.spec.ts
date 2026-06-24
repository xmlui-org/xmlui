import { expect, test } from "../../testing/fixtures";

test.describe("FormSegment foundation", () => {
  test("renders children and exposes segment data scoped to its fields", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.testState="{null}">
        <Form data="{{ first: 'Ada', last: 'Lovelace', email: 'ada@example.com' }}" hideButtonRow="{true}">
          <FormSegment>
            <FormItem label="First" bindTo="first" />
            <FormItem label="Last" bindTo="last" />
            <Button testId="readSegment" onClick="testState = $segmentData">Read segment</Button>
          </FormSegment>
          <FormItem label="Email" bindTo="email" />
        </Form>
      </App>
    `);

    await expect(page.getByText("First")).toBeVisible();
    await page.getByTestId("readSegment").click();
    await expect.poll(testStateDriver.testState).toEqual({ first: "Ada", last: "Lovelace" });
  });

  test("updates segment data and preserves it while segments are toggled", async ({
    initTestBed,
    page,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.step="{1}" var.testState="{null}">
        <Form data="{{ name: 'Ada', email: 'ada@example.com' }}" hideButtonRow="{true}">
          <FormSegment when="{step === 1}" fields="name">
            <FormItem testId="nameField" label="Name" bindTo="name" />
          </FormSegment>
          <FormSegment when="{step === 2}" fields="email">
            <FormItem testId="emailField" label="Email" bindTo="email" />
          </FormSegment>
          <Button testId="toggle" onClick="step = step === 1 ? 2 : 1">Toggle</Button>
          <Button testId="read" onClick="testState = step === 1 ? nameSeg.isDirty : $segmentData">Read</Button>
          <FormSegment id="nameSeg" fields="name">
            <Button testId="readNameSegment" onClick="testState = $segmentData">Read name segment</Button>
          </FormSegment>
        </Form>
      </App>
    `);

    const nameField = await createFormItemDriver("nameField");
    await nameField.input.fill("Grace");
    await page.getByTestId("toggle").click();
    await expect(page.getByText("Email")).toBeVisible();
    await page.getByTestId("toggle").click();
    await expect(nameField.input).toHaveValue("Grace");

    await page.getByTestId("readNameSegment").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Grace" });
  });

  test("reports required validation issues for segment fields", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.testState="{null}">
        <Form testId="form" hideButtonRow="{false}">
          <FormSegment fields="name">
            <FormItem label="Name" bindTo="name" required="{true}" requiredInvalidMessage="Name required" />
            <Button testId="check" onClick="testState = $segmentValidationIssues.name.length > 0">Check</Button>
          </FormSegment>
          <FormItem label="Email" bindTo="email" required="{true}" />
        </Form>
      </App>
    `);

    await page.getByRole("button", { name: "Save" }).click();
    await page.getByTestId("check").click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });
});
