import { expect, test } from "../../testing/fixtures";

test.describe("Slot foundation", () => {
  test("renders fallback children when no slot is injected", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Slot>
        <Text testId="fallback">Fallback slot</Text>
      </Slot>
    `);

    await expect(page.getByTestId("fallback")).toHaveText("Fallback slot");
  });
});

test.describe("Slot old-suite transfer debt", () => {
  test("copy literal injected child and context-variable tests", async () => {
    test.fixme(true, "Full Slot suite is deferred to user-defined component slot closure");
  });
});
