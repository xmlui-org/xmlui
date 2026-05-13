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
    await expect(page.getByLabel("Address")).toHaveValue("123 W. 57th");
    await expect(page.getByLabel("City")).toHaveValue("New York");
    await expect(page.getByLabel("State/Province")).toHaveValue("NY");
    await expect(page.getByLabel("Country")).toHaveValue("USA");
  });

  test("shipping tab starts empty", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("tab", { name: "Shipping" }).click();
    await expect(page.getByLabel("Address")).toHaveValue("");
    await expect(page.getByLabel("City")).toHaveValue("");
  });

  test("clicking Copy Billing to Shipping fills the shipping tab", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Copy Billing to Shipping" }).click();
    await page.getByRole("tab", { name: "Shipping" }).click();
    await expect.poll(() => page.getByLabel("Address").inputValue()).toBe("123 W. 57th");
    await expect.poll(() => page.getByLabel("City").inputValue()).toBe("New York");
    await expect.poll(() => page.getByLabel("State/Province").inputValue()).toBe("NY");
  });
});
