import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/customize-link-focus-and-decoration.md"),
);

test.describe("Custom Link focus and decoration", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Custom Link focus and decoration");

  test("initial state shows all three links", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("link", { name: "External link with underline" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Link with icon" })).toBeVisible();
    await expect(page.getByRole("link", { name: "link inside text" })).toBeVisible();
  });

  test("inline text contains the link in a sentence", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Inline")).toBeVisible();
    await expect(page.getByText("looks correct.")).toBeVisible();
    await expect(page.getByRole("link", { name: "link inside text" })).toBeVisible();
  });
});
