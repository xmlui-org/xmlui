import { expect, test } from "../../testing/fixtures";

test.describe("Toast foundation", () => {
  test("exposes show API through component id", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Toast id="notify" />
        <Button testId="show" onClick="notify.show('Saved')">Show</Button>
      </App>
    `);

    await page.getByTestId("show").click();
    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
  });

  test("exposes success API", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Toast id="notify" />
        <Button testId="show" onClick="notify.success('Done')">Show</Button>
      </App>
    `);

    await page.getByTestId("show").click();
    await expect(page.locator('[data-xmlui-part="Toast"][data-kind="success"]')).toHaveText("Done");
  });
});

test.describe("Toast old-suite transfer debt", () => {
  test("copy literal template, update-in-place, and react-hot-toast parity tests", async () => {
    test.fixme(true, "Full Toast template rendering parity is deferred");
  });
});
