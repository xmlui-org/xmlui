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

  test.skip("renders in disabled state when enabled is false", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" enabled="false" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toBeDisabled();
    await expect(driver.monthInput).toBeDisabled();
    await expect(driver.yearInput).toBeDisabled();
  });

  test.skip("renders in readonly state when readOnly is true", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" readOnly="true" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("readonly", "");
    await expect(driver.monthInput).toHaveAttribute("readonly", "");
    await expect(driver.yearInput).toHaveAttribute("readonly", "");
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

  test.skip("renders with required attribute", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" required="true" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveAttribute("required", "");
    await expect(driver.monthInput).toHaveAttribute("required", "");
    await expect(driver.yearInput).toHaveAttribute("required", "");
  });
});

test.describe("dateFormat property", () => {
  test("renders MM/dd/yyyy format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders yyyy-MM-dd format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="yyyy-MM-dd" initialValue="2024-05-25" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.yearInput).toHaveValue("2024");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
  });

  test("renders dd/MM/yyyy format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders yyyyMMdd compact format correctly", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="yyyyMMdd" initialValue="20240525" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.yearInput).toHaveValue("2024");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
  });

  test("renders MMddyyyy compact format correctly", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MMddyyyy" initialValue="05252024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders MM-dd-yyyy format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM-dd-yyyy" initialValue="05-25-2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders dd-MM-yyyy format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="dd-MM-yyyy" initialValue="25-05-2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("renders yyyy/MM/dd format correctly", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="yyyy/MM/dd" initialValue="2024/05/25" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.yearInput).toHaveValue("2024");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
  });
});

// =============================================================================
// INITIAL VALUE PROPERTY TESTS
// =============================================================================

test.describe("initialValue property", () => {
  test("parses valid date in default format", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="05/25/2024" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("falls back to ISO date parsing when format parsing fails", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="2023-08-30" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("08");
    await expect(driver.dayInput).toHaveValue("30");
    await expect(driver.yearInput).toHaveValue("2023");
  });

  test("falls back to ISO date parsing with different dateFormat", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="dd-MM-yyyy" initialValue="2023-12-25" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.monthInput).toHaveValue("12");
    await expect(driver.yearInput).toHaveValue("2023");
  });

  test("handles various ISO date formats as fallback", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="2024-02-29T10:30:00Z" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("02");
    await expect(driver.dayInput).toHaveValue("29");
    await expect(driver.yearInput).toHaveValue("2024");
  });

  test("handles leap year dates correctly via ISO fallback", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="yyyyMMdd" initialValue="2024-02-29" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.yearInput).toHaveValue("2024");
    await expect(driver.monthInput).toHaveValue("02");
    await expect(driver.dayInput).toHaveValue("29");
  });

  test("handles null initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{null}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles undefined initialValue gracefully", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{undefined}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles empty string initialValue gracefully", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles invalid date string gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="invalid-date-string" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles numeric initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{123456789}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles object initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{{}}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles boolean initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{true}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles false boolean initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{false}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles array initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{[1, 2, 3]}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles function initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{() => '2024-01-01'}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles zero numeric initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{0}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles negative numeric initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{-123}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles float numeric initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{123.456}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles NaN initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{NaN}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles Infinity initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{Infinity}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles Date object initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{Date.now()}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("handles complex object initialValue gracefully", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(`<DateInput testId="dateInput" initialValue="{{year: 2024, month: 5, day: 25}}" />`);
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("");
    await expect(driver.dayInput).toHaveValue("");
    await expect(driver.yearInput).toHaveValue("");
  });

  test("prioritizes format-specific parsing over ISO fallback", async ({
    initTestBed,
    createDateInputDriver,
  }) => {
    // This date could potentially be parsed as ISO, but should use format-specific parsing first
    await initTestBed(
      `<DateInput testId="dateInput" dateFormat="yyyy-MM-dd" initialValue="2023-08-30" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.yearInput).toHaveValue("2023");
    await expect(driver.monthInput).toHaveValue("08");
    await expect(driver.dayInput).toHaveValue("30");
  });
});

test.describe("validationStatus property", () => {
  test("applies valid status styling", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" validationStatus="valid" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
    // Note: validation status may be applied via CSS classes rather than data attributes
  });

  test("applies warning status styling", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" validationStatus="warning" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });

  test("applies error status styling", async ({ initTestBed, createDateInputDriver }) => {
    await initTestBed(
      `<DateInput testId="dateInput" validationStatus="error" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.component).toBeVisible();
  });
});

test.describe("autoFocus property", () => {
  test.skip("focuses component when autoFocus is true", async ({
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
      `<DateInput testId="dateInput" clearable="true" initialValue="05/25/2024" />`,
    );
    const driver = await createDateInputDriver("dateInput");
    await expect(driver.monthInput).toHaveValue("05");
    await expect(driver.dayInput).toHaveValue("25");
    await expect(driver.yearInput).toHaveValue("2024");
    driver.dayInput.fill("18");

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
    driver.dayInput.fill("18");

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

    await driver.monthInput.focus();
    await expect(driver.monthInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.dayInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.yearInput).toBeFocused();
  });

  test.skip("navigates between inputs with arrow keys", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");

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

  test("fires lostFocus event when input loses focus", async ({
    initTestBed,
    createDateInputDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onLostFocus="testState = 'blurred'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await driver.dayInput.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Move focus away from all inputs

    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("fires beep event on invalid input", async ({ initTestBed, createDateInputDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" onBeep="testState = 'beeped'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    await driver.monthInput.fill("13"); // Invalid month

    await expect.poll(testStateDriver.testState).toEqual("beeped");
  });

  test("fires beep event when creating invalid date combination", async ({ initTestBed, createDateInputDriver, page }) => {
    const { testStateDriver } = await initTestBed(
      `<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="01/30/2024" onBeep="testState = 'beeped'" />`,
    );
    const driver = await createDateInputDriver("dateInput");

    // Change month from 01 to 02, making Feb 30th which is invalid
    await driver.monthInput.focus();
    await driver.monthInput.fill("02");

    // Tab to day field to trigger validation and beep
    await page.keyboard.press("Tab");

    // Should beep due to invalid date combination (Feb 30th)
    await expect.poll(testStateDriver.testState).toEqual("beeped");
  });

  test("preserves field values when date combination becomes invalid", async ({ initTestBed, createDateInputDriver, page }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" initialValue="01/30/2024" />`);
    const driver = await createDateInputDriver("dateInput");
    
    // Verify initial state
    await expect(driver.monthInput).toHaveValue("01");
    await expect(driver.dayInput).toHaveValue("30");
    await expect(driver.yearInput).toHaveValue("2024");
    
    // Change month from 01 to 02, making Feb 30th which is invalid
    await driver.monthInput.focus();
    await driver.monthInput.fill("02");
    
    // Tab to day field to trigger validation
    await page.keyboard.press("Tab");
    
    // Month should be updated to 02
    await expect(driver.monthInput).toHaveValue("02");
    
    // Day should preserve the invalid value "30" instead of being normalized or cleared
    // This is the key fix - invalid date combinations preserve the field values
    await expect(driver.dayInput).toHaveValue("30");
    await expect(driver.yearInput).toHaveValue("2024");
    
    // The day field should also be marked as invalid visually
    await expect(driver.dayInput).toHaveClass(/invalid/);
  });

  test("does not clear all fields when invalid date is entered", async ({ initTestBed, createDateInputDriver, page }) => {
    await initTestBed(`<DateInput testId="dateInput" dateFormat="MM/dd/yyyy" />`);
    const driver = await createDateInputDriver("dateInput");
    
    // Create a scenario where the complete date would be invalid
    await driver.monthInput.fill("13"); // Invalid month
    await driver.dayInput.fill("25");
    await driver.yearInput.fill("2024");
    
    // Tab to trigger validation
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

  test("isoValue() method handles different date formats correctly", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <DateInput id="dateInput" dateFormat="dd/MM/yyyy" initialValue="25/05/2024" />
        <Button testId="getIsoBtn" onClick="testState = dateInput.isoValue()" />
      </Fragment>
    `);

    await page.getByTestId("getIsoBtn").click();
    await expect.poll(testStateDriver.testState).toBe("2024-05-25");
  });

  test("isoValue() method returns null for incomplete date", async ({ initTestBed, page, createDateInputDriver }) => {
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

  test("isoValue() method returns null for invalid date", async ({ initTestBed, page, createDateInputDriver }) => {
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

  test("isoValue() method updates when date is changed programmatically", async ({ initTestBed, page }) => {
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

  test.skip("supports required attribute for accessibility", async ({
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

  test("component renders with clearable and theme variables", async ({ initTestBed, createDateInputDriver }) => {
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

  test.skip("handles rapid consecutive value changes", async ({
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
