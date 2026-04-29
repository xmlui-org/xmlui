import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/show-validation-progress-in-the-save-button.md",
  ),
);

test.describe("Save button feedback during slow validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Save button feedback during slow validation",
  );

  test("initial state shows the domain registration form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Company name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Company domain" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  });

  test("submitting empty fields shows required validation messages", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("This field is required")).toHaveCount(2);
    await expect(page.getByText(/Registered:/)).not.toBeVisible();
  });

  test("slow domain validation disables the save button and shows progress", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Company name" }).fill("Acme");
    await page.getByRole("textbox", { name: "Company domain" }).fill("acme.com");

    await expect(page.getByRole("button", { name: "Checking domain..." })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Register" })).toBeEnabled({
      timeout: 4000,
    });
  });

  test("taken domain shows validation error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Company name" }).fill("Quantum");
    await page.getByRole("textbox", { name: "Company domain" }).fill("Quantum.com");

    await expect(page.getByRole("button", { name: "Checking domain..." })).toBeDisabled();
    await expect(
      page.getByText("Quantum.com is already registered. Please choose another."),
    ).toBeVisible({ timeout: 4000 });

    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Quantum.com is already registered. Please choose another.")).toBeVisible();
    await expect(page.getByText(/Registered:/)).not.toBeVisible();
  });

  test("valid values submit after validation completes", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Company name" }).fill("Acme");
    await page.getByRole("textbox", { name: "Company domain" }).fill("acme.com");

    await expect(page.getByRole("button", { name: "Register" })).toBeEnabled({
      timeout: 4000,
    });
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByText("Registered: acme.com")).toBeVisible();
  });
});
