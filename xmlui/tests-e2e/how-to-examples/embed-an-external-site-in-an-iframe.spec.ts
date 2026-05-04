import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/embed-an-external-site-in-an-iframe.md"),
);

test.describe("Embedded web page", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Embedded web page");

  test("initial state shows URL input, Load button, and iframe", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("button", { name: "Load" })).toBeVisible();
    await expect(page.locator("iframe")).toBeVisible();
  });

  test("typing a new URL and clicking Load updates the iframe src", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const input = page.getByRole("textbox");
    await input.clear();
    await input.fill("https://example.org");
    await page.getByRole("button", { name: "Load" }).click();
    await expect(page.locator("iframe")).toHaveAttribute("src", "https://example.org");
  });
});
