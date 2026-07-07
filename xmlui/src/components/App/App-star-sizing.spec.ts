import { expect, test } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

test.describe("App star sizing", () => {
  test("distributes direct content children by star height when content scrolls internally", async ({
    initTestBed,
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await initTestBed(`
      <App layout="horizontal" scrollWholePage="false">
        <AppHeader>
          Horizontal Splitter Example
        </AppHeader>
        <CHStack testId="one" height="*" backgroundColor="lightblue">1/4</CHStack>
        <CHStack testId="three" height="3*" backgroundColor="lightcoral">3/4</CHStack>
        <Footer>
          Footer Content
        </Footer>
      </App>
    `);

    const one = await getBounds(page.getByTestId("one"));
    const three = await getBounds(page.getByTestId("three"));

    expect(one.height).toBeGreaterThan(100);
    expect(three.height).toBeGreaterThan(one.height * 2.5);
    expect(three.height / one.height).toBeCloseTo(3, 1);
  });
});
