import { expect, test } from "../../testing/fixtures";

test.describe("ConciseValidationFeedback foundation", () => {
  test("renders error feedback with accessible message", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ConciseValidationFeedback
        testId="feedback"
        validationStatus="error"
        invalidMessages="{['Name is required', 'Name is too short']}" />
    `);

    await expect(page.getByTestId("feedback")).toBeVisible();
    await expect(page.getByTestId("feedback")).toHaveAttribute("aria-label", /Name is required/);
    await expect(page.getByTestId("feedback")).toContainText("!");
  });

  test("renders valid feedback and hides neutral statuses", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <ConciseValidationFeedback testId="valid" validationStatus="valid" />
        <ConciseValidationFeedback testId="none" validationStatus="none" />
      </VStack>
    `);

    await expect(page.getByTestId("valid")).toBeVisible();
    await expect(page.getByTestId("valid")).toContainText("✓");
    await expect(page.getByTestId("none")).toHaveCount(0);
  });
});

