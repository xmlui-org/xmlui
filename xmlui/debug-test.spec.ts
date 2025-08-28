import { test } from "./src/testing/fixtures";

test('debug none white-space', async ({ initTestBed, createTextDriver }) => {
  await initTestBed(`
    <Text testId="text" width="200px" overflowBehavior="none" maxLines="2">
      This is a long-long-long text that should be simply cut at the end of the second line without any ellipsis or other overflow indicator.
    </Text>
  `);
  const driver = await createTextDriver("text");
  
  // Check what values our none test actually gets
  console.log("white-space:", await driver.component.evaluate(el => getComputedStyle(el).whiteSpace));
  console.log("text-overflow:", await driver.component.evaluate(el => getComputedStyle(el).textOverflow));
  console.log("-webkit-line-clamp:", await driver.component.evaluate(el => getComputedStyle(el).webkitLineClamp));
  console.log("display:", await driver.component.evaluate(el => getComputedStyle(el).display));
  console.log("overflow:", await driver.component.evaluate(el => getComputedStyle(el).overflow));
});
