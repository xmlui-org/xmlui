import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders items vertically", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="vstack">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
        <Stack testId="item3" height="32px" width="32px" backgroundColor="green" />
      </VStack>
    `);

    const vstack = page.getByTestId("vstack");
    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");
    const item3 = page.getByTestId("item3");

    await expect(vstack).toBeVisible();
    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();
    await expect(item3).toBeVisible();

    // Get bounding boxes to verify vertical layout
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();
    const item3Box = await item3.boundingBox();

    // Verify items are stacked vertically (item2 should be below item1, item3 below item2)
    expect(item2Box!.y).toBeGreaterThan(item1Box!.y + item1Box!.height - 1); // -1 for floating point tolerance
    expect(item3Box!.y).toBeGreaterThan(item2Box!.y + item2Box!.height - 1); // -1 for floating point tolerance

    // Verify items are horizontally aligned (should start at roughly the same x position)
    expect(Math.abs(item1Box!.x - item2Box!.x)).toBeLessThan(1);
    expect(Math.abs(item2Box!.x - item3Box!.x)).toBeLessThan(1);
  });

  test("renders empty VStack", async ({ initTestBed, page }) => {
    await initTestBed(`<VStack testId="vstack"></VStack>`);
    
    const vstack = page.getByTestId("vstack");
    await expect(vstack).toBeAttached();
    await expect(vstack).toBeEmpty();
  });

  test("ignores orientation property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack testId="vstack" orientation="horizontal">
        <Stack testId="item1" height="32px" width="32px" backgroundColor="red" />
        <Stack testId="item2" height="32px" width="32px" backgroundColor="blue" />
      </VStack>
    `);

    const item1 = page.getByTestId("item1");
    const item2 = page.getByTestId("item2");

    await expect(item1).toBeVisible();
    await expect(item2).toBeVisible();

    // Get bounding boxes to verify still renders vertically despite orientation="horizontal"
    const item1Box = await item1.boundingBox();
    const item2Box = await item2.boundingBox();

    // Verify items are still stacked vertically (orientation prop should be ignored)
    expect(item2Box!.y).toBeGreaterThan(item1Box!.y + item1Box!.height - 1);
  });
});
