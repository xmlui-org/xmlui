import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/validate-dependent-fields-together.md",
  ),
);

test.describe("Cross-field password validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Cross-field password validation",
  );

  test("initial state shows empty registration fields and submit button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Confirm Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByText("Passwords do not match")).not.toBeVisible();
  });

  test("submitting mismatched passwords shows an error and blocks success", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("Ada");
    await page.getByRole("textbox", { name: "Password", exact: true }).fill("correct horse");
    await page.getByRole("textbox", { name: "Confirm Password" }).fill("battery staple");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page.getByText("Account created for Ada")).not.toBeVisible();
  });

  test("submitting matching passwords creates the account", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("Ada");
    await page.getByRole("textbox", { name: "Password", exact: true }).fill("correct horse");
    await page.getByRole("textbox", { name: "Confirm Password" }).fill("correct horse");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Account created for Ada")).toBeVisible();
    await expect(page.getByText("Passwords do not match")).not.toBeVisible();
  });
});

test.describe("Inline password match validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Inline password match validation",
  );

  test("initial state shows empty registration fields and submit button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password", exact: true })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Confirm Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByText("Passwords do not match")).not.toBeVisible();
  });

  test("leaving mismatched confirm password shows an inline error", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Password", exact: true }).fill("correct horse");
    await page.getByRole("textbox", { name: "Confirm Password" }).fill("battery staple");
    await page.getByRole("textbox", { name: "Username" }).focus();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("matching passwords submit successfully", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("Ada");
    await page.getByRole("textbox", { name: "Password", exact: true }).fill("correct horse");
    await page.getByRole("textbox", { name: "Confirm Password" }).fill("correct horse");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Account created for Ada")).toBeVisible();
    await expect(page.getByText("Passwords do not match")).not.toBeVisible();
  });
});
