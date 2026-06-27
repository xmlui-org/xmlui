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

  test("updates an existing toast when the same id is reused", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.toastId="job">
        <Button testId="loading" onClick="toast.loading('Working', { id: toastId })">Loading</Button>
        <Button testId="success" onClick="toast.success('Done', { id: toastId })">Success</Button>
      </App>
    `);

    await page.getByTestId("loading").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveText("Working");
    await page.getByTestId("success").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(1);
    await expect(page.locator('[data-xmlui-part="Toast"][data-kind="success"]')).toHaveText("Done");
  });

  test("dismiss removes one toast or all toasts", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Toast id="notify" />
        <Button testId="show" onClick="notify.show('One', { id: 'one', duration: 0 }); notify.show('Two', { id: 'two', duration: 0 })">Show</Button>
        <Button testId="dismiss-one" onClick="notify.dismiss('one')">Dismiss one</Button>
        <Button testId="dismiss-all" onClick="notify.dismiss()">Dismiss all</Button>
      </App>
    `);

    await page.getByTestId("show").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(2);
    await page.getByTestId("dismiss-one").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(1);
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveText("Two");
    await page.getByTestId("dismiss-all").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(0);
  });

  test("duration controls auto-dismiss while loading toasts persist by default", async ({
    initTestBed,
    page,
  }) => {
    await page.clock.install();
    await initTestBed(`
      <App>
        <Toast id="notify" />
        <Button testId="show" onClick="notify.show('Short', { id: 'short', duration: 100 }); notify.loading('Loading', { id: 'loading' })">Show</Button>
      </App>
    `);

    await page.getByTestId("show").click();
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(2);
    await page.clock.fastForward(100);
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveCount(1);
    await expect(page.locator('[data-xmlui-part="Toast"]')).toHaveText("Loading");
  });
});
