import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/user-defined-components.md"),
);

// display-only example — no interaction to test
test.describe("user-defined-components-b6c8", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "user-defined-components-b6c8",
  );

  test("renders the NameValue component with name and value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Name: Mary")).toBeVisible();
    await expect(page.getByText("Value: 123")).toBeVisible();
  });
});
