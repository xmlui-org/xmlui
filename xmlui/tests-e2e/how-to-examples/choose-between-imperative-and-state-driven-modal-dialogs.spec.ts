import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/choose-between-imperative-and-state-driven-modal-dialogs.md",
  ),
);

test.describe("Imperative ModalDialog", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "imperative-modaldialog");

  test("initial state shows only the Open help button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open help" })).toBeVisible();
    await expect(page.getByText("Use this for static help text or other transient dialogs.")).toHaveCount(0);
  });

  test("clicking Open help shows the dialog and clicking Close dismisses it", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Open help" }).click();
    await expect(page.getByText("Use this for static help text or other transient dialogs.")).toBeVisible();

    await page.getByText("Close", { exact: true }).click();
    await expect(page.getByText("Use this for static help text or other transient dialogs.")).toHaveCount(0);
  });
});

test.describe("State-driven ModalDialog", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "state-driven-modaldialog");

  test("initial state shows only the Show user details button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Show user details" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Leslie Peters" })).toHaveCount(0);
  });

  test("clicking Show user details opens the dialog with the selected data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Show user details" }).click();
    await expect(page.getByText("Leslie Peters", { exact: true })).toBeVisible();
    await expect(page.getByText("Executive Manager")).toBeVisible();
    await expect(page.getByText("leslie@example.com")).toBeVisible();
  });

  test("clicking Close dismisses the state-driven dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Show user details" }).click();
    await page.getByText("Close", { exact: true }).click();
    await expect(page.getByText("Leslie Peters", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Executive Manager")).toHaveCount(0);
  });
});
