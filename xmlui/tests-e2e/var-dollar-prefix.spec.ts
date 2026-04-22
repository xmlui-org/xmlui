import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// E2E tests: reactive variable names cannot start with '$'
// The '$' prefix is reserved for context variables.
// =============================================================================

test.describe("var.* attribute — $ prefix is rejected", () => {
  test("var.$name raises T032 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(`<App var.$dummy="World"><Text testId="t">{$dummy}</Text></App>`),
    ).rejects.toThrow("T032");
  });

  test("var.name without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(`<App var.dummy="World"><Text testId="t">{dummy}</Text></App>`);
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});

test.describe("<variable> tag — $ prefix is rejected", () => {
  test("<variable name='$name'> raises T032 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(
        `<App><variable name="$dummy" value="World"/><Text testId="t">{$dummy}</Text></App>`,
      ),
    ).rejects.toThrow("T032");
  });

  test("<variable name='name'> without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App><variable name="dummy" value="World"/><Text testId="t">{dummy}</Text></App>`,
    );
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});

test.describe("global.* attribute — $ prefix is rejected", () => {
  test("global.$name raises T032 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(
        `<App global.$dummy="World"><Text testId="t">{$dummy}</Text></App>`,
        { noFragmentWrapper: true },
      ),
    ).rejects.toThrow("T032");
  });

  test("global.name without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App global.dummy="World"><Text testId="t">{dummy}</Text></App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});

test.describe("<global> tag — $ prefix is rejected", () => {
  test("<global name='$name'> raises T032 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(
        `<App><global name="$dummy" value="World"/><Text testId="t">{$dummy}</Text></App>`,
        { noFragmentWrapper: true },
      ),
    ).rejects.toThrow("T032");
  });

  test("<global name='name'> without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App><global name="dummy" value="World"/><Text testId="t">{dummy}</Text></App>`,
      { noFragmentWrapper: true },
    );
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});

test.describe("<script> tag reactive var — $ prefix is rejected (W031)", () => {
  test("var $name in <script> tag raises W031 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(
        `<App><script>var $dummy = "World";</script><Text testId="t">{$dummy}</Text></App>`,
      ),
    ).rejects.toThrow("W031");
  });

  test("var name in <script> tag without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(
      `<App><script>var dummy = "World";</script><Text testId="t">{dummy}</Text></App>`,
    );
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});

test.describe("code-behind (globalsXs) reactive var — $ prefix is rejected (W031)", () => {
  test("var $name in globalsXs raises W031 error", async ({ initTestBed }) => {
    await expect(
      initTestBed(`<App><Text testId="t">{$dummy}</Text></App>`, {
        globalsXs: `var $dummy = "World";`,
      }),
    ).rejects.toThrow("W031");
  });

  test("var name in globalsXs without $ works normally", async ({ initTestBed, page }) => {
    await initTestBed(`<App><Text testId="t">{dummy}</Text></App>`, {
      globalsXs: `var dummy = "World";`,
    });
    await expect(page.getByTestId("t")).toHaveText("World");
  });
});
