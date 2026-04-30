import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/disable-menu-items-conditionally.md"),
);

test.describe("Select a task to enable actions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Select a task to enable actions");

  test("initial state shows three tasks and hint text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Design mockups")).toBeVisible();
    await expect(page.getByText("Write tests")).toBeVisible();
    await expect(page.getByText("Deploy v2")).toBeVisible();
    await expect(page.getByText("Click a task to select it, then open Actions to act on it.")).toBeVisible();
  });

  test("all menu items are disabled before any task is selected", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Archive" })).toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveClass(/disabled/);
  });

  test("selecting an active task enables Edit, Archive, and Delete", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("heading", { name: "Design mockups" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "Edit" })).not.toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Archive" })).not.toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Delete" })).not.toHaveClass(/disabled/);
  });

  test("selecting an archived task disables Edit and Archive but keeps Delete enabled", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("heading", { name: "Deploy v2" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Archive" })).toHaveClass(/disabled/);
    await expect(page.getByRole("menuitem", { name: "Delete" })).not.toHaveClass(/disabled/);
  });

  test("Edit action records last action text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("heading", { name: "Design mockups" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect(page.getByText("Last action: Editing: Design mockups")).toBeVisible();
  });

  test("Archive action updates the task status", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("heading", { name: "Write tests" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Archive" }).click();
    await expect(page.getByText("Last action: Archived: Write tests")).toBeVisible();
    // Re-select to verify Archive is now disabled for the newly archived task
    await page.getByRole("heading", { name: "Write tests" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await expect(page.getByRole("menuitem", { name: "Archive" })).toHaveClass(/disabled/);
  });

  test("Delete action removes the task from the list", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("heading", { name: "Design mockups" }).click();
    await page.getByRole("button", { name: "Actions" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(page.getByText("Last action: Deleted: Design mockups")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Design mockups" })).not.toBeVisible();
  });
});
