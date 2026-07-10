import { expect, test } from "../../testing/fixtures";

test("default padding and min-height match the original input contract", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <TimeInput testId="plain" initialValue="11:30" />
      <TimeInput testId="clearable" clearable="true" initialValue="10:20" />
    </App>
  `);

  const plain = page.getByTestId("plain");
  const clearable = page.getByTestId("clearable");

  for (const input of [plain, clearable]) {
    await expect(input).toHaveCSS("padding-top", "8px");
    await expect(input).toHaveCSS("padding-right", "8px");
    await expect(input).toHaveCSS("padding-bottom", "8px");
    await expect(input).toHaveCSS("padding-left", "8px");
    await expect(input).toHaveCSS("gap", "8px");
    await expect(input).toHaveCSS("min-height", "40px");
  }

  await expect(plain).toHaveCSS("height", "40px");
  await expect(clearable).toHaveCSS("height", "40px");
});
