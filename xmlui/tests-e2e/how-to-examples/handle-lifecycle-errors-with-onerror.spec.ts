import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/handle-lifecycle-errors-with-onerror.md",
  ),
);

test.describe("show-a-lifecycle-setup-error-in-the-page", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "show-a-lifecycle-setup-error-in-the-page",
  );

  test("initial state shows the listener closed", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Status: Listener closed")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open listener" })).toBeVisible();
  });

  test("opening the listener shows the lifecycle error in the page", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open listener" }).click();
    await expect(
      page.getByText("Status: Lifecycle mount failed: Connection unavailable"),
    ).toBeVisible();
  });

  test("allowing success and reopening shows the ready state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Open listener" }).click();
    await page.getByRole("button", { name: "Allow success" }).click();
    await page.getByRole("button", { name: "Open listener" }).click();
    await expect(page.getByText("Status: Listener ready")).toBeVisible();
  });

  test("closing the successful listener runs unmount cleanup", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Allow success" }).click();
    await page.getByRole("button", { name: "Open listener" }).click();
    await page.getByRole("button", { name: "Close listener" }).click();
    await expect(page.getByText("Status: Listener closed")).toBeVisible();
  });
});
