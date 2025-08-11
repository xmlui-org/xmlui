import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items horizontally and centers them", async ({ initTestBed, page }) => {
    await initTestBed(`
      <CHStack testId="chstack" width="200px" height="200px" backgroundColor="lightgray">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
        <Stack testId="item3" height="32px" width="32px" backgroundColor="green" />
      </CHStack>
    `);

    const chstack = page.getByTestId("chstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");
    const item3 = page.getByTestId("item3");

    await expect(chstack).toBeVisible();
    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();
    await expect(item3).toBeVisible();

    // Get bounding boxes to verify horizontal layout and centering
    const chstackBox = await chstack.boundingBox();
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();
    const item3Box = await item3.boundingBox();

    // Verify items are stacked horizontally (item2 should be to the right of item1, item3 to the right of item2)
    expect(item2Box!.x).toBeGreaterThan(item1Box!.x + item1Box!.width - 1); // -1 for floating point tolerance
    expect(item3Box!.x).toBeGreaterThan(item2Box!.x + item2Box!.width - 1); // -1 for floating point tolerance

    // Verify items are vertically centered within the container
    const chstackCenterY = chstackBox!.y + chstackBox!.height / 2;
    const item1CenterY = item1Box!.y + item1Box!.height / 2;
    const item2CenterY = item2Box!.y + item2Box!.height / 2;
    const item3CenterY = item3Box!.y + item3Box!.height / 2;

    expect(Math.abs(item1CenterY - chstackCenterY)).toBeLessThan(1);
    expect(Math.abs(item2CenterY - chstackCenterY)).toBeLessThan(1);
    expect(Math.abs(item3CenterY - chstackCenterY)).toBeLessThan(1);

    // Verify the entire content is horizontally centered within the container
    const allItemsLeftX = item1Box!.x;
    const allItemsRightX = item3Box!.x + item3Box!.width;
    const allItemsWidth = allItemsRightX - allItemsLeftX;
    const chstackCenterX = chstackBox!.x + chstackBox!.width / 2;
    const contentCenterX = allItemsLeftX + allItemsWidth / 2;

    expect(Math.abs(contentCenterX - chstackCenterX)).toBeLessThan(1);
  });

  test("renders empty CHStack", async ({ initTestBed, page }) => {
    await initTestBed(`<CHStack testId="chstack"></CHStack>`);
    
    const chstack = page.getByTestId("chstack");
    await expect(chstack).toBeAttached();
    await expect(chstack).toBeEmpty();
  });

  test("ignores orientation property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <CHStack testId="chstack" orientation="vertical" width="200px" height="100px" backgroundColor="lightgray">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
      </CHStack>
    `);

    const chstack = page.getByTestId("chstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");

    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();

    // Get bounding boxes to verify still renders horizontally and centered despite orientation="vertical"
    const chstackBox = await chstack.boundingBox();
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();

    // Verify items are still stacked horizontally (orientation prop should be ignored)
    expect(item2Box!.x).toBeGreaterThan(item1Box!.x + item1Box!.width - 1);

    // Verify items are still vertically centered
    const chstackCenterY = chstackBox!.y + chstackBox!.height / 2;
    const item1CenterY = item1Box!.y + item1Box!.height / 2;
    expect(Math.abs(item1CenterY - chstackCenterY)).toBeLessThan(1);
  });
});
