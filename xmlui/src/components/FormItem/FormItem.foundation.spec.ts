import { expect, test } from "../../testing/fixtures";

test.describe("FormItem foundation", () => {
  test("renders a label wired to the fallback input", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="field" bindTo="email" label="Email" />
      </Form>
    `);

    await page.getByText("Email").click();
    await expect(page.locator('[data-xmlui-form-field="email"] input')).toBeFocused();
  });

  test("supports labelPosition=start with a label width", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem
          testId="field"
          bindTo="name"
          label="Name"
          labelPosition="start"
          labelWidth="160px" />
      </Form>
    `);

    const field = await createFormItemDriver("field");
    await expect(field.label).toHaveCSS("width", "160px");
  });
});

