import { expect, test } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

test.describe("Stack migration regressions", () => {
  test("auto-height horizontal Stack rows do not stretch when VStack is the app root", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <VStack testId="root">
        <Stack testId="row-px" orientation="horizontal" backgroundColor="cyan" gap="80px">
          <Stack testId="px-red" height="40px" width="40px" backgroundColor="red" />
          <Stack testId="px-green" height="40px" width="40px" backgroundColor="green" />
          <Stack testId="px-blue" height="40px" width="40px" backgroundColor="blue" />
          <Stack testId="px-yellow" height="40px" width="40px" backgroundColor="yellow" />
        </Stack>
        <Stack testId="row-ch" orientation="horizontal" backgroundColor="cyan" gap="12ch">
          <Stack testId="ch-red" height="40px" width="40px" backgroundColor="red" />
          <Stack testId="ch-green" height="40px" width="40px" backgroundColor="green" />
          <Stack testId="ch-blue" height="40px" width="40px" backgroundColor="blue" />
          <Stack testId="ch-yellow" height="40px" width="40px" backgroundColor="yellow" />
        </Stack>
      </VStack>
    `);

    const pxRow = await getBounds(page.getByTestId("row-px"));
    const chRow = await getBounds(page.getByTestId("row-ch"));
    const root = await getBounds(page.getByTestId("root"));
    const pxRed = await getBounds(page.getByTestId("px-red"));
    const pxGreen = await getBounds(page.getByTestId("px-green"));

    expect(pxRow.height).toBeCloseTo(40, 0);
    expect(chRow.height).toBeCloseTo(40, 0);
    expect(pxRow.width).toBeCloseTo(root.width, 0);
    expect(chRow.width).toBeCloseTo(root.width, 0);
    expect(pxGreen.left - pxRed.right).toBeCloseTo(80, 0);
  });

  test("verticalAlignment on default vertical Stack aligns along the vertical axis", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Stack testId="container" height="100px" verticalAlignment="end" backgroundColor="cyan">
          <Stack testId="item" width="36px" height="36px" backgroundColor="red" />
        </Stack>
      </App>
    `);

    const container = await getBounds(page.getByTestId("container"));
    const item = await getBounds(page.getByTestId("item"));

    expect(item.left).toBeCloseTo(container.left, 0);
    expect(item.bottom).toBeCloseTo(container.bottom, 0);
  });
});
