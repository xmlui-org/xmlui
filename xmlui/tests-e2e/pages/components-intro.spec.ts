import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/components-intro.md"),
);

// display-only example — no interaction to test
test.describe("built-in-components-eafb", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "built-in-components-eafb",
  );

  test("renders the TubeStops component for the Bakerloo line", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Bakerloo")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("user-defined-components-eab5", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "user-defined-components-eab5",
  );

  test("renders TubeStops components for victoria and waterloo-city lines", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("victoria")).toBeVisible();
    await expect(page.getByText("waterloo-city")).toBeVisible();
  });
});
