import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/transform-form-data-before-submission.md",
  ),
);

test.describe("Form data transformation on submit", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Form data transformation on submit",
  );

  test("initial state shows empty registration fields and the submit button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "First Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Last Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Phone" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Loyalty member" })).not.toBeChecked();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("submitting empty required fields shows validation messages", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("This field is required")).toHaveCount(2);
    await expect(page.getByText(/fullName/)).not.toBeVisible();
  });

  test("submitting as a guest sends transformed name phone and tier", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "First Name" }).fill("Ada");
    await page.getByRole("textbox", { name: "Last Name" }).fill("Lovelace");
    await page.getByRole("textbox", { name: "Phone" }).fill("(555) 123-4567");
    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByText('{"fullName":"Ada Lovelace","phone":"5551234567","tier":"guest"}'),
    ).toBeVisible();
  });

  test("checking loyalty member changes the submitted tier", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "First Name" }).fill("Grace");
    await page.getByRole("textbox", { name: "Last Name" }).fill("Hopper");
    await page.getByRole("textbox", { name: "Phone" }).fill("555.987.6543");
    await page.getByRole("checkbox", { name: "Loyalty member" }).check();
    await expect(page.getByRole("checkbox", { name: "Loyalty member" })).toBeChecked();
    await page.getByRole("button", { name: "Register" }).click();

    await expect(
      page.getByText('{"fullName":"Grace Hopper","phone":"5559876543","tier":"member"}'),
    ).toBeVisible();
  });
});
