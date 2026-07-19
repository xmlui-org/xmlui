import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/register-a-custom-route-constraint.md",
  ),
);

test.describe("register-and-use-a-customer-code-route-constraint", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "register-and-use-a-customer-code-route-constraint",
  );

  test("initial state shows customer lookup actions", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Customer lookup")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open customer CUST-1042" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open rejected customer URL" })).toBeVisible();
  });

  test("registered validator accepts matching route values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open customer CUST-1042" }).click();
    await expect(page.getByText("Customer accepted")).toBeVisible();
    await expect(page.getByText("Customer code: CUST-1042")).toBeVisible();
  });

  test("help action opens the customer code format page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open rejected customer URL" }).click();
    await expect(page.getByText("Customer URL rejected")).toBeVisible();
    await expect(
      page.getByText("Customer codes must start with CUST- and four digits."),
    ).toBeVisible();
  });
});
