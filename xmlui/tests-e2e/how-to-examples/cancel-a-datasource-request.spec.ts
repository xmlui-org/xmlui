import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/cancel-a-datasource-request.md"),
);

test.describe("Cancel a slow DataSource request", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Cancel a slow DataSource request",
  );

  test("cancels the in-flight request and shows cancellation state", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Loading orders...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeEnabled();

    await page.getByRole("button", { name: "Cancel request" }).click();

    await expect(page.getByText("Request cancelled: user")).toBeVisible();
    await expect(page.getByText("Last cancellation reason: user")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeDisabled();
  });

  test("clears the cancellation message and completes after refresh", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Cancel request" }).click();
    await expect(page.getByText("Request cancelled: user")).toBeVisible();
    await expect(page.getByText("Last cancellation reason: user")).toBeVisible();

    await page.getByRole("button", { name: "Refresh" }).click();

    await expect(page.getByText("Loading orders...")).toBeVisible();
    await expect(page.getByText("Request cancelled: user")).toBeHidden();
    await expect(page.getByText("Last cancellation reason: user")).toBeHidden();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeEnabled();

    await expect(page.getByText("Orders loaded")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeDisabled();
  });

  test("enables refresh and disables cancel after the data has loaded", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Loading orders...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeEnabled();

    await expect(page.getByText("Orders loaded")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Refresh" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeDisabled();

    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByText("Loading orders...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeEnabled();

    await expect(page.getByText("Orders loaded")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Refresh" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel request" })).toBeDisabled();
  });
});
