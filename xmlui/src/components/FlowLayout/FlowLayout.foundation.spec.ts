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

  test("theme-token columnGap keeps percentage items separated without forcing wraps", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <FlowLayout testId="flow" columnGap="$space-8">
          <Stack testId="item1" width="25%" height="32px" backgroundColor="red" />
          <Stack testId="item2" width="25%" height="32px" backgroundColor="blue" />
          <Stack testId="item3" width="25%" height="32px" backgroundColor="green" />
          <Stack testId="item4" width="25%" height="32px" backgroundColor="yellow" />
          <Stack testId="item5" width="25%" height="32px" backgroundColor="maroon" />
          <Stack testId="item6" width="25%" height="32px" backgroundColor="teal" />
          <Stack testId="item7" width="25%" height="32px" backgroundColor="seagreen" />
          <Stack testId="item8" width="25%" height="32px" backgroundColor="olive" />
        </FlowLayout>
      </App>
    `);

    const first = await page.getByTestId("item1").boundingBox();
    const second = await page.getByTestId("item2").boundingBox();
    const fourth = await page.getByTestId("item4").boundingBox();
    const fifth = await page.getByTestId("item5").boundingBox();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(fourth).not.toBeNull();
    expect(fifth).not.toBeNull();

    expect(second!.y).toBe(first!.y);
    expect(fourth!.y).toBe(first!.y);
    expect(fifth!.y).toBeGreaterThan(first!.y);
    expect(second!.x - (first!.x + first!.width)).toBeGreaterThan(0);
  });
});
