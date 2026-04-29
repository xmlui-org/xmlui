import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/limit-content-width-on-large-screens.md"),
);

test.describe("maxWidth centred reading column", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "maxWidth centred reading column");

  test("initial state shows the article heading and body text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Project Architecture" })).toBeVisible();
    await expect(page.getByText("Updated March 2025")).toBeVisible();
    await expect(page.getByText("The system is divided into three layers")).toBeVisible();
    await expect(page.getByText("All external API calls are routed")).toBeVisible();
  });
});
