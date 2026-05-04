import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/arrange-form-fields-side-by-side.md",
  ),
);

test.describe("Checkout form with side-by-side fields", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Checkout form with side-by-side fields",
  );

  test("initial state shows all five form fields and Place order button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "First Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Last Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Address" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "City" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Postcode" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Place order" })).toBeVisible();
  });

  test("filling the form and submitting shows a toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("textbox", { name: "First Name" }).fill("John");
    await page.getByRole("textbox", { name: "Last Name" }).fill("Doe");
    await page.getByRole("textbox", { name: "Address" }).fill("123 Main St");
    await page.getByRole("textbox", { name: "City" }).fill("Springfield");
    await page.getByRole("textbox", { name: "Postcode" }).fill("12345");
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByText("Order placed for John Doe")).toBeVisible();
  });
});
