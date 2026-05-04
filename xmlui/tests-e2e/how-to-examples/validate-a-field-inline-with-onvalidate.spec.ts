import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/validate-a-field-inline-with-onvalidate.md",
  ),
);

test.describe("Inline custom field validation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Inline custom field validation",
  );

  test("initial state shows empty fields and submit button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Promo code (optional)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    await expect(page.getByText("Only lowercase letters, digits, and underscores")).not.toBeVisible();
    await expect(page.getByText("Username must not start with a digit")).not.toBeVisible();
    await expect(page.getByText("Promo codes must be entered in uppercase")).not.toBeVisible();
  });

  test("username rejects invalid characters", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("Ada!");
    await page.getByRole("textbox", { name: "Promo code (optional)" }).focus();

    await expect(
      page.getByText("Only lowercase letters, digits, and underscores are allowed."),
    ).toBeVisible();
  });

  test("username rejects leading digits", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("9ada");
    await page.getByRole("textbox", { name: "Promo code (optional)" }).focus();

    await expect(page.getByText("Username must not start with a digit.")).toBeVisible();
  });

  test("promo code rejects lowercase letters", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Promo code (optional)" }).fill("summer25");
    await page.getByRole("textbox", { name: "Username" }).focus();

    await expect(page.getByText("Promo codes must be entered in uppercase.")).toBeVisible();
  });

  test("valid values submit successfully", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Username" }).fill("alice_99");
    await page.getByRole("textbox", { name: "Promo code (optional)" }).fill("SUMMER25");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(
      page.getByText('Submitted: {"username":"alice_99","promoCode":"SUMMER25"}'),
    ).toBeVisible();
    await expect(page.getByText("Only lowercase letters, digits, and underscores")).not.toBeVisible();
    await expect(page.getByText("Promo codes must be entered in uppercase")).not.toBeVisible();
  });
});
