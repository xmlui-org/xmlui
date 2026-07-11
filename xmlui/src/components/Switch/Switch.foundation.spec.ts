import { expect, test } from "../../testing/fixtures";

test("default label position uses FormItem top label styling", async ({ initTestBed, page }) => {
  await initTestBed(`<Switch testId="switch" label="Enable Timer" initialValue="true" />`);
  const metrics = await page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[role="switch"]');
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>("label"))
      .filter((element) => element.textContent?.trim() === "Enable Timer");
    const label = labels[0];
    const inputBox = input?.getBoundingClientRect();
    const labelBox = label?.getBoundingClientRect();
    const labelStyle = label ? getComputedStyle(label) : undefined;
    return {
      labelCount: labels.length,
      inputLeft: inputBox?.left,
      inputTop: inputBox?.top,
      labelLeft: labelBox?.left,
      labelBottom: labelBox?.bottom,
      fontSize: labelStyle?.fontSize,
      fontWeight: labelStyle?.fontWeight,
    };
  });

  expect(metrics.labelCount).toBe(1);
  expect(metrics.labelBottom).toBeLessThan(metrics.inputTop ?? 0);
  expect(metrics.labelLeft).toBe(metrics.inputLeft);
  expect(metrics.fontSize).toBe("14px");
  expect(metrics.fontWeight).toBe("500");
});
