import { expect, test } from "../../testing/fixtures";

test("default border radius falls back through Input radius", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox testId="checkbox" />`);
  await expect(page.getByTestId("checkbox")).toHaveCSS("border-radius", "4px");
});

test("validation border radius falls back to base checkbox radius", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox testId="checkbox" validationStatus="error" />`);
  await expect(page.getByTestId("checkbox")).toHaveCSS("border-radius", "4px");
});

test("mouse click focus does not show focus-visible outline", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox testId="checkbox" />`, {
    testThemeVars: {
      "outlineWidth-Checkbox": "3px",
    },
  });
  const checkbox = page.getByTestId("checkbox");
  await checkbox.click();
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveCSS("outline-width", "0px");
});

test("keyboard focus shows focus-visible outline", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox testId="checkbox" />`, {
    testThemeVars: {
      "outlineWidth-Checkbox": "3px",
    },
  });
  const checkbox = page.getByTestId("checkbox");
  await page.keyboard.press("Tab");
  await expect(checkbox).toBeFocused();
  await expect(checkbox).toHaveCSS("outline-width", "3px");
});

test("surrounding font size does not resize checkbox control", async ({ initTestBed, page }) => {
  await initTestBed(`<VStack fontSize="40px"><Checkbox testId="checkbox" label="Large label" /></VStack>`);
  const box = await page.getByTestId("checkbox").getByRole("checkbox").boundingBox();
  expect(box?.width).toBeGreaterThan(15);
  expect(box?.width).toBeLessThan(17);
  expect(box?.height).toBeGreaterThan(15);
  expect(box?.height).toBeLessThan(17);
});

test("default label position stays above compact checkbox input", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox testId="checkbox" label="Default label" initialValue="true" />`);
  const metrics = await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="checkbox"]');
    const label = Array.from(document.querySelectorAll<HTMLElement>("*"))
      .find((element) => element.childElementCount === 0 && element.textContent?.trim() === "Default label");
    const inputBox = input?.getBoundingClientRect();
    const labelBox = label?.getBoundingClientRect();
    return {
      inputWidth: inputBox?.width,
      inputTop: inputBox?.top,
      labelBottom: labelBox?.bottom,
    };
  });
  expect(metrics.inputWidth).toBeGreaterThan(15);
  expect(metrics.inputWidth).toBeLessThan(17);
  expect(metrics.labelBottom).toBeLessThan(metrics.inputTop ?? 0);
});
