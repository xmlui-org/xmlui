import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/build-a-responsive-card-grid.md",
  ),
);

test.describe("Team directory card grid", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Team directory card grid",
  );

  test("initial state renders both grid section headings", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "TileGrid approach" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "HStack wrapContent approach" })).toBeVisible();
  });

  test("all eight team members appear in the TileGrid", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Chen").first()).toBeVisible();
    await expect(page.getByText("Ben Ortiz").first()).toBeVisible();
    await expect(page.getByText("Carol Davis").first()).toBeVisible();
    await expect(page.getByText("Dan Smith").first()).toBeVisible();
    await expect(page.getByText("Eva Brown").first()).toBeVisible();
    await expect(page.getByText("Frank Lee").first()).toBeVisible();
    await expect(page.getByText("Grace Kim").first()).toBeVisible();
    await expect(page.getByText("Henry Wu").first()).toBeVisible();
  });

  test("each team member appears twice — once per grid approach", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Chen")).toHaveCount(2);
    await expect(page.getByText("Henry Wu")).toHaveCount(2);
  });
});

test.describe("TileGrid stretchItems comparison", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "TileGrid stretchItems comparison",
  );

  test("initial state renders both comparison headings", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Without stretchItems (default)")).toBeVisible();
    await expect(page.getByText('With stretchItems="true"')).toBeVisible();
  });

  test("all five team members appear twice — once per grid", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice Chen")).toHaveCount(2);
    await expect(page.getByText("Ben Ortiz")).toHaveCount(2);
    await expect(page.getByText("Carol Davis")).toHaveCount(2);
    await expect(page.getByText("Dan Smith")).toHaveCount(2);
    await expect(page.getByText("Eva Brown")).toHaveCount(2);
  });
});
