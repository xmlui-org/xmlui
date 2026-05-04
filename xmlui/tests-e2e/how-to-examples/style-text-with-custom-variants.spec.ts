import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/style-text-with-custom-variants.md"),
);

test.describe("Custom Text variants and Heading overrides", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Custom Text variants and Heading overrides",
  );

  test("initial state renders custom variant text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Dashboard Overview")).toBeVisible();
    await expect(page.getByText("Key Metrics")).toBeVisible();
    await expect(page.getByText("Recent Activity")).toBeVisible();
  });

  test("cards with caption text are visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$48,200 this quarter")).toBeVisible();
    await expect(page.getByText("Updated 5 minutes ago")).toBeVisible();
    await expect(page.getByText("12 successful this week")).toBeVisible();
    await expect(page.getByText("Last deploy: today at 14:32")).toBeVisible();
  });

  test("heading overrides section shows all three headings", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "H1 — primary colour" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H2 — secondary colour" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H3 — normal weight" })).toBeVisible();
  });
});
