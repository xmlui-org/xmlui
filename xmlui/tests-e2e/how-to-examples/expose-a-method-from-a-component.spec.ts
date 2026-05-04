import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/expose-a-method-from-a-component.md",
  ),
);

test.describe("Modal that tracks and exposes its open count", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Modal that tracks and exposes its open count",
  );

  test("initial state shows Open Modal button and zero count", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Open Modal" })).toBeVisible();
    await expect(page.getByText("Opened 0 time(s)", { exact: true })).toBeVisible();
  });

  test("clicking Open Modal opens the dialog and increments the parent count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Modal" }).click();
    await expect(page.getByText("Task Details", { exact: true })).toBeVisible();
    await expect(page.getByText("Opened 1 time(s)", { exact: true })).toBeVisible();
  });

  test("clicking Open Modal twice increments count to 2", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open Modal" }).click();
    await page.getByText("Close", { exact: true }).click();
    await page.getByRole("button", { name: "Open Modal" }).click();
    await expect(page.getByText("Opened 2 time(s)", { exact: true })).toBeVisible();
  });
});
