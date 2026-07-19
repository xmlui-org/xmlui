import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/keep-a-small-app-in-one-file.md",
  ),
);

test.describe("small-task-tracker-in-one-file", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "small-task-tracker-in-one-file",
  );

  test("renders the app root and inline component rows", async ({ initTestBed, page }) => {
    await initTestBed(app, {
      components,
      apiInterceptor,
      noFragmentWrapper: true,
      parserOptions: { role: "entrypoint" },
    });
    await expect(page.getByText("Today")).toBeVisible();
    await expect(page.getByText("Review invoice import")).toBeVisible();
    await expect(page.getByText("Fix CSV validation")).toBeVisible();
    await expect(page.getByText("Publish release notes")).toBeVisible();
  });

  test("passes task data through props to nested inline components", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, {
      components,
      apiInterceptor,
      noFragmentWrapper: true,
      parserOptions: { role: "entrypoint" },
    });
    await expect(page.getByText("Owner: Alice")).toBeVisible();
    await expect(page.getByText("Owner: Bob")).toBeVisible();
    await expect(page.getByText("Owner: Carol")).toBeVisible();
    await expect(page.getByText("ready")).toBeVisible();
    await expect(page.getByText("blocked")).toBeVisible();
    await expect(page.getByText("done")).toBeVisible();
  });
});
