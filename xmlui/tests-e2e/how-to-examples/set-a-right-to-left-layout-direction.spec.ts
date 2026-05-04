import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/set-a-right-to-left-layout-direction.md",
  ),
);

test.describe("RTL layout direction", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "RTL layout direction",
  );

  test("initial state renders all five items", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("Second item")).toBeVisible();
    await expect(page.getByText("Third item")).toBeVisible();
    await expect(page.getByText("Fourth item")).toBeVisible();
    await expect(page.getByText("Fifth item")).toBeVisible();
  });
});

test.describe("Default LTR layout direction", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Default LTR layout direction",
  );

  test("initial state renders all five items left to right", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("Second item")).toBeVisible();
    await expect(page.getByText("Third item")).toBeVisible();
    await expect(page.getByText("Fourth item")).toBeVisible();
    await expect(page.getByText("Fifth item")).toBeVisible();
  });
});

test.describe("RTL scoped to a single section", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "RTL scoped to a single section",
  );

  test("initial state shows English and Arabic content sections", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("English — left to right")).toBeVisible();
    await expect(page.getByText("Arabic section — right to left")).toBeVisible();
    await expect(page.getByText("Back to English")).toBeVisible();
  });

  test("Arabic badges are visible", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("أول")).toBeVisible();
    await expect(page.getByText("ثاني")).toBeVisible();
    await expect(page.getByText("ثالث")).toBeVisible();
  });
});
