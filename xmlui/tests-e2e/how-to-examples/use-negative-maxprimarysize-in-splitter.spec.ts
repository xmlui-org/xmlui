import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/use-negative-maxprimarysize-in-splitter.md",
  ),
);

test.describe("Negative maxPrimarySize in HSplitter", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Negative maxPrimarySize in HSplitter",
  );

  test("initial state renders both panels with their headings", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Left panel" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Right panel" })).toBeVisible();
  });

  test("descriptive text in both panels is visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Drag right → stops before right disappears.")).toBeVisible();
    await expect(page.getByText("Always has at least 180 px of space.")).toBeVisible();
  });
});
