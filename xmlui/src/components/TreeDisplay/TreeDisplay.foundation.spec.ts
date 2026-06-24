import { expect, test } from "../../testing/fixtures";

test("TreeDisplay foundation renders indented content", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TreeDisplay
      testId="display"
      content="Root
  Child
    Grandchild" />
  `);

  await expect(page.getByTestId("display")).toContainText("Root");
  await expect(page.getByTestId("display")).toContainText("Grandchild");
});
