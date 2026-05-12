import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-04.md"),
);

// display-only example — no interaction to test
test.describe("infocards", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "infocards");

  test("renders Outstanding and Paid this year cards with their values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Outstanding")).toBeVisible();
    await expect(page.getByText("3569")).toBeVisible();
    await expect(page.getByText("Paid this year")).toBeVisible();
    await expect(page.getByText("1745")).toBeVisible();
  });
});
