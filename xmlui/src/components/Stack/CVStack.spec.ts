import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items vertically and centers them", async ({ initTestBed, page }) => {
    await initTestBed(`
      <CVStack testId="cvstack" width="200px" height="200px" backgroundColor="lightgray">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
        <Stack testId="item3" height="32px" width="32px" backgroundColor="green" />
      </CVStack>
    `);

    const cvstack = page.getByTestId("cvstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");
    const item3 = page.getByTestId("item3");

    await expect(cvstack).toBeVisible();
    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();
    await expect(item3).toBeVisible();

    // Get bounding boxes to verify vertical layout and centering
    const cvstackBox = await cvstack.boundingBox();
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();
    const item3Box = await item3.boundingBox();

    // Verify items are stacked vertically (item2 should be below item1, item3 below item2)
    expect(item2Box!.y).toBeGreaterThan(item1Box!.y + item1Box!.height - 1); // -1 for floating point tolerance
    expect(item3Box!.y).toBeGreaterThan(item2Box!.y + item2Box!.height - 1); // -1 for floating point tolerance

    // Verify items are horizontally centered within the container
    const cvstackCenterX = cvstackBox!.x + cvstackBox!.width / 2;
    const item1CenterX = item1Box!.x + item1Box!.width / 2;
    const item2CenterX = item2Box!.x + item2Box!.width / 2;
    const item3CenterX = item3Box!.x + item3Box!.width / 2;

    expect(Math.abs(item1CenterX - cvstackCenterX)).toBeLessThan(1);
    expect(Math.abs(item2CenterX - cvstackCenterX)).toBeLessThan(1);
    expect(Math.abs(item3CenterX - cvstackCenterX)).toBeLessThan(1);

    // Verify the entire content is vertically centered within the container
    const allItemsTopY = item1Box!.y;
    const allItemsBottomY = item3Box!.y + item3Box!.height;
    const allItemsHeight = allItemsBottomY - allItemsTopY;
    const cvstackCenterY = cvstackBox!.y + cvstackBox!.height / 2;
    const contentCenterY = allItemsTopY + allItemsHeight / 2;

    expect(Math.abs(contentCenterY - cvstackCenterY)).toBeLessThan(1);
  });

  test("renders empty CVStack", async ({ initTestBed, page }) => {
    await initTestBed(`<CVStack testId="cvstack"></CVStack>`);
    
    const cvstack = page.getByTestId("cvstack");
    await expect(cvstack).toBeAttached();
    await expect(cvstack).toBeEmpty();
  });

  test("ignores orientation property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <CVStack testId="cvstack" orientation="horizontal" width="200px" height="100px" backgroundColor="lightgray">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
      </CVStack>
    `);

    const cvstack = page.getByTestId("cvstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");

    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();

    // Get bounding boxes to verify still renders vertically and centered despite orientation="horizontal"
    const cvstackBox = await cvstack.boundingBox();
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();

    // Verify items are still stacked vertically (orientation prop should be ignored)
    expect(item2Box!.y).toBeGreaterThan(item1Box!.y + item1Box!.height - 1);

    // Verify items are still horizontally centered
    const cvstackCenterX = cvstackBox!.x + cvstackBox!.width / 2;
    const item1CenterX = item1Box!.x + item1Box!.width / 2;
    expect(Math.abs(item1CenterX - cvstackCenterX)).toBeLessThan(1);
  });
});
