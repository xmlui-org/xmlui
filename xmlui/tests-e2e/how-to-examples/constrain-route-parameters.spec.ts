import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/constrain-route-parameters.md"),
);

test.describe("constrain-an-order-id-route-parameter", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "constrain-an-order-id-route-parameter",
  );

  test("initial state shows the orders home", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Orders home")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open order 101" })).toBeVisible();
  });

  test("valid route parameter renders with a coerced number", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open order 101" }).click();
    await expect(page.getByText("Order accepted")).toBeVisible();
    await expect(page.getByText("Order id: 101")).toBeVisible();
    await expect(page.getByText("Route id type: number")).toBeVisible();
  });

  test("invalid route parameter redirects to the fallback page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open invalid order" }).click();
    await expect(page.getByText("Route rejected")).toBeVisible();
    await expect(
      page.getByText("The order route only accepts positive integer ids."),
    ).toBeVisible();
  });
});
