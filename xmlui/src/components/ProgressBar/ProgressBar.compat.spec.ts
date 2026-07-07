import { test, expect } from "../../testing/fixtures";

test.describe("ProgressBar compatibility regressions", () => {
  test("uses the original completed-state default color", async ({
    initTestBed,
    createProgressBarDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <ProgressBar value="1" />
        <ProgressBar value="1.2" />
      </VStack>
    `);

    const completed = await createProgressBarDriver();
    await expect(completed.bar).toHaveCSS("background-color", "rgb(144, 226, 157)");
  });
});
