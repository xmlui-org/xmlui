import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/set-width-for-input-fields-in-a-horizontal-layout.md",
  ),
);

// display-only example — no interaction to test
test.describe("set-the-width-of-an-input-field-in-an-hstack-b6ec", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "set-the-width-of-an-input-field-in-an-hstack-b6ec",
  );

  test("renders two text boxes without explicit width set", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const textboxes = page.getByRole("textbox");
    await expect(textboxes.nth(0)).toBeVisible();
    await expect(textboxes.nth(1)).toBeVisible();
    await expect(textboxes.nth(0)).toHaveValue("First");
    await expect(textboxes.nth(1)).toHaveValue("Second");
  });
});
