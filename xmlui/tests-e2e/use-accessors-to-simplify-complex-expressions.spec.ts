import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/use-accessors-to-simplify-complex-expressions.md"),
);

test.describe("Use accessors to simplify complex expressions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Use accessors to simplify complex expressions",
  );

  test("initial state shows both weather cards with temperature and conditions", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Weather (without accessors)")).toBeVisible();
    await expect(page.getByText("Weather (with accessors)")).toBeVisible();
    await expect(page.getByText("72°F").first()).toBeVisible();
    await expect(page.getByText("22°C").first()).toBeVisible();
    await expect(page.getByText("Partly cloudy").first()).toBeVisible();
  });

  test("both cards show the same temperature data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const tempTexts = page.getByText("72°F");
    await expect(tempTexts.first()).toBeVisible();
    await expect(tempTexts.last()).toBeVisible();
  });

  test("both cards show the same conditions data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const condTexts = page.getByText("Partly cloudy");
    await expect(condTexts.first()).toBeVisible();
    await expect(condTexts.last()).toBeVisible();
  });
});
