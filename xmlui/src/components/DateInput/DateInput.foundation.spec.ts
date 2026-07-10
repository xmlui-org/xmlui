import { expect, test } from "../../testing/fixtures";

test("clearable input keeps the same vertical sizing as the default input", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <DateInput testId="plain" initialValue="05/25/2024" />
      <DateInput testId="clearable" clearable="true" initialValue="05/25/2024" />
    </App>
  `);

  const plain = page.getByTestId("plain");
  const clearable = page.getByTestId("clearable");

  for (const input of [plain, clearable]) {
    await expect(input).toHaveCSS("padding-top", "8px");
    await expect(input).toHaveCSS("padding-bottom", "8px");
    await expect(input).toHaveCSS("gap", "8px");
    await expect(input).toHaveCSS("min-height", "40px");
    await expect(input).toHaveCSS("height", "40px");
  }
});
