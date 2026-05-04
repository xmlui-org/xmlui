import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/delegate-a-method.md"),
);

test.describe("TaskDialog with delegated open and close methods", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "TaskDialog with delegated open and close methods",
  );

  test("initial state shows Open Task button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open Task" })).toBeVisible();
  });

  test("clicking Open Task opens the dialog with task details", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Task" }).click();
    await expect(page.getByText("Assigned to: Alice")).toBeVisible();
    await expect(page.getByText("Close", { exact: true })).toBeVisible();
  });

  test("clicking Close dismisses the dialog", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Task" }).click();
    await expect(page.getByText("Assigned to: Alice")).toBeVisible();
    await page.getByText("Close", { exact: true }).click();
    await expect(page.getByText("Assigned to: Alice")).not.toBeVisible();
  });
});
