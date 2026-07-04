import { expect, test } from "../../testing/fixtures";

test.describe("DateInput - compatibility", () => {
  test("validation states use original border colors", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DateInput testId="valid" validationStatus="valid" initialValue="05/25/2024" />
      <DateInput testId="warning" validationStatus="warning" initialValue="05/25/2024" />
      <DateInput testId="error" validationStatus="error" initialValue="05/25/2024" />
    `);

    await expect(page.getByTestId("valid")).toHaveCSS("border-top-color", "rgb(86, 211, 106)");
    await expect(page.getByTestId("warning")).toHaveCSS("border-top-color", "rgb(218, 127, 0)");
    await expect(page.getByTestId("error")).toHaveCSS("border-top-color", "rgb(245, 0, 16)");
  });

  test("disabled input uses original surface colors", async ({ initTestBed, page }) => {
    await initTestBed(`<DateInput testId="disabled" enabled="false" initialValue="05/25/2024" />`);

    const input = page.getByTestId("disabled");

    await expect(input).toHaveCSS("border-top-color", "rgb(199, 214, 225)");
    await expect(input).toHaveCSS("background-color", "rgb(248, 250, 251)");
    await expect(input).toHaveCSS("color", "rgb(96, 140, 170)");
    await expect(input).toHaveCSS("opacity", "1");
  });

  test("emptyCharacter placeholders use the original placeholder color", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <DateInput testId="dots" emptyCharacter="." />
      <DateInput testId="stars" emptyCharacter="*" />
      <DateInput testId="word" emptyCharacter="abc" />
    `);

    const dots = await createDateInputDriver("dots");
    const stars = await createDateInputDriver("stars");
    const word = await createDateInputDriver("word");

    await expect(dots.monthInput).toHaveAttribute("placeholder", "..");
    await expect(stars.monthInput).toHaveAttribute("placeholder", "**");
    await expect(word.monthInput).toHaveAttribute("placeholder", "aa");

    for (const input of [dots.monthInput, stars.monthInput, word.monthInput]) {
      const placeholderColor = await input.evaluate((element: HTMLInputElement) => {
        return window.getComputedStyle(element, "::placeholder").color;
      });
      expect(placeholderColor).toBe("rgb(156, 163, 175)");
    }
  });

  test("clearToInitialValue stays independent across adjacent clearable DateInputs", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <DateInput
        testId="reset-to-initial"
        clearable="true"
        clearToInitialValue="true"
        initialValue="05/25/2024"
      />
      <DateInput
        testId="clear-to-empty"
        clearable="true"
        clearToInitialValue="false"
        initialValue="05/25/2024"
      />
    `);

    const resetToInitial = await createDateInputDriver("reset-to-initial");
    const clearToEmpty = await createDateInputDriver("clear-to-empty");

    await resetToInitial.clearButton.click();
    await clearToEmpty.clearButton.click();

    await expect(resetToInitial.monthInput).toHaveValue("05");
    await expect(resetToInitial.dayInput).toHaveValue("25");
    await expect(resetToInitial.yearInput).toHaveValue("2024");

    await expect(clearToEmpty.monthInput).toHaveValue("");
    await expect(clearToEmpty.dayInput).toHaveValue("");
    await expect(clearToEmpty.yearInput).toHaveValue("");
  });
});
