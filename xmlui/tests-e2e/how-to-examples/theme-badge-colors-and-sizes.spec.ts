import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/theme-badge-colors-and-sizes.md",
  ),
);

test.describe("Badge shape and color theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Badge shape and color theming",
  );

  test("initial state renders all rectangular and pill badges", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Rectangular badges:")).toBeVisible();
    await expect(page.getByText("Pill badges:")).toBeVisible();
  });

  test("rectangular badges show New, Beta, and Deprecated", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("New")).toBeVisible();
    await expect(page.getByText("Beta")).toBeVisible();
    await expect(page.getByText("Deprecated")).toBeVisible();
  });

  test("pill badges show Active, Online, and Verified", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active")).toBeVisible();
    await expect(page.getByText("Online")).toBeVisible();
    await expect(page.getByText("Verified")).toBeVisible();
  });
});
