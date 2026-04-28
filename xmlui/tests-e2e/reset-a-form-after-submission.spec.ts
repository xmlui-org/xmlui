import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/reset-a-form-after-submission.md",
  ),
);

test.describe("Support ticket form with auto-clear", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Support ticket form with auto-clear",
  );

  test("initial state shows empty ticket fields and normal priority", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("textbox", { name: "Subject" })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Priority" })).toHaveText("normal");
    await expect(page.getByRole("textbox", { name: "Description" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit ticket" })).toBeVisible();
  });

  test("submitting empty required fields shows validation errors", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Submit ticket" }).click();

    await expect(page.getByText("This field is required")).toHaveCount(2);
  });

  test("priority can be changed", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("combobox", { name: "Priority" }).click();
    await page.getByRole("option", { name: "High" }).click();

    await expect(page.getByRole("combobox", { name: "Priority" })).toHaveText("high");
  });

  test("successful submit clears the form", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("textbox", { name: "Subject" }).fill("Printer is offline");
    await page.getByRole("combobox", { name: "Priority" }).click();
    await page.getByRole("option", { name: "High" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("The front desk printer stopped responding.");
    await page.getByRole("button", { name: "Submit ticket" }).click();

    await expect(page.getByRole("textbox", { name: "Subject" })).toHaveValue("");
    await expect(page.getByRole("textbox", { name: "Description" })).toHaveValue("");
    await expect(page.getByRole("combobox", { name: "Priority" })).not.toHaveText("high");
  });
});
