import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/open-a-context-menu-on-right-click.md",
  ),
);

test.describe("Right-click a project row", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Right-click a project row",
  );

  test("initial state shows all three project rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Right-click a project row", { exact: true })).toBeVisible();
    await expect(page.getByText("Website Redesign", { exact: true })).toBeVisible();
    await expect(page.getByText("Mobile App v2", { exact: true })).toBeVisible();
    await expect(page.getByText("API Migration", { exact: true })).toBeVisible();
  });

  test("right-clicking a card opens the context menu with all actions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Website Redesign", { exact: true }).click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Duplicate" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Archive" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();
  });

  test("pressing Escape closes the context menu", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Website Redesign", { exact: true }).click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: "Edit" })).not.toBeVisible();
  });

  test("clicking Edit records the last action for the right-clicked row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Website Redesign", { exact: true }).click({ button: "right" });
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect.poll(() =>
      page.getByText("Last action: Edit: Website Redesign").isVisible()
    ).toBe(true);
  });

  test("clicking Duplicate records the last action for the right-clicked row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Mobile App v2", { exact: true }).click({ button: "right" });
    await page.getByRole("menuitem", { name: "Duplicate" }).click();
    await expect.poll(() =>
      page.getByText("Last action: Duplicate: Mobile App v2").isVisible()
    ).toBe(true);
  });

  test("clicking Archive records the last action for the right-clicked row", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("API Migration", { exact: true }).click({ button: "right" });
    await page.getByRole("menuitem", { name: "Archive" }).click();
    await expect.poll(() =>
      page.getByText("Last action: Archive: API Migration").isVisible()
    ).toBe(true);
  });

  test("the $context binds to the row that was right-clicked", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Mobile App v2", { exact: true }).click({ button: "right" });
    await page.getByRole("menuitem", { name: "Edit" }).click();
    await expect.poll(() =>
      page.getByText("Last action: Edit: Mobile App v2").isVisible()
    ).toBe(true);
  });
});
