import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/deep-link-to-a-tab-or-section.md"),
);

test.describe("Deep-linkable Tabs via query parameter", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Deep-linkable Tabs via query parameter");

  test("initial state shows the Overview tab content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Members" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Project Overview" })).toBeVisible();
    await expect(page.getByText("High-level summary of the project status and milestones.")).toBeVisible();
  });

  test("clicking Members tab shows the Members content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("tab", { name: "Members" }).click();
    await expect(page.getByRole("heading", { name: "Team Members" })).toBeVisible();
    await expect(page.getByText("Alice, Bob, Carol, Dave")).toBeVisible();
  });

  test("clicking Settings tab shows the Settings content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Project Settings" })).toBeVisible();
    await expect(page.getByText("Notification preferences, access control, and integrations.")).toBeVisible();
  });

  test("switching tabs updates the tab index state", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("tab", { name: "Members" }).click();
    await expect(page.getByRole("heading", { name: "Team Members" })).toBeVisible();
    await page.getByRole("tab", { name: "Overview" }).click();
    await expect(page.getByRole("heading", { name: "Project Overview" })).toBeVisible();
  });
});
