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
    const flowContainer = flow.locator("> div > div");
    await expect(flowContainer).toHaveCSS("display", "flex");
    await expect(flowContainer).toHaveCSS("flex-wrap", "wrap");

    const firstItem = flowContainer.locator("> div").first();
    await expect(firstItem).toHaveCSS("width", "90px");
    await expect(firstItem).toHaveCSS("padding-right", "10px");
    await page.getByTestId("toggle").click();
    await expect(firstItem).toHaveCSS("width", "130px");
  });

  test("resolves theme token columnGap for percentage-width children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <FlowLayout testId="flow" columnGap="$space-8">
          <Stack testId="red" width="25%" height="32px" backgroundColor="red" />
          <Stack testId="blue" width="25%" height="32px" backgroundColor="blue" />
          <Stack testId="green" width="25%" height="32px" backgroundColor="green" />
          <Stack testId="yellow" width="25%" height="32px" backgroundColor="yellow" />
        </FlowLayout>
      </App>
    `);

    const red = await page.getByTestId("red").boundingBox();
    const blue = await page.getByTestId("blue").boundingBox();
    expect(red).toBeTruthy();
    expect(blue).toBeTruthy();
    expect(blue!.x - (red!.x + red!.width)).toBeGreaterThan(20);
  });
});
