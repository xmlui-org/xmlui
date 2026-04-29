import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/build-a-holy-grail-layout.md",
  ),
);

test.describe("Holy-grail layout", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Holy-grail layout");

  test("initial state renders the header logo, nav links, and Overview page", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Project Hub").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reports" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("12 in progress")).toBeVisible();
    await expect(page.getByText("24 contributors")).toBeVisible();
  });

  test("clicking Projects nav link shows the Projects page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Projects" }).click();
    await expect.poll(() => page.getByRole("heading", { name: "Projects" }).isVisible()).toBe(true);
    await expect(page.getByText("All active projects are listed here.")).toBeVisible();
  });

  test("clicking Reports nav link shows the Reports page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Reports" }).click();
    await expect.poll(() => page.getByRole("heading", { name: "Reports" }).isVisible()).toBe(true);
    await expect(page.getByText("Monthly and quarterly reports appear here.")).toBeVisible();
  });

  test("footer copyright text is visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("© 2025 Project Hub")).toBeVisible();
  });
});
