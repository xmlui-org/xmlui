import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/inline-one-use-action-components.md",
  ),
);

test.describe("Inline a one-use APICall", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "inline-a-one-use-apicall",
  );

  test("initial state shows open tasks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Open tasks")).toBeVisible();
    await expect(page.getByText("Write release notes")).toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
    await expect(page.getByRole("button", { name: "Archive" })).toHaveCount(2);
  });

  test("clicking Archive removes that task after the inline APICall succeeds", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Archive" }).first().click();

    await expect(page.getByText("Archived: Write release notes")).toBeVisible();
    await expect(page.getByText("Write release notes", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Review pull request")).toBeVisible();
  });
});
