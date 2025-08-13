import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders without props", async ({ initTestBed, page }) => {
    await initTestBed(`<SpaceFiller/>`);
    const spaceFiller = page.getByTestId("test-id-component");
    
    // SpaceFiller exists in DOM but may not be "visible" due to zero dimensions
    await expect(spaceFiller).toBeAttached();
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller).toHaveCSS("place-self", "stretch");
  });

  test("renders in HStack and pushes subsequent elements to the end", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <Stack width="36px" height="36px" backgroundColor="red" testId="red-box"/>
        <SpaceFiller testId="spacer"/>
        <Stack width="36px" height="36px" backgroundColor="blue" testId="blue-box"/>
      </HStack>
    `);
    
    const redBox = page.getByTestId("red-box");
    const blueBox = page.getByTestId("blue-box");
    const spaceFiller = page.getByTestId("spacer");
    
    await expect(spaceFiller).toBeAttached();
    await expect(redBox).toBeVisible();
    await expect(blueBox).toBeVisible();
    
    // Verify the spaceFiller has flex properties
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller).toHaveCSS("place-self", "stretch");
  });

  test("renders in VStack and pushes subsequent elements to the end", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <Stack width="36px" height="36px" backgroundColor="red" testId="red-box"/>
        <SpaceFiller testId="spacer"/>
        <Stack width="36px" height="36px" backgroundColor="blue" testId="blue-box"/>
      </VStack>
    `);
    
    const redBox = page.getByTestId("red-box");
    const blueBox = page.getByTestId("blue-box");
    const spaceFiller = page.getByTestId("spacer");
    
    await expect(spaceFiller).toBeAttached();
    await expect(redBox).toBeVisible();
    await expect(blueBox).toBeVisible();
    
    // Verify the spaceFiller has flex properties
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller).toHaveCSS("place-self", "stretch");
  });

  test("acts as line break in FlowLayout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <FlowLayout>
        <Stack width="20%" height="36px" backgroundColor="red" testId="red-box"/>
        <SpaceFiller/>
        <Stack width="20%" height="36px" backgroundColor="green" testId="green-box"/>
        <Stack width="20%" height="36px" backgroundColor="blue" testId="blue-box"/>
      </FlowLayout>
    `);
    
    const redBox = page.getByTestId("red-box");
    const greenBox = page.getByTestId("green-box");
    const blueBox = page.getByTestId("blue-box");
    
    await expect(redBox).toBeVisible();
    await expect(greenBox).toBeVisible();
    await expect(blueBox).toBeVisible();
    
    // Get bounding rectangles to verify line break behavior
    const redRect = await redBox.boundingBox();
    const greenRect = await greenBox.boundingBox();
    const blueRect = await blueBox.boundingBox();
    
    // Red box should be on the first line
    // Green and blue boxes should be on the second line (lower y position)
    // The SpaceFiller should cause a line break between red and green/blue
    expect(redRect).not.toBeNull();
    expect(greenRect).not.toBeNull();
    expect(blueRect).not.toBeNull();
    
    // Green and blue boxes should be on a different (lower) line than red
    expect(greenRect!.y).toBeGreaterThan(redRect!.y);
    expect(blueRect!.y).toBeGreaterThan(redRect!.y);
    
    // Green and blue should be on the same line (similar y coordinates)
    expect(Math.abs(greenRect!.y - blueRect!.y)).toBeLessThan(5);
  });

  test("multiple SpaceFillers distribute space evenly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <Stack width="36px" height="36px" backgroundColor="red" testId="red-box"/>
        <SpaceFiller testId="spacer1"/>
        <Stack width="36px" height="36px" backgroundColor="green" testId="green-box"/>
        <SpaceFiller testId="spacer2"/>
        <Stack width="36px" height="36px" backgroundColor="blue" testId="blue-box"/>
      </HStack>
    `);
    
    const redBox = page.getByTestId("red-box");
    const greenBox = page.getByTestId("green-box");
    const blueBox = page.getByTestId("blue-box");
    const spaceFiller1 = page.getByTestId("spacer1");
    const spaceFiller2 = page.getByTestId("spacer2");
    
    await expect(spaceFiller1).toBeVisible();
    await expect(spaceFiller2).toBeVisible();
    await expect(redBox).toBeVisible();
    await expect(greenBox).toBeVisible();
    await expect(blueBox).toBeVisible();
    
    // Both SpaceFillers should have the same flex properties
    await expect(spaceFiller1).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller2).toHaveCSS("flex", "1 1 0px");
  });

  test("ignores layout properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <SpaceFiller testId="spacer" width="100px" height="100px" backgroundColor="red" padding="20px"/>
      </HStack>
    `);
    
    const spaceFiller = page.getByTestId("spacer");
    await expect(spaceFiller).toBeAttached();
    
    // SpaceFiller should not apply any styling properties
    await expect(spaceFiller).not.toHaveCSS("width", "100px");
    await expect(spaceFiller).not.toHaveCSS("height", "100px");
    await expect(spaceFiller).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(spaceFiller).not.toHaveCSS("padding", "20px");
    
    // But it should still have its core flex properties
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("renders correctly when nested in multiple containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <HStack>
          <Stack width="36px" height="36px" backgroundColor="red"/>
          <SpaceFiller testId="spacer1"/>
          <Stack width="36px" height="36px" backgroundColor="blue"/>
        </HStack>
        <SpaceFiller testId="spacer2"/>
        <HStack>
          <Stack width="36px" height="36px" backgroundColor="green"/>
        </HStack>
      </VStack>
    `);
    
    const spaceFiller1 = page.getByTestId("spacer1");
    const spaceFiller2 = page.getByTestId("spacer2");
    
    await expect(spaceFiller1).toBeAttached();
    await expect(spaceFiller2).toBeAttached();
    
    // Both should have the correct CSS properties
    await expect(spaceFiller1).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller2).toHaveCSS("flex", "1 1 0px");
  });

  test("works in containers with no other children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack>
        <SpaceFiller testId="spacer"/>
      </HStack>
    `);
    
    const spaceFiller = page.getByTestId("spacer");
    await expect(spaceFiller).toBeAttached();
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller).toHaveCSS("place-self", "stretch");
  });

  test("handles container with different alignment settings", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack justifyContent="center" alignItems="flex-end">
        <Stack width="36px" height="36px" backgroundColor="red"/>
        <SpaceFiller testId="spacer"/>
        <Stack width="36px" height="36px" backgroundColor="blue"/>
      </HStack>
    `);
    
    const spaceFiller = page.getByTestId("spacer");
    await expect(spaceFiller).toBeAttached();
    
    // SpaceFiller should maintain its flex properties regardless of parent alignment
    await expect(spaceFiller).toHaveCSS("flex", "1 1 0px");
    await expect(spaceFiller).toHaveCSS("place-self", "stretch");
  });
});
