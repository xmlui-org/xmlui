import * as path from "path";
import { fileURLToPath } from "url";
import type { Page } from "@playwright/test";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/use-built-in-form-validation.md",
  ),
);

test.describe("Registration form with built-in validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Registration form with built-in validation",
  );

  async function fillValidRegistrationForm(
    page: Page,
    values: Partial<{
      username: string;
      email: string;
      password: string;
      age: string;
      bio: string;
    }> = {},
  ) {
    const formValues = {
      username: "ada_99",
      email: "ada@example.com",
      password: "correct horse battery staple",
      age: "37",
      bio: "Mathematician and programmer.",
      ...values,
    };

    await page.getByRole("textbox", { name: "Username" }).fill(formValues.username);
    await page.getByRole("textbox", { name: "Email" }).fill(formValues.email);
    await page.getByRole("textbox", { name: "Password" }).fill(formValues.password);
    await page.getByRole("spinbutton", { name: /Age/ }).fill(formValues.age);
    await page.getByRole("textbox", { name: "Bio" }).fill(formValues.bio);
  }

  test("initial state shows all registration fields and the submit button", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: /Age/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Bio" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("submitting empty required fields shows required validation messages and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Choose a username")).toBeVisible();
    await expect(page.getByText("Enter your email address")).toBeVisible();
    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(page.getByText("Enter your age")).toBeVisible();
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("submitting a short password shows the length error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await fillValidRegistrationForm(page, { password: "short" });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Use 8-64 characters")).toBeVisible();
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("submitting an invalid email shows the pattern error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await fillValidRegistrationForm(page, { email: "not-an-email" });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("submitting a username that fails the regex shows the regex error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await fillValidRegistrationForm(page, { username: "Ada_99" });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText(
        "Start with a lowercase letter; use lowercase letters, numbers, and underscores",
      ),
    ).toBeVisible();
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("attempted out-of-range and overlong values are constrained before submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await fillValidRegistrationForm(page);
    const age = page.getByRole("spinbutton", { name: /Age/ });
    const bio = page.getByRole("textbox", { name: "Bio" });

    await age.fill("12");
    await expect(age).toHaveValue("13");

    await bio.fill("x".repeat(161));
    await expect(bio).toHaveValue("x".repeat(160));
    await page.getByRole("textbox", { name: "Username" }).focus();
  });

  test("valid values submit successfully", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await fillValidRegistrationForm(page);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Account created for ada_99")).toBeVisible();
  });
});
