import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/copy-billing-to-shipping.md"),
);

test.describe("copy-billing-to-shipping-b76c", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "copy-billing-to-shipping-b76c",
  );

  test("renders the form with billing tab active and copy button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Copy Billing to Shipping" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Billing" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Shipping" })).toBeVisible();
  });

  test("billing tab shows pre-filled address fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator('[id="billing.address"]')).toHaveValue("123 W. 57th");
    await expect(page.locator('[id="billing.city"]')).toHaveValue("New York");
    await expect(page.locator('[id="billing.state"]')).toHaveValue("NY");
    await expect(page.locator('[id="billing.country"]')).toHaveValue("USA");
  });

  test("shipping tab starts empty", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("tab", { name: "Shipping" }).click();
    await expect(page.locator('[id="shipping.address"]')).toHaveValue("");
    await expect(page.locator('[id="shipping.city"]')).toHaveValue("");
  });

  test("clicking Copy Billing to Shipping fills the shipping tab", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Copy Billing to Shipping" }).click();
    await page.getByRole("tab", { name: "Shipping" }).click();
    await expect.poll(() => page.locator('[id="shipping.address"]').inputValue()).toBe("123 W. 57th");
    await expect.poll(() => page.locator('[id="shipping.city"]').inputValue()).toBe("New York");
    await expect.poll(() => page.locator('[id="shipping.state"]').inputValue()).toBe("NY");
  });
});
