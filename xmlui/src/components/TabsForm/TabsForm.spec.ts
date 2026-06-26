import { expect, test } from "../../testing/fixtures";

test.describe("TabsForm foundation", () => {
  test("renders one tab per FormSegment with the standard form button row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}">
        <FormSegment label="Alpha">
          <Text>Alpha body</Text>
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
        <FormSegment label="Beta">
          <Text>Beta body</Text>
        </FormSegment>
      </TabsForm>
    `);

    await expect(page.getByRole("tab", { name: "Alpha" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Beta" })).toBeVisible();
    await expect(page.getByText("Alpha body")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("clicking a tab header reveals that tab content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);

    await page.getByRole("tab", { name: "Beta" }).click();
    await expect(page.getByText("Beta body")).toBeVisible();
  });

  test("keeps fields in inactive tabs registered with the shared form", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TabsForm
        data="{{ name: '', email: '' }}"
        onSubmit="(d) => testState = d">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </FormSegment>
        <FormSegment label="Beta">
          <FormItem label="Email" bindTo="email" testId="emailField" />
        </FormSegment>
      </TabsForm>
    `);

    await page.getByRole("textbox", { name: "Name" }).fill("Alice");

    await page.getByRole("tab", { name: "Beta" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("alice@example.com");

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      name: "Alice",
      email: "alice@example.com",
    });
  });

  test("saveLabel, cancelLabel, and hideButtonRow forward to the inner Form", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}" saveLabel="Create" cancelLabel="Discard">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </TabsForm>
    `);

    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Discard" })).toBeVisible();

    await initTestBed(`
      <TabsForm data="{{ name: '' }}" hideButtonRow="true">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </TabsForm>
    `);

    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  });

  test("forwards reset, update, and getData APIs to the inner Form", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TabsForm id="tf" data="{{ name: 'Initial' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </TabsForm>
        <Button testId="updateBtn" onClick="tf.update({ name: 'Patched' })" />
        <Button testId="readBtn" onClick="testState = tf.getData()" />
        <Button testId="resetBtn" onClick="tf.reset()" />
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

test.describe("TabsForm old suite deferred cases", () => {
  test("submit jumps back to the first invalid tab and cancels submission", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TabsForm
        data="{{ name: '', email: '' }}"
        onSubmit="(d) => testState = 'submitted'">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" required="true" />
        </FormSegment>
        <FormSegment label="Beta">
          <FormItem label="Email" bindTo="email" />
        </FormSegment>
      </TabsForm>
    `);
    await page.getByRole("tab", { name: "Beta" }).click();
    await expect(page.getByRole("tab", { name: "Alpha" })).not.toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("tab", { name: "Alpha" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect.poll(testStateDriver.testState, { timeout: 2_000 }).not.toBe("submitted");
  });

  test("submit jumps to the second tab when only it is invalid", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: 'Alice', email: '' }}">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" required="true" />
        </FormSegment>
        <FormSegment label="Beta">
          <FormItem label="Email" bindTo="email" required="true" />
        </FormSegment>
      </TabsForm>
    `);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("tab", { name: "Beta" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("tabsAccordionView=true stacks tabs in accordion mode with old parity", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}" tabsAccordionView="true">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);

    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();
    await expect(page.getByText("Alpha body")).toBeVisible();
  });
});
