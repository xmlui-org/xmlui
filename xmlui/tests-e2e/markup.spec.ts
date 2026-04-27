import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/markup.md"),
);

test.describe("A complex JSON object", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "A complex JSON object");

  test("filling station name and submitting shows it in the output", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.locator('input[type="text"]').fill("Liverpool");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("textarea")).toContainText("Liverpool");
  });
});

test.describe("Declare an event handler using the <event> tag", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Declare an event handler using the <event> tag",
  );

  test("clicking the button increments the count in its label", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: /Click me! Click count = 0/ }).click();
    await expect(page.getByRole("button", { name: /Click me! Click count = 1/ })).toBeVisible();
  });
});

test.describe("Defining and using reactive variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Defining and using reactive variables",
  );

  test("clicking increment updates count directly and indirectly", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Click to increment the count" }).click();
    await expect(page.getByText("Click count = 1 (changes directly)")).toBeVisible();
    await expect(page.getByText("Click count * 3 = 3 (changes indirectly)")).toBeVisible();
  });
});
