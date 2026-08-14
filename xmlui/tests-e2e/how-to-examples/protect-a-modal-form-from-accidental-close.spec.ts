import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/protect-a-modal-form-from-accidental-close.md",
  ),
);

test.describe("Protect a dirty modal Form", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "protect-a-dirty-modal-form",
  );

  test("dirty form prompts before dialog closes", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Edit profile" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill("Grace Hopper");
    await expect(page.getByText("dirty")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Discard your profile changes?")).toBeVisible();

    await page.getByRole("button", { name: "Keep Editing" }).click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Grace Hopper");

    await page.getByRole("button", { name: "Close" }).click();
    await page.getByRole("button", { name: "Discard" }).click();
    await expect(page.getByText("Discard your profile changes?")).not.toBeVisible();
    await expect(page.getByText("Name: Ada Lovelace")).toBeVisible();
  });

  test("saving marks the form clean and closes the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Edit profile" }).click();
    await page.getByRole("textbox", { name: "Email" }).fill("grace@example.com");
    await expect(page.getByText("dirty")).toBeVisible();

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Email: grace@example.com")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).not.toBeVisible();
  });
});
