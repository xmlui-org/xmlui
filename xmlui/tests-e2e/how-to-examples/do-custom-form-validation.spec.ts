import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/do-custom-form-validation.md",
  ),
);

test.describe("Do custom form validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Do custom form validation",
  );

  test("initial state shows the labeled NumberBox and Save button without an error", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(
      page.getByRole("spinbutton", { name: "Requested Amount (limit 1000)" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(page.getByText("Value should be in the 0-1000 range")).not.toBeVisible();
    await expect(page.getByText(/^Submitted:/)).not.toBeVisible();
  });

  test("submitting at the lower bound (0) shows the range error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Value should be in the 0-1000 range")).toBeVisible();
    await expect(page.getByText(/^Submitted:/)).not.toBeVisible();
  });

  test("submitting above the limit shows the range error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page
      .getByRole("spinbutton", { name: "Requested Amount (limit 1000)" })
      .fill("1001");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Value should be in the 0-1000 range")).toBeVisible();
    await expect(page.getByText(/^Submitted:/)).not.toBeVisible();
  });

  test("a valid value submits and reports the form data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page
      .getByRole("spinbutton", { name: "Requested Amount (limit 1000)" })
      .fill("500");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText('Submitted: {"total":500}')).toBeVisible();
    await expect(page.getByText("Value should be in the 0-1000 range")).not.toBeVisible();
  });
});
