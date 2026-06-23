import { expect, test } from "../../testing/fixtures";

test.describe("ValidationSummary foundation", () => {
  test("renders field errors from the enclosing Form context after submit", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <FormItem bindTo="name" label="Name" required="{true}" requiredInvalidMessage="Name is required" />
        <ValidationSummary testId="summary" />
      </Form>
    `);

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("summary")).toContainText("Validation errors");
    await expect(page.getByTestId("summary")).toContainText("name:");
    await expect(page.getByTestId("summary")).toContainText("Name is required");
  });

  test("renders explicit error and warning validation result props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ValidationSummary
        testId="summary"
        fieldValidationResults="{{
          email: {
            validations: [
              { isValid: false, severity: 'warning', invalidMessage: 'Email looks unusual' },
              { isValid: false, severity: 'error', invalidMessage: 'Email is required' }
            ]
          }
        }}"
        generalValidationResults="{[
          { isValid: false, severity: 'error', invalidMessage: 'General form error' }
        ]}" />
    `);

    await expect(page.getByTestId("summary")).toContainText("Validation warnings");
    await expect(page.getByTestId("summary")).toContainText("Email looks unusual");
    await expect(page.getByTestId("summary")).toContainText("Validation errors");
    await expect(page.getByTestId("summary")).toContainText("General form error");
  });
});

