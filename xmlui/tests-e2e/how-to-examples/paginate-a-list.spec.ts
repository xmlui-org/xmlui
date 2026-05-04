import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/paginate-a-list.md"),
);

test.describe("Paginate a list", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Paginate a list");

  test("initial state shows the first five items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("Laptop Pro").isVisible(), { timeout: 5000 }).toBe(true);
    await expect(page.getByText("Wireless Mouse")).toBeVisible();
    await expect(page.getByText("USB-C Hub")).toBeVisible();
  });

  test("navigating to page 2 shows the second set of items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("Laptop Pro").isVisible(), { timeout: 5000 }).toBe(true);
    await page.getByRole("button", { name: "Next page" }).click();
    await expect
      .poll(() => page.getByText("Bluetooth Headphones").isVisible(), { timeout: 5000 })
      .toBe(true);
    await expect(page.getByText("Laptop Pro")).not.toBeVisible();
  });

  test("navigating to the last page shows the final items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect.poll(() => page.getByText("Laptop Pro").isVisible(), { timeout: 5000 }).toBe(true);
    await page.getByRole("button", { name: "Last page" }).click();
    await expect
      .poll(() => page.getByText("Noise Cancelling Headphones").isVisible(), { timeout: 5000 })
      .toBe(true);
    await expect(page.getByText("Smart Speaker")).toBeVisible();
  });
});
