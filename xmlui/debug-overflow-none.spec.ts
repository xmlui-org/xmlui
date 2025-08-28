import { test, expect } from "./src/testing/fixtures";

test.describe("Debug overflow behavior none", () => {
  test("check actual computed styles for none with maxLines", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowBehavior="none" maxLines="2">
        This is a long-long-long text that should be simply cut at the end of the second line.
      </Text>
    `);
    
    const driver = await createTextDriver("text");
    
    // Check computed styles
    const textOverflow = await driver.component.evaluate(el => getComputedStyle(el).textOverflow);
    const webkitLineClamp = await driver.component.evaluate(el => getComputedStyle(el)['-webkit-line-clamp' as any]);
    const display = await driver.component.evaluate(el => getComputedStyle(el).display);
    const whiteSpace = await driver.component.evaluate(el => getComputedStyle(el).whiteSpace);
    const maxHeight = await driver.component.evaluate(el => getComputedStyle(el).maxHeight);
    const lineHeight = await driver.component.evaluate(el => getComputedStyle(el).lineHeight);
    
    console.log("Computed styles:", {
      textOverflow,
      webkitLineClamp,
      display,
      whiteSpace,
      maxHeight,
      lineHeight
    });
    
    // Check if element has noEllipsis class
    const hasNoEllipsis = await driver.component.evaluate(el => el.classList.contains('_noEllipsis_136i6_324'));
    console.log("Has noEllipsis class:", hasNoEllipsis);
    
    // Check class list
    const classList = await driver.component.evaluate(el => Array.from(el.classList));
    console.log("Class list:", classList);
  });
});
