import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/cancel-a-deferred-api-operation.md",
  ),
);

test.describe("Cancel a long-running export", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Cancel a long-running export",
  );

  test("shows all buttons with correct initial enabled state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Start Export" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Stop Polling" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel on Server" })).toBeDisabled();
  });

  test("clicking Start Export enables the cancel buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Start Export" }).click();
    await expect
      .poll(() => page.getByRole("button", { name: "Stop Polling" }).isEnabled())
      .toBe(true);
    await expect(page.getByRole("button", { name: "Cancel on Server" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Start Export" })).toBeDisabled();
  });

  test("clicking Stop Polling shows the stopped toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Start Export" }).click();
    await expect
      .poll(() => page.getByRole("button", { name: "Stop Polling" }).isEnabled())
      .toBe(true);
    await page.getByRole("button", { name: "Stop Polling" }).click();
    await expect.poll(() => page.getByText("Polling stopped").isVisible()).toBe(true);
  });
});
