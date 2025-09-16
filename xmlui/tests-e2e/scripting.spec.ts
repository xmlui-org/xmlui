import { expect, test } from "../src/testing/fixtures";
import { initApp } from "../src/testing/themed-app-test-helpers";

// =================================================================
// The testes regarding overflow="scroll" are inside the stack tests
// =================================================================

test("Template literal", async ({ page }) => {
  const entryPoint = '<Text testId="text0" value="see {`${1 + 2} kind`} horses"/>';

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("text0")).toHaveText("see 3 kind horses",);
});

