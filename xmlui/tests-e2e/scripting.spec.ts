import { expect, test } from "../src/testing/fixtures";
//
// =================================================================
// The testes regarding overflow="scroll" are inside the stack tests
// =================================================================

test("Template literal", async ({ page, initTestBed }) => {
  await initTestBed('<Text testId="text0" value="see {`${1 + 2} kind`} horses"/>');

  await expect(page.getByTestId("text0")).toHaveText("see 3 kind horses");
});
