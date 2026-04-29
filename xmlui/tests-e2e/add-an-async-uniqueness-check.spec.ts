import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/add-an-async-uniqueness-check.md",
  ),
);

test.describe("Username uniqueness check", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Username uniqueness check",
  );

  test("initial state shows the account registration form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(
      page.getByRole("textbox", { name: "Username (John and Jane is taken)" }),
    ).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("submitting empty fields shows required validation messages", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("This field is required")).toHaveCount(2);
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("username API check disables submit while validation is pending", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username (John and Jane is taken)" }).fill("Ada");
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");

    await expect(page.getByRole("button", { name: "Validating..." })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled({
      timeout: 5000,
    });
  });

  test("taken username shows validation error and blocks submit", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username (John and Jane is taken)" }).fill("John");
    await page.getByRole("textbox", { name: "Email" }).fill("john@example.com");

    await expect(page.getByRole("button", { name: "Validating..." })).toBeDisabled();
    await expect(page.getByText(/John.*is already taken/)).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/John.*is already taken/)).toBeVisible();
    await expect(page.getByText(/Account created for/)).not.toBeVisible();
  });

  test("available username submits after API validation completes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username (John and Jane is taken)" }).fill("Ada");
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");

    await expect(page.getByRole("button", { name: "Create account" })).toBeEnabled({
      timeout: 5000,
    });
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Account created for Ada")).toBeVisible();
  });
});
