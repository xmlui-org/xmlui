import { expect, test } from "../../testing/fixtures";

test.describe("FlowLayout foundation", () => {
  test("wraps children and reacts to itemWidth changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.wide="{false}">
        <Button testId="toggle" onClick="wide = !wide">Toggle</Button>
        <FlowLayout testId="flow" width="260px" itemWidth="{wide ? '120px' : '80px'}" gap="10px">
          <Text>A</Text>
          <Text>B</Text>
          <Text>C</Text>
        </FlowLayout>
      </App>
    `);

    const flow = page.getByTestId("flow");
    await expect(flow).toHaveCSS("display", "flex");
    await expect(flow).toHaveCSS("flex-wrap", "wrap");
    await expect(flow).toHaveCSS("column-gap", "10px");

    const firstItem = flow.locator("> div").first();
    await expect(firstItem).toHaveCSS("flex-basis", "80px");
    await page.getByTestId("toggle").click();
    await expect(firstItem).toHaveCSS("flex-basis", "120px");
  });
});
