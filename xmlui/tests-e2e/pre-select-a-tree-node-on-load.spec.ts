import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/pre-select-a-tree-node-on-load.md"),
);

test.describe("Settings tree with pre-selected node", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Settings tree with pre-selected node",
  );

  test("initial state selects and reveals the Security node", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("treeitem", { name: "Settings" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByRole("treeitem", { name: "Account" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByRole("treeitem", { name: "Security" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByText("security", { exact: true })).toBeVisible();
  });

  test("clicking another node updates the selected section", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("treeitem", { name: "Profile" }).click();

    await expect(page.getByRole("treeitem", { name: "Profile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByText("profile", { exact: true })).toBeVisible();
  });
});
