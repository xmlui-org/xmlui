import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";
import { SKIP_REASON } from "../../src/testing/component-test-helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/create-a-multi-level-submenu.md"),
);

test.describe("Open the menu and hover over submenus", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Open the menu and hover over submenus",
  );

  test('initial state shows the Insert button and "Last action: (none)"', async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Insert" })).toBeVisible();
    await expect(page.getByText("Last action: (none)")).toBeVisible();
  });

  test("opening the menu shows top-level items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await expect(page.getByRole("menuitem", { name: "Text block" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Table" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Media" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Horizontal rule" })).toBeVisible();
  });

  test("clicking Text block updates last action and closes the menu", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByRole("menuitem", { name: "Text block" }).click();
    await expect(page.getByText("Last action: Inserted text block")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Text block" })).not.toBeVisible();
  });

  test("clicking Horizontal rule updates last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByRole("menuitem", { name: "Horizontal rule" }).click();
    await expect(page.getByText("Last action: Inserted horizontal rule")).toBeVisible();
  });

  test("hovering Table submenu reveals nested size options", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByRole("menuitem", { name: "Table" }).hover();
    await expect(page.getByRole("menuitem", { name: "2 × 2" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "3 × 3" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "4 × 4" })).toBeVisible();
  });

  test("clicking a table size option updates last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByRole("menuitem", { name: "Table" }).hover();
    await page.getByRole("menuitem", { name: "3 × 3" }).click();
    await expect(page.getByText("Last action: Inserted 3×3 table")).toBeVisible();
  });

  test("hovering Media submenu reveals image video and embed items", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Insert" }).click();
    await page.getByRole("menuitem", { name: "Media" }).hover();
    await expect(page.getByRole("menuitem", { name: "Image" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Video" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Embed" })).toBeVisible();
  });

  // Radix UI's SubTrigger relies on a pointer-grace-zone to keep the panel
  // open during diagonal mouse movement. Playwright's synthetic hover events
  // don't preserve the hover state long enough to navigate through two
  // nested sub-panels in sequence, so this test is skipped.
  test.skip(
    "clicking a third-level embed option (YouTube) updates last action",
    SKIP_REASON.OTHER(
      "3-level SubMenuItem hover navigation not reliably testable via Playwright synthetic pointer events (Radix pointer-grace-zone limitation)",
    ),
    async ({ initTestBed, page }) => {},
  );
});
