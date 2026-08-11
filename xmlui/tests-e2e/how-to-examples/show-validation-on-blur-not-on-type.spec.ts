import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/show-validation-on-blur-not-on-type.md"),
);

test.describe("Validation timing: on type vs on blur", { tag: "@website" }, () => {
  const { app } = extractXmluiExample(markdown, "Validation timing: on type vs on blur");

  test("renders both fields and the Save button", async ({ initTestBed, page }) => {
    await initTestBed(app);
    await expect(page.getByRole("textbox", { name: /Handle/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Display name/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });

  test("onChanged field shows the minLength error while typing", async ({ initTestBed, page }) => {
    await initTestBed(app);
    await page.getByRole("textbox", { name: /Handle/ }).fill("ab");
    // onChanged: the error appears immediately, without leaving the field
    await expect(page.getByText(/at least 3/i)).toBeVisible();
  });

  test("onLostFocus field shows the error only after blur", async ({ initTestBed, page }) => {
    await initTestBed(app);
    const display = page.getByRole("textbox", { name: /Display name/ });
    await display.fill("ab");
    // onLostFocus: still focused, so no error yet
    await expect(page.getByText(/at least 3/i)).toHaveCount(0);
    await display.blur();
    // after blur, the error appears
    await expect(page.getByText(/at least 3/i)).toBeVisible();
  });
});
