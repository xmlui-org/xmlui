import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/pass-a-template-slot-to-a-component.md",
  ),
);

test.describe("TaskCard with an actionsTemplate slot", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "TaskCard with an actionsTemplate slot",
  );

  test("initial state shows all three view types with their sections", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Manager view")).toBeVisible();
    await expect(page.getByText("Team member view")).toBeVisible();
    await expect(page.getByText("Read-only view")).toBeVisible();
  });

  test("manager view has Edit and Delete buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("team member view has Mark Done button", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Mark Done" })).toBeVisible();
  });

  test("read-only view shows No actions fallback", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("No actions")).toBeVisible();
  });
});
