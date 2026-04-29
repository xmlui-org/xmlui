import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/use-modal-dialog-onclose.md"),
);

test.describe("Wrong: Can close but not reopen", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Wrong: Can close but not reopen",
  );

  test("initial state shows Open Dialog button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open Dialog" })).toBeVisible();
  });

  test("clicking Open Dialog opens the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByText("Try to close and then reopen this dialog...")).toBeVisible();
  });
});

test.describe("Right: Can reopen after close", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Right: Can reopen after close",
  );

  test("initial state shows Open Dialog button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open Dialog" })).toBeVisible();
  });

  test("clicking Open Dialog opens the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByText("Try to close and then reopen this dialog...")).toBeVisible();
  });

  test("dialog can be closed and reopened", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByText("Try to close and then reopen this dialog...")).toBeVisible();
    // Close via the dialog's built-in close button
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Try to close and then reopen this dialog...")).not.toBeVisible();
    // Should be able to reopen
    await page.getByRole("button", { name: "Open Dialog" }).click();
    await expect(page.getByText("Try to close and then reopen this dialog...")).toBeVisible();
  });
});
