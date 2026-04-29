import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/set-default-property-values.md",
  ),
);

test.describe("PriorityBadge with default property values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "PriorityBadge with default property values",
  );

  test("initial state shows all four section headings", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Defaults in effect")).toBeVisible();
    await expect(page.getByText("Override variant to pill")).toBeVisible();
    await expect(page.getByText("No props at all — all defaults apply")).toBeVisible();
  });

  test("default section shows priority labels for all three levels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("high priority").first()).toBeVisible();
    await expect(page.getByText("normal priority").first()).toBeVisible();
    await expect(page.getByText("low priority")).toBeVisible();
  });

  test("suppress label section shows badge without label text", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Suppress the label")).toBeVisible();
  });
});
