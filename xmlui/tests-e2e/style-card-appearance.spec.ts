import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/style-card-appearance.md"),
);

test.describe("Card appearance theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Card appearance theming");

  test("initial state shows both card titles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Users")).toBeVisible();
  });

  test("initial state shows card body content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$12,400 this month")).toBeVisible();
    await expect(page.getByText("3,210 active")).toBeVisible();
  });
});
