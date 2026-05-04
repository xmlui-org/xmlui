import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/theme-form-inputs-for-all-states.md"),
);

test.describe("Form input state theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Form input state theming");

  test("initial state shows all five input fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox", { name: "Default input" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Error state" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Warning state" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Success state" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Disabled input" })).toBeVisible();
  });

  test("disabled input is not editable", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const disabledInput = page.getByRole("textbox", { name: "Disabled input" });
    await expect(disabledInput).toBeDisabled();
    await expect(disabledInput).toHaveValue("Cannot edit");
  });

  test("default input accepts typed text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const input = page.getByRole("textbox", { name: "Default input" });
    await input.fill("hello");
    await expect(input).toHaveValue("hello");
  });
});
