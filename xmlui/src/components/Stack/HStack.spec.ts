import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items horizontally, supports empty, ignores orientation prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <HStack testId="hs-main">
          <Stack testId="hs-i1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="hs-i2" height="32px" width="32px" backgroundColor="blue" />
          <Stack testId="hs-i3" height="32px" width="32px" backgroundColor="green" />
        </HStack>
        <HStack testId="hs-empty"></HStack>
        <HStack testId="hs-orient" orientation="vertical">
          <Stack testId="hs-oi1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="hs-oi2" height="32px" width="32px" backgroundColor="blue" />
        </HStack>
      </Fragment>
    `);

    // Verify horizontal layout
    await expect(page.getByTestId("hs-main")).toBeVisible();
    const i1Box = await page.getByTestId("hs-i1").boundingBox();
    const i2Box = await page.getByTestId("hs-i2").boundingBox();
    const i3Box = await page.getByTestId("hs-i3").boundingBox();
    expect(i2Box!.x).toBeGreaterThan(i1Box!.x + i1Box!.width - 1);
    expect(i3Box!.x).toBeGreaterThan(i2Box!.x + i2Box!.width - 1);
    expect(Math.abs(i1Box!.y - i2Box!.y)).toBeLessThan(1);
    expect(Math.abs(i2Box!.y - i3Box!.y)).toBeLessThan(1);

    // Verify empty renders
    await expect(page.getByTestId("hs-empty")).toBeAttached();
    await expect(page.getByTestId("hs-empty")).toBeEmpty();

    // Verify orientation is ignored (still renders horizontally)
    const oi1Box = await page.getByTestId("hs-oi1").boundingBox();
    const oi2Box = await page.getByTestId("hs-oi2").boundingBox();
    expect(oi2Box!.x).toBeGreaterThan(oi1Box!.x + oi1Box!.width - 1);
  });
});
