import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items horizontally centered, supports empty, ignores orientation prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <CHStack testId="chs-main" width="200px" height="200px" backgroundColor="lightgray">
          <Stack testId="chs-i1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="chs-i2" height="32px" width="32px" backgroundColor="blue" />
          <Stack testId="chs-i3" height="32px" width="32px" backgroundColor="green" />
        </CHStack>
        <CHStack testId="chs-empty"></CHStack>
        <CHStack testId="chs-orient" orientation="vertical" width="200px" height="100px" backgroundColor="lightgray">
          <Stack testId="chs-oi1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="chs-oi2" height="32px" width="32px" backgroundColor="blue" />
        </CHStack>
      </Fragment>
    `);

    // Verify horizontal layout and centering
    const chstackBox = await page.getByTestId("chs-main").boundingBox();
    const i1Box = await page.getByTestId("chs-i1").boundingBox();
    const i2Box = await page.getByTestId("chs-i2").boundingBox();
    const i3Box = await page.getByTestId("chs-i3").boundingBox();
    expect(i2Box!.x).toBeGreaterThan(i1Box!.x + i1Box!.width - 1);
    expect(i3Box!.x).toBeGreaterThan(i2Box!.x + i2Box!.width - 1);
    const chsCenterY = chstackBox!.y + chstackBox!.height / 2;
    expect(Math.abs(i1Box!.y + i1Box!.height / 2 - chsCenterY)).toBeLessThan(1);
    expect(Math.abs(i2Box!.y + i2Box!.height / 2 - chsCenterY)).toBeLessThan(1);
    expect(Math.abs(i3Box!.y + i3Box!.height / 2 - chsCenterY)).toBeLessThan(1);
    const chsCenterX = chstackBox!.x + chstackBox!.width / 2;
    const contentCenterX = i1Box!.x + (i3Box!.x + i3Box!.width - i1Box!.x) / 2;
    expect(Math.abs(contentCenterX - chsCenterX)).toBeLessThan(1);

    // Verify empty renders
    await expect(page.getByTestId("chs-empty")).toBeAttached();
    await expect(page.getByTestId("chs-empty")).toBeEmpty();

    // Verify orientation is ignored (still renders horizontally and centered)
    const orientBox = await page.getByTestId("chs-orient").boundingBox();
    const oi1Box = await page.getByTestId("chs-oi1").boundingBox();
    const oi2Box = await page.getByTestId("chs-oi2").boundingBox();
    expect(oi2Box!.x).toBeGreaterThan(oi1Box!.x + oi1Box!.width - 1);
    expect(Math.abs(oi1Box!.y + oi1Box!.height / 2 - (orientBox!.y + orientBox!.height / 2))).toBeLessThan(1);
  });
});
