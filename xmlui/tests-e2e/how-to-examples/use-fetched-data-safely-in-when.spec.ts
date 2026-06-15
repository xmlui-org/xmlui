import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/use-fetched-data-safely-in-when.md",
  ),
);

test.describe("Use fetched data safely in when", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Use fetched data safely in when",
  );

  test("shows loading state before the profile DataSource resolves", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Loading profile...")).toBeVisible();
    await expect(page.getByText("Billing address")).not.toBeVisible();
  });

  test("renders the billing card after the derived condition becomes true", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Billing address")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("12 Analytical Engine Way")).toBeVisible();
    await expect(page.getByText("London")).toBeVisible();
    await expect(page.getByText("No billing address on file.")).not.toBeVisible();
  });
});
