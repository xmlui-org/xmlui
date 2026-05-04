import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/dock-elements-to-panel-edges.md"),
);

test.describe("Scrollable panel with bottom actions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Scrollable panel with bottom actions",
  );

  test("initial state shows header, scrollable content, and action buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Preview events")).toBeVisible();
    await expect(page.getByText("Community forum at the library")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Feed" })).toBeVisible();
  });

  test("scrollable list contains multiple event items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Farmers market opening day")).toBeVisible();
    await expect(page.getByText("Community bike ride kickoff")).toBeVisible();
  });
});

test.describe("All four dock edges", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "All four dock edges");

  test("initial state shows toolbar, sidebar, properties panel, and status bar", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Editor", { exact: true })).toBeVisible();
    await expect(page.getByText("Files")).toBeVisible();
    await expect(page.getByText("index.xmlui")).toBeVisible();
    await expect(page.getByText("Properties")).toBeVisible();
    await expect(page.getByText("width: auto")).toBeVisible();
    await expect(page.getByText("…editor content…")).toBeVisible();
    await expect(page.getByText("UTF-8")).toBeVisible();
  });
});
