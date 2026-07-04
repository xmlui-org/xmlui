import { expect, test } from "../../testing/fixtures";

test.describe("DatePicker - compatibility", () => {
  test("disabled input uses original surface colors", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" enabled="false" />`);

    const control = page.getByTestId("dp").locator('[data-part="control"]');
    await expect(control).toHaveCSS("background-color", "rgb(248, 250, 251)");
    await expect(control).toHaveCSS("color", "rgb(96, 140, 170)");
    await expect(control).toHaveCSS("border-top-color", "rgb(199, 214, 225)");

    const themeVars = await control.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        datePickerBackgroundDisabled: styles
          .getPropertyValue("--xmlui-backgroundColor-DatePicker--disabled")
          .trim(),
        datePickerBorderDisabled: styles
          .getPropertyValue("--xmlui-borderColor-DatePicker--disabled")
          .trim(),
        globalBorderDisabled: styles.getPropertyValue("--xmlui-borderColor--disabled").trim(),
        datePickerTextDisabled: styles
          .getPropertyValue("--xmlui-textColor-DatePicker--disabled")
          .trim(),
        globalTextDisabled: styles.getPropertyValue("--xmlui-textColor--disabled").trim(),
      };
    });

    expect(themeVars.datePickerBackgroundDisabled).toBe("hsl(204, 30.3%, 98%)");
    expect(themeVars.datePickerBorderDisabled).toBe(themeVars.globalBorderDisabled);
    expect(themeVars.datePickerBorderDisabled).toBe("hsl(204, 30.3%, 83%)");
    expect(themeVars.datePickerTextDisabled).toBe(themeVars.globalTextDisabled);
    expect(themeVars.datePickerTextDisabled).toBe("hsl(204, 30.3%, 52%)");
  });

  test("validation states use original border colors", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DatePicker testId="dp-none" />
      <DatePicker testId="dp-valid" validationStatus="valid" />
      <DatePicker testId="dp-warning" validationStatus="warning" />
      <DatePicker testId="dp-error" validationStatus="error" />
    `);

    const borderCases = [
      ["dp-none", "rgb(199, 214, 225)"],
      ["dp-valid", "rgb(86, 211, 106)"],
      ["dp-warning", "rgb(218, 127, 0)"],
      ["dp-error", "rgb(245, 0, 16)"],
    ] as const;

    for (const [testId, expectedColor] of borderCases) {
      await expect(page.getByTestId(testId).locator('[data-part="control"]')).toHaveCSS(
        "border-top-color",
        expectedColor,
      );
    }
  });
});
