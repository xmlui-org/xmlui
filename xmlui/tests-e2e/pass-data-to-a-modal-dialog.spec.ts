import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/pass-data-to-a-modal-dialog.md"),
);

test.describe("Click on a team member to edit details", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Click on a team member to edit details",
  );

  test("initial state shows the team directory cards", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("heading", { name: "Team Directory" })).toBeVisible();
    await expect(page.getByText("Sarah Chen", { exact: true })).toBeVisible();
    await expect(page.getByText("Product Manager - Product", { exact: true })).toBeVisible();
    await expect(page.getByText("Marcus Johnson", { exact: true })).toBeVisible();
    await expect(page.getByText("Senior Developer - Engineering", { exact: true })).toBeVisible();
    await expect(page.getByText("Elena Rodriguez", { exact: true })).toBeVisible();
    await expect(page.getByText("UX Designer - Design", { exact: true })).toBeVisible();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking Sarah Chen opens the dialog with her details", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByText("Sarah Chen", { exact: true }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("sarah@company.com", { exact: true })).toBeVisible();
    await expect(page.getByText("Product", { exact: true })).toBeVisible();
    await expect(page.getByText("2022-03-15", { exact: true })).toBeVisible();
    await expect(page.getByText("#1", { exact: true })).toBeVisible();
  });

  test("clicking Marcus Johnson opens the dialog with his details", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByText("Marcus Johnson", { exact: true }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("marcus@company.com", { exact: true })).toBeVisible();
    await expect(page.getByText("Engineering", { exact: true })).toBeVisible();
    await expect(page.getByText("2021-08-20", { exact: true })).toBeVisible();
    await expect(page.getByText("#2", { exact: true })).toBeVisible();
  });
});
