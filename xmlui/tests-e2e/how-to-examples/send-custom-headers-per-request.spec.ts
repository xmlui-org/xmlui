import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/send-custom-headers-per-request.md"),
);

test.describe("Attach a bearer token and a custom tenant header", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Attach a bearer token and a custom tenant header",
  );

  test("shows profile data on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Name: Alice")).toBeVisible();
    await expect(page.getByText("Role: viewer")).toBeVisible();
    await expect(page.getByText("Tenant: acme-corp")).toBeVisible();
  });

  test("promote to admin button is visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Promote to Admin" })).toBeVisible();
  });

  test("clicking promote to admin updates the role", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Promote to Admin" }).click();
    await expect.poll(() => page.getByText("Role: admin").isVisible()).toBe(true);
  });
});
