import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/branch-on-structured-loader-errors.md",
  ),
);

test.describe("show-different-messages-for-loader-error-categories", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "show-different-messages-for-loader-error-categories",
  );

  test("initial state shows the no-error profile state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("No error")).toBeVisible();
    await expect(page.getByText("Loaded profile: Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Category: authorization")).not.toBeVisible();
  });

  test("switching to auth shows the authorization category", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Auth" }).click();
    await expect(page.getByText("Category: authorization")).toBeVisible();
    await expect(page.getByText("Code: http-403")).toBeVisible();
    await expect(page.getByText("Status: 403")).toBeVisible();
    await expect(page.getByText("Please sign in before opening this profile.")).toBeVisible();
  });

  test("switching to missing profile shows the not-found category", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Missing" }).click();
    await expect(page.getByText("Category: not-found")).toBeVisible();
    await expect(page.getByText("Code: http-404")).toBeVisible();
    await expect(page.getByText("This profile has not been provisioned yet.")).toBeVisible();
  });

  test("switching to conflict shows the conflict category", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Conflict" }).click();
    await expect(page.getByText("Category: conflict")).toBeVisible();
    await expect(page.getByText("Code: http-409")).toBeVisible();
    await expect(
      page.getByText("Someone else changed the profile. Refresh before saving."),
    ).toBeVisible();
  });

  test("switching to server shows the server category", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Server" }).click();
    await expect(page.getByText("Category: server")).toBeVisible();
    await expect(page.getByText("Code: http-500")).toBeVisible();
    await expect(page.getByText("The server failed. Try again in a moment.")).toBeVisible();
  });

  test("switching back to no error hides the previous error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Server" }).click();
    await expect(page.getByText("Category: server")).toBeVisible();
    await page.getByRole("button", { name: "No error" }).click();
    await expect(page.getByText("No error")).toBeVisible();
    await expect(page.getByText("Loaded profile: Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Category: server")).not.toBeVisible();
  });
});
