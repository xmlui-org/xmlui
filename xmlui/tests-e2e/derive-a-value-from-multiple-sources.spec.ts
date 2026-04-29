import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/derive-a-value-from-multiple-sources.md"),
);

test.describe("Reactive order calculator", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Reactive order calculator");

  test("initial state shows correct computed totals", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Order Calculator")).toBeVisible();
    await expect(page.getByText("$49.99").first()).toBeVisible();
    await expect(page.getByText("$4.00")).toBeVisible();
    await expect(page.getByText("$53.99")).toBeVisible();
  });

  test("changing quantity updates all computed totals", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const quantityInput = page.getByRole("spinbutton", { name: "Quantity" });
    await quantityInput.fill("2");
    await quantityInput.press("Tab");
    // subtotal: 2 * 49.99 = 99.98, tax: 99.98 * 0.08 = 8.00, total: 107.98
    await expect(page.getByText("$99.98").first()).toBeVisible();
    await expect(page.getByText("$8.00")).toBeVisible();
    await expect(page.getByText("$107.98")).toBeVisible();
  });

  test("changing unit price updates all computed totals", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const priceInput = page.getByRole("spinbutton", { name: "Unit price ($)" });
    await priceInput.fill("100");
    await priceInput.press("Tab");
    // subtotal: 1 * 100 = 100.00, tax: 8.00, total: 108.00
    await expect(page.getByText("$100.00").first()).toBeVisible();
    await expect(page.getByText("$8.00")).toBeVisible();
    await expect(page.getByText("$108.00")).toBeVisible();
  });
});
