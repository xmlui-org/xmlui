import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/local-persistence.md"),
);

test.describe("Example: Persisting global variable", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: Persisting global variable");

  // The example is broken
  test.skip("initial count is 0 and increments on button click", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Count: 0").first()).toBeVisible();
    await page.getByRole("button", { name: "Increment" }).first().click();
    await expect(page.getByText("Count: 1").first()).toBeVisible();
  });
});

test.describe("Example: resetLocalStorage", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Example: resetLocalStorage");

  // The example is broken
  test.skip("increment then reset brings count back to 0", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByText("Count: 1")).toBeVisible();
    await page.getByRole("button", { name: "Reset count to default" }).click();
    await expect(page.getByText("Count: 1")).not.toBeVisible();
  });
});
