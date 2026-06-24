import { expect, test } from "../../testing/fixtures";

const nestedCounterSource =
  "&lt;App var.count=&quot;{0}&quot;&gt;" +
  "&lt;Text testId=&quot;nested-count&quot;&gt;Nested: {count}&lt;/Text&gt;" +
  "&lt;Button testId=&quot;nested-button&quot; onClick=&quot;count++&quot;&gt;Increment nested&lt;/Button&gt;" +
  "&lt;/App&gt;";

test.describe("NestedApp foundation", () => {
  test("renders nested XMLUI source and keeps its local state isolated", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{10}">
        <Text testId="outer-count">Outer: {count}</Text>
        <Button testId="outer-button" onClick="count++">Increment outer</Button>
        <NestedApp testId="nested" app="{'${nestedCounterSource}'}" />
      </App>
    `);

    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 10");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 0");

    await page.getByTestId("nested-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 10");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");

    await page.getByTestId("outer-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 11");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");
  });

  test("applies the height prop to the nested app container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" height="120px" app="{'&lt;App&gt;&lt;Text&gt;Nested&lt;/Text&gt;&lt;/App&gt;'}" />
      </App>
    `);

    await expect(page.getByTestId("nested")).toHaveCSS("height", "120px");
  });

  test("shows a compile error inside the nested app boundary", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" app="{'&lt;App&gt;&lt;UnknownNestedComponent /&gt;&lt;/App&gt;'}" />
      </App>
    `);

    await expect(page.getByTestId("nested-error")).toContainText("Unknown XMLUI component");
  });
});
