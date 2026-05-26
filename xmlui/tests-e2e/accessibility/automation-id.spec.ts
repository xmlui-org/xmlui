import { expect, test } from "../../src/testing/fixtures";

test.describe("automationId", () => {
  test("renders stable automation selectors independently of test ids", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<Button automationId="save-command" label="Save" />`);

    const button = page.locator("[data-automation-id='save-command']");

    await expect(button).toHaveRole("button");
    await expect(button).toHaveText("Save");
    await expect(button).not.toHaveAttribute("data-testid", "save-command");
  });

  test("coexists with testId when both selectors are declared", async ({ page, initTestBed }) => {
    await initTestBed(`<Button testId="save-test" automationId="save-command" label="Save" />`);

    const button = page.getByTestId("save-test");

    await expect(button).toHaveAttribute("data-automation-id", "save-command");
  });
});
