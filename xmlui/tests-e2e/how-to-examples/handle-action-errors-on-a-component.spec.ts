import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/handle-action-errors-on-a-component.md",
  ),
);

test.describe("Handle a button action error locally", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "handle-a-button-action-error-locally",
  );

  test("initial state is ready", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Status: Ready")).toBeVisible();
  });

  test("failing action updates local status through onError", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Run import" }).click();
    await expect(
      page.getByText("Status: Action action failed: Import file is malformed"),
    ).toBeVisible();
  });

  test("allowing the import lets the action succeed", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Allow import" }).click();
    await page.getByRole("button", { name: "Run import" }).click();
    await expect(page.getByText("Status: Import completed")).toBeVisible();
  });
});
