import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/use-regex-validation-in-formitem.md",
  ),
);

test.describe("FormItem regex validation with severity", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "FormItem regex validation with severity",
  );

  test("initial state shows fields with example placeholders", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Phone number" })).toHaveAttribute(
      "placeholder",
      "e.g. +1234567890",
    );
    await expect(page.getByRole("textbox", { name: "ZIP code (warning only)" })).toHaveAttribute(
      "placeholder",
      "e.g. 12345",
    );
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  test("invalid phone shows regex error and blocks submit", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Phone number" }).fill("abc");
    await page.getByRole("textbox", { name: "ZIP code (warning only)" }).fill("12345");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Enter 7-15 digits, optional leading +")).toBeVisible();
    await expect(page.getByText("Submitted!")).not.toBeVisible();
  });

  test("warning-level ZIP validation allows submit after confirmation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Phone number" }).fill("+1234567890");
    await page.getByRole("textbox", { name: "ZIP code (warning only)" }).fill("1234");
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Expected a 5-digit ZIP code").first()).toBeVisible();
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("button", { name: "Yes, proceed" }).click();

    await expect(page.getByText("Submitted!")).toBeVisible();
  });
});
