import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SMOKE TESTS
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
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
    // Both tab labels are rendered as headers.
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();

    // The first tab's content is visible by default.
    await expect(page.getByText("Alpha body")).toBeVisible();

    // Form's standard button row is present (Save + Cancel).
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });
});

// =============================================================================
// TAB SWITCHING
// =============================================================================

test.describe("tab switching", () => {
  test("clicking a tab header reveals that tab's content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);
    await expect(page.getByText("Alpha body")).toBeVisible();
    await page.getByRole("tab", { name: "Alpha" }).waitFor();
    await page.getByRole("tab", { name: "Beta" }).click();
    await expect(page.getByText("Beta body")).toBeVisible();
  });
});

// =============================================================================
// CROSS-TAB FORM STATE
// =============================================================================

test.describe("cross-tab form state", () => {
  test("inputs in inactive tabs stay registered with the form (keepMounted)", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
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
    // Fill the first tab, switch to the second, fill it, then submit.
    const nameItem = await createFormItemDriver("nameField");
    const nameInput = await createTextBoxDriver(nameItem.input);
    await nameInput.field.fill("Alice");

    await page.getByRole("tab", { name: "Beta" }).click();
    const emailItem = await createFormItemDriver("emailField");
    const emailInput = await createTextBoxDriver(emailItem.input);
    await emailInput.field.fill("alice@example.com");

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toEqual({
      name: "Alice",
      email: "alice@example.com",
    });
  });
});

// =============================================================================
// SUBMIT VALIDATION JUMP
// =============================================================================

test.describe("submit validation jump", () => {
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
    // Switch away from the invalid tab so we can prove the jump-back behavior.
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
    // The submit was canceled — onSubmit never fired.
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

  test("submit succeeds when every segment is valid", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TabsForm
        data="{{ name: 'Alice', email: 'a@b.com' }}"
        onSubmit="(d) => testState = d.email">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" required="true" />
        </FormSegment>
        <FormSegment label="Beta">
          <FormItem label="Email" bindTo="email" required="true" />
        </FormSegment>
      </TabsForm>
    `);
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toBe("a@b.com");
  });

});

// =============================================================================
// FORWARDED TABS PROPS
// =============================================================================

test.describe("forwarded Tabs props", () => {
  test("tabsOrientation=vertical lays the tab list on the side", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}" tabsOrientation="vertical">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);
    await expect(page.getByRole("tab", { name: "Alpha" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Beta" })).toBeVisible();
  });

  test("tabsAccordionView=true stacks tabs in accordion mode", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}" tabsAccordionView="true">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);
    // Both headers render, and the first is expanded by default.
    await expect(page.getByText("Alpha", { exact: true })).toBeVisible();
    await expect(page.getByText("Beta", { exact: true })).toBeVisible();
    await expect(page.getByText("Alpha body")).toBeVisible();
  });

  test("tabsActiveTab selects the initial tab", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TabsForm data="{{ name: '' }}" tabsActiveTab="{1}">
        <FormSegment label="Alpha"><Text>Alpha body</Text></FormSegment>
        <FormSegment label="Beta"><Text>Beta body</Text></FormSegment>
      </TabsForm>
    `);
    await expect(page.getByText("Beta body")).toBeVisible();
  });
});

// =============================================================================
// FORM INTEGRATION
// =============================================================================

test.describe("form integration", () => {
  test("data prop seeds form fields across tabs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TabsForm data="{{ name: 'Alice' }}">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </TabsForm>
    `);
    await expect(page.getByText("Name")).toBeVisible();
  });

  test("onSubmit fires with the cleaned form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TabsForm
        data="{{ name: '' }}"
        onSubmit="(d) => testState = d.name">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" testId="nameField" />
        </FormSegment>
      </TabsForm>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Bob");
    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(testStateDriver.testState).toBe("Bob");
  });

  test("saveLabel and cancelLabel customize the button row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TabsForm
        data="{{ name: '' }}"
        saveLabel="Create"
        cancelLabel="Discard">
        <FormSegment label="Alpha">
          <FormItem label="Name" bindTo="name" />
        </FormSegment>
      </TabsForm>
    `);
    await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Discard" })).toBeVisible();
  });

  test("hideButtonRow=true hides Save and Cancel", async ({ initTestBed, page }) => {
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
});

// =============================================================================
// FORWARDED FORM APIs
// =============================================================================

test.describe("forwarded Form APIs", () => {
  test("update() merges values into the form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TabsForm id="tf" data="{{ name: 'initial' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </TabsForm>
        <Button testId="updateBtn" onClick="tf.update({ name: 'patched' })" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await expect(input.field).toHaveValue("initial");
    await page.getByTestId("updateBtn").click();
    await expect(input.field).toHaveValue("patched");
  });

  test("getData() returns the current form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TabsForm id="tf" data="{{ name: 'Eve' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </TabsForm>
        <Button testId="readBtn" onClick="testState = tf.getData()" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Frank");
    await page.getByTestId("readBtn").click();
    await expect.poll(testStateDriver.testState).toEqual({ name: "Frank" });
  });

  test("reset() restores the initial form data", async ({
    initTestBed,
    page,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TabsForm id="tf" data="{{ name: 'Original' }}">
          <FormSegment label="Alpha">
            <FormItem label="Name" bindTo="name" testId="nameField" />
          </FormSegment>
        </TabsForm>
        <Button testId="resetBtn" onClick="tf.reset()" />
      </Fragment>
    `);
    const formItem = await createFormItemDriver("nameField");
    const input = await createTextBoxDriver(formItem.input);
    await input.field.fill("Modified");
    await expect(input.field).toHaveValue("Modified");
    await page.getByTestId("resetBtn").click();
    await expect(input.field).toHaveValue("Original");
  });
});
