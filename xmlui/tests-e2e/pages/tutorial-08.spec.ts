import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-08.md"),
);

test.describe("Try saving in various stages of completion", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Try saving in various stages of completion",
  );

  test("initial state renders the invoice form with heading and Add Item button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Create New Invoice" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Item" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("saving without a client shows a required validation error", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Save" }).click();
    // The client FormItem has required="true", so a validation message appears
    await expect(page.getByText("This field is required").first()).toBeVisible();
  });

  test("Cancel button resets the form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    // After reset, the form should still be visible (not navigated away)
    await expect(page.getByRole("heading", { name: "Create New Invoice" })).toBeVisible();
  });
});
