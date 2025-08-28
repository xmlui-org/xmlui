import { test } from "./src/testing/fixtures";

test('debug none behavior height precision', async ({ initTestBed, createTextDriver }) => {
  await initTestBed(`
    <VStack>
      <Text testId="singleLine" width="200px" overflowBehavior="none" maxLines="1">
        This is a long-long-long text that should be cut at one line.
      </Text>
      <Text testId="twoLines" width="200px" overflowBehavior="none" maxLines="2">
        This is a long-long-long text that should be simply cut at the end of the second line without any ellipsis.
      </Text>
      <Text testId="threeLines" width="200px" overflowBehavior="none" maxLines="3">
        This is a long-long-long text that should be simply cut at the end of the third line without any ellipsis and should definitely wrap to multiple lines.
      </Text>
    </VStack>
  `);
  
  const singleLineDriver = await createTextDriver("singleLine");
  const twoLinesDriver = await createTextDriver("twoLines");
  const threeLinesDriver = await createTextDriver("threeLines");
  
  // Get heights
  const singleHeight = await singleLineDriver.component.boundingBox().then(box => box?.height || 0);
  const twoHeight = await twoLinesDriver.component.boundingBox().then(box => box?.height || 0);
  const threeHeight = await threeLinesDriver.component.boundingBox().then(box => box?.height || 0);
  
  console.log("Heights:", { singleHeight, twoHeight, threeHeight });
  
  // Check that heights are proportional (approximately)
  const tolerance = 5; // 5px tolerance
  console.log("Two lines should be ~2x single line:", twoHeight, "vs", singleHeight * 2);
  console.log("Three lines should be ~3x single line:", threeHeight, "vs", singleHeight * 3);
  
  // Verify maxHeight styles
  const twoLinesMaxHeight = await twoLinesDriver.component.evaluate(el => getComputedStyle(el).maxHeight);
  const threeLinesMaxHeight = await threeLinesDriver.component.evaluate(el => getComputedStyle(el).maxHeight);
  
  console.log("Max heights:", { twoLinesMaxHeight, threeLinesMaxHeight });
});
