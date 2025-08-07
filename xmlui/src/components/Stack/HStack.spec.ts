import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items horizontally", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="hstack">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
        <Stack testId="item3" height="32px" width="32px" backgroundColor="green" />
      </HStack>
    `);

    const hstack = page.getByTestId("hstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");
    const item3 = page.getByTestId("item3");

    await expect(hstack).toBeVisible();
    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();
    await expect(item3).toBeVisible();

    // Get bounding boxes to verify horizontal layout
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();
    const item3Box = await item3.boundingBox();

    // Verify items are stacked horizontally (item2 should be to the right of item1, item3 to the right of item2)
    expect(item2Box!.x).toBeGreaterThan(item1Box!.x + item1Box!.width - 1); // -1 for floating point tolerance
    expect(item3Box!.x).toBeGreaterThan(item2Box!.x + item2Box!.width - 1); // -1 for floating point tolerance

    // Verify items are vertically aligned (should start at roughly the same y position)
    expect(Math.abs(item1Box!.y - item2Box!.y)).toBeLessThan(1);
    expect(Math.abs(item2Box!.y - item3Box!.y)).toBeLessThan(1);
  });

  test("renders empty HStack", async ({ initTestBed, page }) => {
    await initTestBed(`<HStack testId="hstack"></HStack>`);
    
    const hstack = page.getByTestId("hstack");
    await expect(hstack).toBeAttached();
    await expect(hstack).toBeEmpty();
  });

  test("ignores orientation property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="hstack" orientation="vertical">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
      </HStack>
    `);

    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");

    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();

    // Get bounding boxes to verify still renders horizontally despite orientation="vertical"
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();

    // Verify items are still stacked horizontally (orientation prop should be ignored)
    expect(item2Box!.x).toBeGreaterThan(item1Box!.x + item1Box!.width - 1);
  });
});
