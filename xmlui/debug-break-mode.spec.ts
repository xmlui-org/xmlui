import { test, expect } from "./src/testing/fixtures";

test.describe("Debug Break Mode", () => {
  test('debug breakMode classes', async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <VStack>
        <Text testId="normal" breakMode="normal">Normal text</Text>
        <Text testId="word" breakMode="word">Word break text</Text>
        <Text testId="anywhere" breakMode="anywhere">Anywhere break text</Text>
        <Text testId="keep" breakMode="keep">Keep text</Text>
        <Text testId="hyphenate" breakMode="hyphenate">Hyphenate text</Text>
      </VStack>
    `);
    
    const normalDriver = await createTextDriver("normal");
    const wordDriver = await createTextDriver("word");
    const anywhereDriver = await createTextDriver("anywhere");
    const keepDriver = await createTextDriver("keep");
    const hyphenateDriver = await createTextDriver("hyphenate");
    
    // Check class names
    const normalClass = await normalDriver.component.getAttribute("class");
    const wordClass = await wordDriver.component.getAttribute("class");
    const anywhereClass = await anywhereDriver.component.getAttribute("class");
    const keepClass = await keepDriver.component.getAttribute("class");
    const hyphenateClass = await hyphenateDriver.component.getAttribute("class");
    
    console.log("Normal classes:", normalClass);
    console.log("Word classes:", wordClass);
    console.log("Anywhere classes:", anywhereClass);
    console.log("Keep classes:", keepClass);
    console.log("Hyphenate classes:", hyphenateClass);
    
    expect(normalClass).toContain("breakNormal");
    expect(wordClass).toContain("breakWord");
    expect(anywhereClass).toContain("breakAnywhere");
    expect(keepClass).toContain("breakKeep");
    expect(hyphenateClass).toContain("breakHyphenate");
  });
});
