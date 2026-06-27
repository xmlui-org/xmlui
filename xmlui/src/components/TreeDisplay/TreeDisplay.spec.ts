import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders tree display with basic content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TreeDisplay testId="tree">
        Root
          Child 1
          Child 2
            Grandchild 1
      </TreeDisplay>
    `);

    const tree = page.getByTestId("tree");
    await expect(tree).toBeVisible();
    await expect(tree).toContainText("Root");
    await expect(tree).toContainText("Child 1");
    await expect(tree).toContainText("Child 2");
    await expect(tree).toContainText("Grandchild 1");
  });

  test("renders tree display with content property", async ({ initTestBed, page }) => {
    const content = `Root
  Child 1
  Child 2
    Grandchild 1`;

    await initTestBed(`
      <TreeDisplay testId="tree" content="${content}" />
    `);

    const tree = page.getByTestId("tree");
    await expect(tree).toBeVisible();
    await expect(tree).toContainText("Root");
    await expect(tree).toContainText("Child 1");
  });

  test("handles empty content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TreeDisplay testId="tree" content="" />
    `);

    const tree = page.getByTestId("tree");
    await expect(tree).toBeVisible();
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================

test.describe("Events", () => {
  test("contextMenu event fires on right click", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="Not clicked">
        <Text testId="output" value="{message}" />
        <TreeDisplay testId="tree" onContextMenu="message = 'Context menu triggered'">
          Root
            Child 1
            Child 2
        </TreeDisplay>
      </App>
    `);

    const tree = page.getByTestId("tree");
    const output = page.getByTestId("output");

    await expect(output).toHaveText("Not clicked");
    await tree.click({ button: "right" });
    await expect(output).toHaveText("Context menu triggered");
  });
});
