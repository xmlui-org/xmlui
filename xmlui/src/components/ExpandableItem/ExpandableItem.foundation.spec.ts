import { expect, test } from "../../testing/fixtures";

test.describe("ExpandableItem foundation", () => {
  test("toggles content from summary click", async ({ initTestBed, page }) => {
    await initTestBed(`<ExpandableItem summary="Details">Hidden content</ExpandableItem>`);

    await expect(page.getByText("Hidden content")).not.toBeVisible();
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByText("Hidden content")).toBeVisible();
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByText("Hidden content")).not.toBeVisible();
  });

  test("expandedChange mutates visible state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.expanded="{false}">
        <ExpandableItem summary="Details" onExpandedChange="value => expanded = value">
          <Text>Hidden content</Text>
        </ExpandableItem>
        <Text testId="state">Expanded: {expanded}</Text>
      </App>
    `);

    await expect(page.getByTestId("state")).toContainText("Expanded: false");
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.getByTestId("state")).toContainText("Expanded: true");
  });

  test("summary template and content updates work", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ExpandableItem initiallyExpanded="true" var.count="{0}">
        <property name="summary">
          <Text>Templated summary</Text>
        </property>
        <Button testId="increment" onClick="count++">Increment</Button>
        <Text testId="value">Count: {count}</Text>
      </ExpandableItem>
    `);

    await expect(page.getByRole("button", { name: /Templated summary/ })).toBeVisible();
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });
});
