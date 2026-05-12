import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/scoping.md"),
);

test.describe("Global and local variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Global and local variables",
  );

  test("initial state shows global count of 42 and all three buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await expect(page.getByText("Current global count: 42")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Increment global count \(from Main\): 42/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Increment global count \(from component\): 42/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Increment local count: 0/ })).toBeVisible();
  });

  test("increment global from Main updates global count in header and both component buttons", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: /Increment global count \(from Main\)/ }).click();
    await expect(page.getByText("Current global count: 43")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Increment global count \(from Main\): 43/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Increment global count \(from component\): 43/ }),
    ).toBeVisible();
  });

  test("increment global from component updates shared count", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: /Increment global count \(from component\)/ }).click();
    await expect(page.getByText("Current global count: 43")).toBeVisible();
  });

  test("local count button increments only its own count without affecting global", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, noFragmentWrapper: true });
    await page.getByRole("button", { name: /Increment local count: 0/ }).click();
    await expect(page.getByRole("button", { name: /Increment local count: 1/ })).toBeVisible();
    // Global count remains unchanged
    await expect(page.getByText("Current global count: 42")).toBeVisible();
  });
});
