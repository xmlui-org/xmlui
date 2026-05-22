import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { extractXmluiExample, getExampleSource } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto.md"),
);

test.describe("Click on a team member to edit details", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Click on a team member to edit details",
  );

  test("initial state shows team directory with all three members", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Team Directory")).toBeVisible();
    await expect(page.getByText("Sarah Chen")).toBeVisible();
    await expect(page.getByText("Marcus Johnson")).toBeVisible();
    await expect(page.getByText("Elena Rodriguez")).toBeVisible();
  });

  test("clicking a team member card opens the details modal dialog", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Sarah Chen").first().click();
    const dialog = page.getByRole("dialog", { name: "Team Member Details" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("sarah@company.com")).toBeVisible();
    await expect(dialog.getByText("Product", { exact: true })).toBeVisible();
  });

  test("modal shows correct details for a different team member", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Marcus Johnson").first().click();
    const dialog = page.getByRole("dialog", { name: "Team Member Details" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("marcus@company.com")).toBeVisible();
    await expect(dialog.getByText("Engineering", { exact: true })).toBeVisible();
  });
});
