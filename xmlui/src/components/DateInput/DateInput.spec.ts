import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic props", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });

  test("renders with initialValue", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders in disabled state when enabled is false", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" enabled="false" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toBeDisabled();
    await expect(driver.monthInput).toBeDisabled();
    await expect(driver.yearInput).toBeDisabled();
  });

  test("shows clear button when clearable is true", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).toBeVisible();
  });

  test("hides clear button when clearable is false", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="false" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("renders with required attribute", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" required="true" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("required", "");
    await expect(driver.monthInput).toHaveAttribute("required", "");
    await expect(driver.yearInput).toHaveAttribute("required", "");
  });
});

test.describe("dateFormat property", () => {
  test("renders all supported date formats correctly", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <DateInput testId="d0" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
        <DateInput testId="d1" dateFormat="yyyy-MM-dd" initialValue="2024-05-25" />
        <DateInput testId="d2" dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />
        <DateInput testId="d3" dateFormat="yyyyMMdd" initialValue="20240525" />
        <DateInput testId="d4" dateFormat="MMddyyyy" initialValue="05252024" />
        <DateInput testId="d5" dateFormat="MM-dd-yyyy" initialValue="05-25-2024" />
        <DateInput testId="d6" dateFormat="dd-MM-yyyy" initialValue="25-05-2024" />
        <DateInput testId="d7" dateFormat="yyyy/MM/dd" initialValue="2024/05/25" />
      </Fragment>
    `);
    // MM/dd/yyyy: 05/25/2024
    const d0 = await createDateInputDriver("d0");
    await expect(d0.monthInput).toHaveValue("05");
    await expect(d0.dayInput).toHaveValue("25");
    await expect(d0.yearInput).toHaveValue("2024");
    // yyyy-MM-dd: 2024-05-25
    const d1 = await createDateInputDriver("d1");
    await expect(d1.yearInput).toHaveValue("2024");
    await expect(d1.monthInput).toHaveValue("05");
    await expect(d1.dayInput).toHaveValue("25");
    // dd/MM/yyyy: 25/05/2024
    const d2 = await createDateInputDriver("d2");
    await expect(d2.dayInput).toHaveValue("25");
    await expect(d2.monthInput).toHaveValue("05");
    await expect(d2.yearInput).toHaveValue("2024");
    // yyyyMMdd: 20240525
    const d3 = await createDateInputDriver("d3");
    await expect(d3.yearInput).toHaveValue("2024");
    await expect(d3.monthInput).toHaveValue("05");
    await expect(d3.dayInput).toHaveValue("25");
    // MMddyyyy: 05252024
    const d4 = await createDateInputDriver("d4");
    await expect(d4.monthInput).toHaveValue("05");
    await expect(d4.dayInput).toHaveValue("25");
    await expect(d4.yearInput).toHaveValue("2024");
    // MM-dd-yyyy: 05-25-2024
    const d5 = await createDateInputDriver("d5");
    await expect(d5.monthInput).toHaveValue("05");
    await expect(d5.dayInput).toHaveValue("25");
    await expect(d5.yearInput).toHaveValue("2024");
    // dd-MM-yyyy: 25-05-2024
    const d6 = await createDateInputDriver("d6");
    await expect(d6.dayInput).toHaveValue("25");
    await expect(d6.monthInput).toHaveValue("05");
    await expect(d6.yearInput).toHaveValue("2024");
    // yyyy/MM/dd: 2024/05/25
    const d7 = await createDateInputDriver("d7");
    await expect(d7.yearInput).toHaveValue("2024");
    await expect(d7.monthInput).toHaveValue("05");
    await expect(d7.dayInput).toHaveValue("25");
  });
});

test.describe("initialValue property", () => {
  test("parses various valid date formats and ISO fallbacks", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <DateInput testId="iv0" initialValue="05/25/2024" />
        <DateInput testId="iv1" dateFormat="MM/dd/yyyy" initialValue="2023-08-30" />
        <DateInput testId="iv2" dateFormat="dd-MM-yyyy" initialValue="2023-12-25" />
        <DateInput testId="iv3" dateFormat="MM/dd/yyyy" initialValue="2024-02-29T10:30:00Z" />
        <DateInput testId="iv4" dateFormat="yyyyMMdd" initialValue="2024-02-29" />
        <DateInput testId="iv5" dateFormat="yyyy-MM-dd" initialValue="2023-08-30" />
      </Fragment>
    `);
    // parses valid date in default format
    const iv0 = await createDateInputDriver("iv0");
    await expect(iv0.monthInput).toHaveValue("05");
    await expect(iv0.dayInput).toHaveValue("25");
    await expect(iv0.yearInput).toHaveValue("2024");
    // falls back to ISO date parsing when format parsing fails (MM/dd/yyyy + ISO input)
    const iv1 = await createDateInputDriver("iv1");
    await expect(iv1.monthInput).toHaveValue("08");
    await expect(iv1.dayInput).toHaveValue("30");
    await expect(iv1.yearInput).toHaveValue("2023");
    // falls back to ISO date parsing with different dateFormat (dd-MM-yyyy + ISO input)
    const iv2 = await createDateInputDriver("iv2");
    await expect(iv2.dayInput).toHaveValue("25");
    await expect(iv2.monthInput).toHaveValue("12");
    await expect(iv2.yearInput).toHaveValue("2023");
    // handles various ISO date formats as fallback (with timestamp)
    const iv3 = await createDateInputDriver("iv3");
    await expect(iv3.monthInput).toHaveValue("02");
    await expect(iv3.dayInput).toHaveValue("29");
    await expect(iv3.yearInput).toHaveValue("2024");
    // handles leap year dates correctly via ISO fallback
    const iv4 = await createDateInputDriver("iv4");
    await expect(iv4.yearInput).toHaveValue("2024");
    await expect(iv4.monthInput).toHaveValue("02");
    await expect(iv4.dayInput).toHaveValue("29");
    // prioritizes format-specific parsing over ISO fallback (yyyy-MM-dd matches both)
    const iv5 = await createDateInputDriver("iv5");
    await expect(iv5.yearInput).toHaveValue("2023");
    await expect(iv5.monthInput).toHaveValue("08");
    await expect(iv5.dayInput).toHaveValue("30");
  });

  test("handles invalid and non-date initialValues gracefully", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <DateInput testId="bad0" initialValue="{null}" />
        <DateInput testId="bad1" initialValue="{undefined}" />
        <DateInput testId="bad2" initialValue="" />
        <DateInput testId="bad3" initialValue="invalid-date-string" />
        <DateInput testId="bad4" initialValue="{123456789}" />
        <DateInput testId="bad5" initialValue="{{}}" />
        <DateInput testId="bad6" initialValue="{true}" />
        <DateInput testId="bad7" initialValue="{false}" />
        <DateInput testId="bad8" initialValue="{[1, 2, 3]}" />
        <DateInput testId="bad9" initialValue="{() => '2024-01-01'}" />
        <DateInput testId="bad10" initialValue="{0}" />
        <DateInput testId="bad11" initialValue="{-123}" />
        <DateInput testId="bad12" initialValue="{123.456}" />
        <DateInput testId="bad13" initialValue="{NaN}" />
        <DateInput testId="bad14" initialValue="{Infinity}" />
        <DateInput testId="bad15" initialValue="{Date.now()}" />
        <DateInput testId="bad16" initialValue="{{year: 2024, month: 5, day: 25}}" />
      </Fragment>
    `);
    for (let i = 0; i <= 16; i++) {
      const driver = await createDateInputDriver(`bad${i}`);
      await expect(driver.monthInput).toHaveValue("");
      await expect(driver.dayInput).toHaveValue("");
      await expect(driver.yearInput).toHaveValue("");
    }
  });
});

test.describe("Validation", () => {
  [
    { value: "", prop: "" },
    { value: "--warning", prop: 'validationStatus="warning"' },
    { value: "--error", prop: 'validationStatus="error"' },
    { value: "--success", prop: 'validationStatus="valid"' },
  ].forEach((variant) => {
    test(`applies correct borderRadius ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-DateInput${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-DateInput${variant.value}`]: "rgb(255, 0, 0)" },
      });
    await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-DateInput${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-DateInput${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-DateInput${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-DateInput${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-DateInput${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-DateInput${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-DateInput${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-DateInput${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-DateInput${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<DateInput testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-DateInput${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
  });
});

test.describe("autoFocus property", () => {
  test("focuses component when autoFocus is true", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" autoFocus="true" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toBeFocused();
  });

  test("does not focus when autoFocus is false", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" autoFocus="false" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).not.toBeFocused();
    await expect(driver.monthInput).not.toBeFocused();
    await expect(driver.yearInput).not.toBeFocused();
  });
});

test.describe("emptyCharacter property", () => {
  test("uses default '--' placeholder when no emptyCharacter is specified", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "--");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "--");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "----");
  });

  test("uses custom emptyCharacter for placeholders", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="*" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "**");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "**");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "****");
  });

  test("uses first character when emptyCharacter is multi-character", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="abc" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "aa");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "aa");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "aaaa");
  });

  test("defaults to dash when emptyCharacter is empty string", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "--");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "--");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "----");
  });

  test("handles null emptyCharacter", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="{null}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "--");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "--");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "----");
  });

  test("handles undefined emptyCharacter", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="{undefined}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "--");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "--");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "----");
  });

  test("works with special characters", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="@" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "@@");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "@@");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "@@@@");
  });

  test("works with unicode characters", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" emptyCharacter="📅" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("placeholder", "📅📅");
    await expect(driver.monthInput).toHaveAttribute("placeholder", "📅📅");
    await expect(driver.yearInput).toHaveAttribute("placeholder", "📅📅📅📅");
  });
});

test.describe("mode property", () => {
  test("renders in single date mode by default", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    // Single mode should show one set of date inputs
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });

  test("renders in single date mode when explicitly set", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" mode="single" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });

  test("renders in range mode when set to range", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" mode="range" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    // Range mode should show date inputs for start and end dates
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });
});

test.describe("minValue and maxValue properties", () => {
  test("accepts valid date within range", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" minValue="2024-01-01" maxValue="2024-12-31" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("works with only minValue set", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" minValue="2024-01-01" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("works with only maxValue set", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" maxValue="2024-12-31" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });
});

test.describe("clearable properties", () => {
  test("shows clear button when clearable is true and has value", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).toBeVisible();
  });

  test("clear button is not visible when clearable is false", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="false" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("uses custom clear icon when specified", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" clearIcon="close" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).toBeVisible();
  });

  test("clearToInitialValue controls clear behavior", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" clearToInitialValue="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.clearButton).toBeVisible();
  });
});

test.describe("startText, startIcon, endText, endIcon properties", () => {
  test("renders start text", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" startText="From:" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toContainText("From:");
  });

  test("renders start icon", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" startIcon="trash" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component.getByRole("img")).toBeVisible();
  });

  test("renders end text", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" endText="To:" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toContainText("To:");
  });

  test("renders end icon", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" endIcon="phone" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component.getByRole("img")).toBeVisible();
  });
});

test.describe("User Interactions", () => {
  test("allows typing in day input", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await driver.dayInput.focus();
    await driver.dayInput.fill("25");
    await expect(driver.dayInput).toHaveValue("25");
  });

  test("allows typing in month input", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await driver.monthInput.focus();
    await driver.monthInput.fill("05");
    await expect(driver.monthInput).toHaveValue("05");
  });

  test("allows typing in year input", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await driver.yearInput.focus();
    await driver.yearInput.fill("2024");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("clears input when clear button is clicked (clearToInitialValue is true)", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" clearToInitialValue="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
    await driver.dayInput.fill("18");

    await driver.clearButton.click();

    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("clears input when clear button is clicked (clearToInitialValue is false)", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" initialValue="05/25/2024" clearToInitialValue="false" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
    await driver.dayInput.fill("18");

    await driver.clearButton.click();

    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("navigates between inputs with Tab key", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible(); // Wait for all inputs to be rendered
    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.dayInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.yearInput).toBeFocused();
  });

  test("navigates between inputs with arrow keys", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible(); // Wait for all inputs to be rendered
    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(driver.dayInput).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(driver.yearInput).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(driver.dayInput).toBeFocused();
  });
});

test.describe("Event Handling", () => {
  test("fires didChange event when value changes", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onDidChange="testState = 'changed'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await driver.monthInput.fill("05");
    await driver.dayInput.fill("25");
    await driver.yearInput.fill("2024");

    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("fires gotFocus event when input receives focus", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onGotFocus="testState = 'focused'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await driver.dayInput.focus();

    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("fires gotFocus event when label receives focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onGotFocus="testState = 'focused'" label="test" />`,
    );

    await page.getByText("test").click();

    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("fires lostFocus event when input loses focus", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onLostFocus="testState = 'blurred'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toBeVisible(); // Wait for input to be rendered
    await driver.dayInput.focus();
    await expect(driver.dayInput).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Move focus away from all inputs

    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("preserves field values when date combination becomes invalid", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="01/30/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    // Verify initial state
    await expect(driver.monthInput).toHaveValue("01");
    await expect(driver.dayInput).toHaveValue("30");
    await expect(driver.yearInput).toHaveValue("2024");

    // Change month from 01 to 02, making Feb 30th which is invalid
    await driver.monthInput.focus();
    await driver.monthInput.fill("02");

    // Month should be updated to 02
    await expect(driver.monthInput).toHaveValue("02");

    // Day should preserve the invalid value "30" instead of being normalized or cleared
    // This is the key fix - invalid date combinations preserve the field values
    await expect(driver.dayInput).toHaveValue("30");
    await expect(driver.yearInput).toHaveValue("2024");

    // The day field should also be marked as invalid visually
    await expect(driver.dayInput).toHaveClass(/invalid/);
  });

  test("does not clear all fields when invalid date is entered", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");

    // Create a scenario where the complete date would be invalid
    await driver.monthInput.fill("13"); // Invalid month
    await driver.dayInput.fill("25");
    await driver.yearInput.fill("2024");

    // Tab to trigger validation
    await expect(driver.yearInput).toBeFocused(); // Wait for year input focus after filling
    await page.keyboard.press("Tab");

    // Month should be normalized (13 % 10 = 3)
    await expect(driver.monthInput).toHaveValue("03");
    // Day and year should be preserved
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");

    // The important thing is that we don't get all empty fields
  });
});

test.describe("API Methods", () => {
  test("focus() method focuses the date input", async ({ initTestBed, createDateInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" />
        <Button onClick="dateInput.focus(); testState = 'focused'" />
      </Fragment>
    `);
    const driver = await createDateInputDriver("dateInput");

    await driver.component.page().getByRole("button").click();

    await expect.poll(testStateDriver.testState).toEqual("focused");
    await expect(driver.monthInput).toBeFocused();
  });

  test("setValue() method sets the date value", async ({ initTestBed, createDateInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" />
        <Button onClick="dateInput.setValue('05/25/2024'); testState = 'set'" />
      </Fragment>
    `);
    const driver = await createDateInputDriver("dateInput");

    await driver.component.page().getByRole("button").click();

    await expect.poll(testStateDriver.testState).toEqual("set");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("bindTo syncs $data and value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <DateInput id="boundDateInput" bindTo="dateValue" />
        <Button testId="setBtn" onClick="boundDateInput.setValue('05/25/2024')" />
        <Text testId="dataValue">{$data.dateValue}</Text>
        <Text testId="compValue">{boundDateInput.value}</Text>
      </Form>
    `);

    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("dataValue")).toHaveText("05/25/2024");
    await expect(page.getByTestId("compValue")).toHaveText("05/25/2024");
  });

  test("value getter returns current date value", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" initialValue="05/25/2024" />
        <Button onClick="testState = dateInput.value" />
      </Fragment>
    `);
    const driver = await createDateInputDriver("dateInput");

    await driver.component.page().getByRole("button").click();

    await expect.poll(testStateDriver.testState).toEqual("05/25/2024");
  });

  test("setValue() method clears date when empty string provided", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" initialValue="05/25/2024" />
        <Button onClick="dateInput.setValue(''); testState = 'cleared'" />
      </Fragment>
    `);
    const driver = await createDateInputDriver("dateInput");

    await driver.component.page().getByRole("button").click();

    await expect.poll(testStateDriver.testState).toEqual("cleared");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("isoValue() method returns null when no date is set", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe(null);
  });

  test("isoValue() method returns ISO format for complete date", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" initialValue="05/25/2024" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("2024-05-25");
  });

  test("isoValue() method handles different date formats correctly", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("2024-05-25");
  });

  test("isoValue() method returns null for incomplete date", async ({
    initTestBed,
    page,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    const driver = await createDateInputDriver("dateInput");

    // Set only month and day, leave year empty
    await driver.monthInput.fill("05");
    await driver.dayInput.fill("25");

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe(null);
  });

  test("isoValue() method returns null for invalid date", async ({
    initTestBed,
    page,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" testId="dateInput" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    const driver = await createDateInputDriver("dateInput");

    // Set invalid date (February 30th)
    await driver.monthInput.fill("02");
    await driver.dayInput.fill("30");
    await driver.yearInput.fill("2024");

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe(null);
  });

  test("isoValue() method updates when date is changed programmatically", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" initialValue="05/25/2024" />
        <Button testId="setDateBtn" onClick="dateInput.setValue('12/31/2023')" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    // Change the date programmatically
    await page.getByTestId("setDateBtn").click();

    // Get the ISO value
    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("2023-12-31");
  });

  test("isoValue() method handles leap year correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" initialValue="02/29/2024" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("2024-02-29");
  });

  test("isoValue() method handles edge dates correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" initialValue="01/01/1900" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("1900-01-01");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct accessibility attributes", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" label="Birth Date" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toHaveRole("textbox");
    await expect(driver.monthInput).toHaveRole("textbox");
    await expect(driver.yearInput).toHaveRole("textbox");
  });

  test("supports keyboard navigation", async ({ initTestBed, createDateInputDriver, page }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible(); // Wait for all inputs to be rendered
    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.dayInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.yearInput).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(driver.dayInput).toBeFocused();
  });

  test("has proper aria-label when label is provided", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" label="Birth Date" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.component.locator("label")).toBeVisible();
    await expect(driver.component.locator("label")).toHaveText("Birth Date");
  });

  test("supports screen reader announcements for validation", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" validationStatus="error" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.component).toHaveAttribute("data-validation-status", "error");
  });

  test("clear button has accessible role and label", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" clearable="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.clearButton).toHaveRole("button");
    await expect(driver.clearButton).toBeVisible();
  });

  test("inputs have correct input types", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toHaveAttribute("type", "text");
    await expect(driver.monthInput).toHaveAttribute("type", "text");
    await expect(driver.yearInput).toHaveAttribute("type", "text");
  });

  test("supports required attribute for accessibility", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" required="true" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toHaveAttribute("required", "");
    await expect(driver.monthInput).toHaveAttribute("required", "");
    await expect(driver.yearInput).toHaveAttribute("required", "");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("component renders with theme variables", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`
      <DateInput
        testId="dateInput"
        style="--color-divider: red; --width-input: 100px; --backgroundColor-input-invalid: rgb(255, 200, 200);"
      />
    `);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });

  test("component renders with clearable and theme variables", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`
      <DateInput
        testId="dateInput"
        clearable="{true}"
        style="--padding-button: 15px; --outlineColor-button--focused: green;"
      />
    `);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.clearButton).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.dayInput).toBeVisible();
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.yearInput).toBeVisible();
  });

  test("handles null initialValue", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{null}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles undefined initialValue", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{undefined}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles invalid date format gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="invalid-date" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles very long text values", async ({ initTestBed, createDateInputDriver }) => {
    const longText = "a".repeat(1000);
    await initTestBed(`<DateInput testId="dateInput" placeholder="${longText}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles extreme minValue and maxValue", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" minValue="1900-01-01" maxValue="2100-12-31" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles negative numbers in input fields", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await driver.dayInput.fill("-5");
    await driver.monthInput.fill("-1");
    await driver.yearInput.fill("-2024");

    // Component should handle invalid input gracefully
    await expect(driver.component).toBeVisible();
  });

  test("handles very large numbers in input fields", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await driver.dayInput.fill("99999");
    await driver.monthInput.fill("99999");
    await driver.yearInput.fill("99999");

    // Component should handle invalid input gracefully
    await expect(driver.component).toBeVisible();
  });

  test("handles special characters in input fields", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await driver.dayInput.fill("@#$");
    await driver.monthInput.fill("!%^");
    await driver.yearInput.fill("&*()");

    // Component should handle invalid input gracefully
    await expect(driver.component).toBeVisible();
  });

  test("handles object value passed to string property", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" placeholder="{{}}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles rapid consecutive value changes", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onDidChange="testState = (testState || 0) + 1" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await driver.monthInput.fill("01");
    await driver.monthInput.fill("02");
    await driver.monthInput.fill("03");

    // Should handle rapid changes
    await expect.poll(testStateDriver.testState).toBeGreaterThan(0);
  });

  test("maintains focus during validation errors", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" />`);
    const driver = await createDateInputDriver("dateInput");

    await driver.monthInput.focus();
    await driver.monthInput.fill("13"); // Invalid month

    // Focus should be maintained even with validation error
    await expect(driver.monthInput).toBeFocused();
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<DateInput width="200px" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<DateInput width="200px" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test").locator('[data-part-id="labeledItem"]');
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<DateInput width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<DateInput width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test").locator('[data-part-id="labeledItem"]');
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// =============================================================================
// BEHAVIOR TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" tooltip="Tooltip text" />`);

    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "borderColor-DateInput-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("can select part: 'day'", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" />`);
    const dayPart = page.getByTestId("test").locator("[data-part-id='day']");
    await expect(dayPart).toBeVisible();
  });

  test("can select part: 'month'", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" />`);
    const monthPart = page.getByTestId("test").locator("[data-part-id='month']");
    await expect(monthPart).toBeVisible();
  });

  test("can select part: 'year'", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" />`);
    const yearPart = page.getByTestId("test").locator("[data-part-id='year']");
    await expect(yearPart).toBeVisible();
  });

  test("can select part: 'clearButton' when clearable", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" clearable="true" />`);
    const clearButton = page.getByTestId("test").locator("[data-part-id='clearButton']");
    await expect(clearButton).toBeVisible();
  });

  test("clearButton part is not present without clearable prop", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" />`);
    const clearButton = page.getByTestId("test").locator("[data-part-id='clearButton']");
    await expect(clearButton).not.toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DateInput testId="test" tooltip="Tooltip text" clearable="true" />
    `);
    
    const component = page.getByTestId("test");
    const dayPart = component.locator("[data-part-id='day']");
    const monthPart = component.locator("[data-part-id='month']");
    const yearPart = component.locator("[data-part-id='year']");
    const clearButton = component.locator("[data-part-id='clearButton']");
    const tooltip = page.getByRole("tooltip");
    
    await component.hover();
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
    await expect(dayPart).toBeVisible();
    await expect(monthPart).toBeVisible();
    await expect(yearPart).toBeVisible();
    await expect(clearButton).toBeVisible();
  });

  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DateInput testId="test" variant="CustomVariant" clearable="true" />
    `, {
      testThemeVars: {
        "borderColor-DateInput-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const dayPart = component.locator("[data-part-id='day']");
    const monthPart = component.locator("[data-part-id='month']");
    const yearPart = component.locator("[data-part-id='year']");
    const clearButton = component.locator("[data-part-id='clearButton']");
    
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(dayPart).toBeVisible();
    await expect(monthPart).toBeVisible();
    await expect(yearPart).toBeVisible();
    await expect(clearButton).toBeVisible();
  });

  test("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "borderColor-DateInput-CustomVariant": "rgb(255, 0, 0)",
      },
    });

    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" tooltipMarkdown="**Bold text**" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`<DateInput testId="test" tooltip="Tooltip text" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DateInput 
        testId="test" 
        tooltip="Tooltip text" 
        variant="CustomVariant"
        clearable="true"
        animation="fadeIn"
      />
    `, {
      testThemeVars: {
        "borderColor-DateInput-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const dayPart = component.locator("[data-part-id='day']");
    const monthPart = component.locator("[data-part-id='month']");
    const yearPart = component.locator("[data-part-id='year']");
    const clearButton = component.locator("[data-part-id='clearButton']");
    
    // Verify variant applied
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    
    // Verify parts are visible
    await expect(dayPart).toBeVisible();
    await expect(monthPart).toBeVisible();
    await expect(yearPart).toBeVisible();
    await expect(clearButton).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});


// =============================================================================
// VALIDATION FEEDBACK TESTS
// =============================================================================

test.describe("Validation Feedback", () => {
  test("shows helper text and no icon when verboseValidationFeedback is true (default)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DateInput testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    
    // Trigger validation by submitting empty required field
    await page.getByTestId("submit").click();
    
    // Check for helper text
    await expect(page.getByText("This field is required")).toBeVisible();
    
    // Check absence of concise feedback icon
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).not.toBeVisible();
  });

  test("shows icon and no helper text when verboseValidationFeedback is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DateInput testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    
    // Trigger validation
    await page.getByTestId("submit").click();
    
    // Check for helper text (should be hidden)
    await expect(page.getByText("This field is required")).not.toBeVisible();
    
    // Check for concise feedback icon
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();
    
    // Check that it shows error icon
    await expect(conciseFeedback.locator("[data-icon-name='error']")).toBeVisible();
  });

  test("prop on component overrides form default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DateInput testId="input" bindTo="input" verboseValidationFeedback="{false}" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    
    await page.getByTestId("submit").click();
    
    // Helper text hidden
    await expect(page.getByText("This field is required")).not.toBeVisible();
    
    // Concise feedback visible
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();
  });

  test("shows valid icon in concise mode when valid", async ({ initTestBed, page, createDateInputDriver }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DateInput testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    
    const driver = await createDateInputDriver("input");
    
    // First make it invalid
    await page.getByTestId("submit").click();
    
    // Now make it valid
    await driver.monthInput.fill("10");
    await driver.dayInput.fill("10");
    await driver.yearInput.fill("2023");
    await driver.yearInput.blur();
    
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();
    await expect(conciseFeedback.locator("[data-icon-name='checkmark']")).toBeVisible();
  });

  test("concise mode tooltip shows error message on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DateInput testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    
    await page.getByTestId("submit").click();
    
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    // Hover over the icon
    await conciseFeedback.hover();
    
    // Check tooltip content
    const tooltip = page.locator("[data-tooltip-container]");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("This field is required");
  });

  test("does not duplicate label when inside Form with label prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <DateInput
          testId="test"
          label="Enter date"
          labelPosition="top"
        />
      </Form>
    `);

    // Should only have one label with the text "Enter date"
    const labels = page.getByText("Enter date");
    await expect(labels).toHaveCount(1);
  });
});

// =============================================================================
// KEYBOARD BEHAVIOR: CURSOR POSITION
// =============================================================================

test.describe("Keyboard behavior: cursor position", () => {
  test("inputs use left text alignment", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toBeVisible();
    await expect(driver.monthInput).toHaveCSS("text-align", "left");
    await expect(driver.dayInput).toHaveCSS("text-align", "left");
    await expect(driver.yearInput).toHaveCSS("text-align", "left");
  });
});

// =============================================================================
// KEYBOARD BEHAVIOR: BACKSPACE NAVIGATION
// =============================================================================

test.describe("Keyboard behavior: Backspace navigation", () => {
  test("Backspace on an empty field moves focus to the previous field", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();
    await expect(driver.dayInput).toBeVisible();

    // day is empty — Backspace should move focus back to month
    await driver.dayInput.focus();
    await expect(driver.dayInput).toBeFocused();
    await page.keyboard.press("Backspace");
    await expect(driver.monthInput).toBeFocused();
  });

  test("Backspace clears field content first, then navigates when field becomes empty", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toBeVisible();

    // Focus selects all text in the field ("25")
    await driver.dayInput.focus();
    await expect(driver.dayInput).toBeFocused();

    // First Backspace deletes selected "25" → ""
    await page.keyboard.press("Backspace");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.dayInput).toBeFocused();

    // Second Backspace on empty field → moves to month
    await page.keyboard.press("Backspace");
    await expect(driver.monthInput).toBeFocused();
  });

  test("Backspace from year navigates to day on empty", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.yearInput).toBeVisible();

    await driver.yearInput.focus();
    await expect(driver.yearInput).toBeFocused();

    // Backspace clears the selected "2024"
    await page.keyboard.press("Backspace");
    await expect(driver.yearInput).toHaveValue("");
    await expect(driver.yearInput).toBeFocused();

    // Backspace on empty year → moves to day (previous in MM/dd/yyyy order)
    await page.keyboard.press("Backspace");
    await expect(driver.dayInput).toBeFocused();
  });

  test("can delete the entire date field by field using Backspace", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.yearInput).toBeVisible();

    // Start from year
    await driver.yearInput.focus();
    await expect(driver.yearInput).toBeFocused();

    // Clear year, navigate to day
    await page.keyboard.press("Backspace");
    await expect(driver.yearInput).toHaveValue("");
    await page.keyboard.press("Backspace");
    await expect(driver.dayInput).toBeFocused();

    // Clear day, navigate to month
    await page.keyboard.press("Backspace");
    await expect(driver.dayInput).toHaveValue("");
    await page.keyboard.press("Backspace");
    await expect(driver.monthInput).toBeFocused();

    // Clear month
    await page.keyboard.press("Backspace");
    await expect(driver.monthInput).toHaveValue("");
  });
});

// =============================================================================
// KEYBOARD BEHAVIOR: CTRL+A / CMD+A SELECT ALL
// =============================================================================

test.describe("Keyboard behavior: Ctrl+A select all", () => {
  test("Ctrl+A focuses the first input field", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.yearInput).toBeVisible();

    // Start from year (last field)
    await driver.yearInput.focus();
    await expect(driver.yearInput).toBeFocused();

    // Ctrl+A should jump focus to the first field (month in MM/dd/yyyy)
    await page.keyboard.press("ControlOrMeta+a");
    await expect(driver.monthInput).toBeFocused();
  });

  test("Ctrl+A followed by Backspace clears all fields at once", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();

    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace");

    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("Ctrl+A followed by Delete clears all fields at once", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.dayInput).toBeVisible();

    await driver.dayInput.focus();
    await expect(driver.dayInput).toBeFocused();

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");

    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("Ctrl+A then Ctrl+C copies the full formatted date value to the clipboard", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const { clipboard } = await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();

    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("ControlOrMeta+c");

    const clipboardText = await clipboard.read();
    expect(clipboardText).toBe("05/25/2024");
  });

  test("typing after Ctrl+A exits select-all mode", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");

    await expect(driver.monthInput).toBeVisible();

    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("ControlOrMeta+a");
    // Typing a digit after Ctrl+A should not clear all fields
    await page.keyboard.press("3");

    // Day and year should remain untouched
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });
});
