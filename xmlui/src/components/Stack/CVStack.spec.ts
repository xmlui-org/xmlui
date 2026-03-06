import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items vertically centered, supports empty, ignores orientation prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <CVStack testId="cvs-main" width="200px" height="200px" backgroundColor="lightgray">
          <Stack testId="cvs-i1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="cvs-i2" height="32px" width="32px" backgroundColor="blue" />
          <Stack testId="cvs-i3" height="32px" width="32px" backgroundColor="green" />
        </CVStack>
        <CVStack testId="cvs-empty"></CVStack>
        <CVStack testId="cvs-orient" orientation="horizontal" width="200px" height="100px" backgroundColor="lightgray">
          <Stack testId="cvs-oi1" height="32px" width="32px" backgroundColor="red" />
          <Stack testId="cvs-oi2" height="32px" width="32px" backgroundColor="blue" />
        </CVStack>
      </Fragment>
    `);

    // Verify vertical layout and centering
    const cvstackBox = await page.getByTestId("cvs-main").boundingBox();
    const i1Box = await page.getByTestId("cvs-i1").boundingBox();
    const i2Box = await page.getByTestId("cvs-i2").boundingBox();
    const i3Box = await page.getByTestId("cvs-i3").boundingBox();
    expect(i2Box!.y).toBeGreaterThan(i1Box!.y + i1Box!.height - 1);
    expect(i3Box!.y).toBeGreaterThan(i2Box!.y + i2Box!.height - 1);
    const cvsCenterX = cvstackBox!.x + cvstackBox!.width / 2;
    expect(Math.abs(i1Box!.x + i1Box!.width / 2 - cvsCenterX)).toBeLessThan(1);
    expect(Math.abs(i2Box!.x + i2Box!.width / 2 - cvsCenterX)).toBeLessThan(1);
    expect(Math.abs(i3Box!.x + i3Box!.width / 2 - cvsCenterX)).toBeLessThan(1);
    const cvsCenterY = cvstackBox!.y + cvstackBox!.height / 2;
    const contentCenterY = i1Box!.y + (i3Box!.y + i3Box!.height - i1Box!.y) / 2;
    expect(Math.abs(contentCenterY - cvsCenterY)).toBeLessThan(1);

    // Verify empty renders
    await expect(page.getByTestId("cvs-empty")).toBeAttached();
    await expect(page.getByTestId("cvs-empty")).toBeEmpty();

    // Verify orientation is ignored (still renders vertically and centered)
    const orientBox = await page.getByTestId("cvs-orient").boundingBox();
    const oi1Box = await page.getByTestId("cvs-oi1").boundingBox();
    const oi2Box = await page.getByTestId("cvs-oi2").boundingBox();
    expect(oi2Box!.y).toBeGreaterThan(oi1Box!.y + oi1Box!.height - 1);
    expect(Math.abs(oi1Box!.x + oi1Box!.width / 2 - (orientBox!.x + orientBox!.width / 2))).toBeLessThan(1);
  });
});
