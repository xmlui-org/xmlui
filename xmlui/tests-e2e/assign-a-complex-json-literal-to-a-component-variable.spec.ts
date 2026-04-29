import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/assign-a-complex-json-literal-to-a-component-variable.md",
  ),
);

test.describe("Assign a complex JSON literal to a variable", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Assign a complex JSON literal to a variable",
  );

  test("initial state renders app name, version, and photo list", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Photo Gallery v1.2.0")).toBeVisible();
    await expect(page.getByText("Photos (3)")).toBeVisible();
    await expect(page.getByText("Sunset Beach - 42 likes")).toBeVisible();
    await expect(page.getByText("Mountain View - 38 likes")).toBeVisible();
    await expect(page.getByText("City Lights - 55 likes")).toBeVisible();
  });

  test("initial state renders team members", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Team")).toBeVisible();
    await expect(page.getByText("Alice Johnson (Photographer)")).toBeVisible();
    await expect(page.getByText("Bob Smith (Editor)")).toBeVisible();
  });
});
