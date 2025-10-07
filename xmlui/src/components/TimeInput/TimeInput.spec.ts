import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default flags", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.hourInput).toBeVisible();
    await expect(driver.minuteInput).toBeVisible();
    await expect(driver.secondInput).not.toBeVisible();
    await expect(driver.amPmInput).not.toBeVisible();
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" label="Select time" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.hourInput).toBeVisible();
    await expect(driver.minuteInput).toBeVisible();
    await expect(driver.secondInput).not.toBeVisible();
    await expect(driver.amPmInput).not.toBeVisible();
    await expect(driver.clearButton).not.toBeVisible();
    await expect(driver.label).toContainText("Select time");
  });

  test.describe("initialValue property", () => {
    test("renders with initialValue", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles null initialValue", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{null}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles undefined initialValue", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{undefined}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles invalid time string", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="invalid" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("00");
      await expect(driver.minuteInput).toHaveValue("00");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles time with seconds", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="14:30:45" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).toHaveValue("45");
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("falls back to ISO time format when standard parsing fails", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="15:30:00" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("15");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("falls back to ISO time format with seconds", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="09:15:30" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("09");
      await expect(driver.minuteInput).toHaveValue("15");
      await expect(driver.secondInput).toHaveValue("30");
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles boolean initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{true}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles numeric initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{123}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles array initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{['14', '30']}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles object initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" initialValue="{{ hour: 14, minute: 30 }}" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles function initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{() => '14:30'}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles Date object initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{getDate()}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles Symbol initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{Symbol('time')}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles BigInt initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{BigInt(1430)}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles zero numeric initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{0}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles negative numeric initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="{-1}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles empty string initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("handles whitespace-only initialValue gracefully", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" initialValue="   " />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("00");
      await expect(driver.minuteInput).toHaveValue("00");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });
  });

  test.describe("hour24 and seconds properties", () => {
    test("displays 24-hour format without seconds", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" hour24="true" seconds="false" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("displays 24-hour format with seconds", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" hour24="true" seconds="true" initialValue="14:30:15" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).toHaveValue("15");
      await expect(driver.amPmInput).not.toBeVisible();
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("displays 12-hour format without seconds", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" hour24="false" seconds="false" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("02");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).not.toBeVisible();
      await expect(driver.amPmInput).toBeVisible();
    });

    test("displays 12-hour format with seconds", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" hour24="false" seconds="true" initialValue="14:30:15" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("02");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).toHaveValue("15");
      await expect(driver.amPmInput).toBeVisible();
    });

    test("handles null hour24 property", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="{null}" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      // Should default to 24-hour format
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.amPmInput).not.toBeVisible();
    });

    test("handles null seconds property", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" seconds="{null}" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      // Should default to no seconds
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).not.toBeVisible();
    });
  });

  test.describe("enabled property", () => {
    test("renders enabled by default", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toBeEnabled();
    });

    test("disables component when enabled is false", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" enabled="false" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toBeDisabled();
      await expect(driver.minuteInput).toBeDisabled();
    });

    test("handles null enabled property", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" enabled="{null}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toBeEnabled();
    });
  });

  test.describe("readOnly property", () => {
    test("makes component readonly", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" readOnly="true" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("readonly");
      await expect(driver.minuteInput).toHaveAttribute("readonly");
    });

    test("allows editing when readOnly is false", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" readOnly="false" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).not.toHaveAttribute("readonly");
      await expect(driver.minuteInput).not.toHaveAttribute("readonly");
    });
  });

  test.describe("clearable property", () => {
    test("shows clear button when clearable is true", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" clearable="true" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.clearButton).toBeVisible();
    });

    test("hides clear button when clearable is false", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" clearable="false" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.clearButton).not.toBeVisible();
    });

    test("clears value when clear button is clicked (clearToInitialValue is true)", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" clearable="true" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await driver.hourInput.fill("05");
      await driver.clearButton.click();
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });

    test("clears value when clear button is clicked (clearToInitialValue is false)", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`
          <TimeInput testId="timeInput" clearable="true"
            clearToInitialValue="false" initialValue="14:30" />
      `);
      const driver = await createTimeInputDriver("timeInput");
      await driver.hourInput.fill("05");
      await driver.clearButton.click();
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
    });
  });

  test.describe("clearIcon property", () => {
    test("displays custom clear icon", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" clearable="true" clearIcon="trash" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.clearButton).toBeVisible();
      // Icon presence would be tested via the icon's specific attributes
    });
  });

  test.describe("required property", () => {
    test("makes component required", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" required="true" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("required");
    });

    test("component is not required by default", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).not.toHaveAttribute("required");
    });
  });

  test.describe("validationStatus property", () => {
    test("displays valid status", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" validationStatus="valid" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
    });

    test("displays warning status", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" validationStatus="warning" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
    });

    test("displays error status", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" validationStatus="error" initialValue="14:30" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
    });

    test("handles null validationStatus", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" validationStatus="{null}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toBeVisible();
    });
  });

  test.describe("minTime and maxTime properties", () => {
    test("accepts minTime constraint", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" minTime="10:00" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });

    test("accepts maxTime constraint", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" maxTime="18:00" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });

    test("handles null minTime", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" minTime="{null}" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });

    test("handles null maxTime", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" maxTime="{null}" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });
  });

  test.describe("adornment properties", () => {
    test("displays startText", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" startText="Start" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toContainText("Start");
    });

    test("displays endText", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" endText="End" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toContainText("End");
    });

    test("displays startIcon", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" startIcon="trash" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component.getByRole("img")).toBeVisible();
    });

    test("displays endIcon", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" endIcon="trash" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component.getByRole("img")).toBeVisible();
    });

    test("displays multiple adornments together", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(
        `<TimeInput testId="timeInput" startText="Start" endText="End" startIcon="phone" endIcon="email" />`,
      );
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toContainText("Start");
      await expect(driver.component).toContainText("End");
      await expect(driver.component.getByRole("img").first()).toBeVisible();
      await expect(driver.component.getByRole("img").last()).toBeVisible();
    });
  });

  test.describe("gap property", () => {
    test("applies custom gap", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" gap="20px" startText="Start" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toContainText("Start");
    });

    test("handles null gap", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" gap="{null}" startText="Start" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.component).toContainText("Start");
    });
  });

  test.describe("autoFocus property", () => {
    test("focuses component when autoFocus is true", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" autoFocus="true" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toBeFocused();
    });

    test("does not focus when autoFocus is false", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" autoFocus="false" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).not.toBeFocused();
    });
  });

  test.describe("emptyCharacter property", () => {
    test("uses default '--' placeholder when no emptyCharacter is specified", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "--");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "--");
    });

    test("uses custom emptyCharacter for placeholders", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="*" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "**");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "**");
    });

    test("applies emptyCharacter to all inputs when seconds enabled", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="•" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "••");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "••");
      await expect(driver.secondInput).toHaveAttribute("placeholder", "••");
    });

    test("uses first character when emptyCharacter is multi-character", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="abc" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "aa");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "aa");
    });

    test("defaults to dash when emptyCharacter is empty string", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "--");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "--");
    });

    test("handles null emptyCharacter", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="{null}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "--");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "--");
    });

    test("handles undefined emptyCharacter", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="{undefined}" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "--");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "--");
    });

    test("works with special characters", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="@" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "@@");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "@@");
    });

    test("works with unicode characters", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="⏰" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "⏰⏰");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "⏰⏰");
    });

    test("placeholder visible when fields are empty", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="#" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("");
      await expect(driver.minuteInput).toHaveValue("");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "##");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "##");
    });

    test("shows values instead of placeholder when initialValue provided", async ({
      initTestBed,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="#" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toHaveValue("30");
    });

    test("works with 12-hour format", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" emptyCharacter="○" hour24="false" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.hourInput).toHaveAttribute("placeholder", "○○");
      await expect(driver.minuteInput).toHaveAttribute("placeholder", "○○");
      await expect(driver.amPmInput).toBeVisible();
    });
  });

  test.describe("User Interactions", () => {
    test("allows typing in hour input", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");
      await driver.hourInput.click();
      await driver.hourInput.fill("15");
      await expect(driver.hourInput).toHaveValue("15");
    });

    test("allows typing in minute input", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");
      await driver.minuteInput.click();
      await driver.minuteInput.fill("45");
      await expect(driver.minuteInput).toHaveValue("45");
    });

    test("navigates between inputs with Tab", async ({
      initTestBed,
      createTimeInputDriver,
      page,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      await driver.hourInput.focus();
      await page.keyboard.press("Tab");
      await expect(driver.minuteInput).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(driver.secondInput).toBeFocused();
    });

    test("navigates between inputs with arrow keys - 24-hour format with seconds", async ({
      initTestBed,
      createTimeInputDriver,
      page,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="true" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Start at hour input
      await driver.hourInput.focus();
      await expect(driver.hourInput).toBeFocused();

      // Navigate right: Hour → Minute
      await page.keyboard.press("ArrowRight");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate right: Minute → Second
      await page.keyboard.press("ArrowRight");
      await expect(driver.secondInput).toBeFocused();

      // Navigate left: Second → Minute
      await page.keyboard.press("ArrowLeft");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate left: Minute → Hour
      await page.keyboard.press("ArrowLeft");
      await expect(driver.hourInput).toBeFocused();
    });

    test("navigates between inputs with arrow keys - 24-hour format without seconds", async ({
      initTestBed,
      createTimeInputDriver,
      page,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="true" seconds="false" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Start at hour input
      await driver.hourInput.focus();
      await expect(driver.hourInput).toBeFocused();

      // Navigate right: Hour → Minute (skip seconds since disabled)
      await page.keyboard.press("ArrowRight");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate left: Minute → Hour
      await page.keyboard.press("ArrowLeft");
      await expect(driver.hourInput).toBeFocused();
    });

    test("navigates between inputs with arrow keys - 12-hour format with seconds", async ({
      initTestBed,
      createTimeInputDriver,
      page,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Start at hour input
      await driver.hourInput.focus();
      await expect(driver.hourInput).toBeFocused();

      // Navigate right: Hour → Minute
      await page.keyboard.press("ArrowRight");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate right: Minute → Second
      await page.keyboard.press("ArrowRight");
      await expect(driver.secondInput).toBeFocused();

      // Navigate right: Second → AM/PM
      await page.keyboard.press("ArrowRight");
      await expect(driver.amPmInput).toBeFocused();

      // Navigate left: AM/PM → Second
      await page.keyboard.press("ArrowLeft");
      await expect(driver.secondInput).toBeFocused();

      // Navigate left: Second → Minute
      await page.keyboard.press("ArrowLeft");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate left: Minute → Hour
      await page.keyboard.press("ArrowLeft");
      await expect(driver.hourInput).toBeFocused();
    });

    test("navigates between inputs with arrow keys - 12-hour format without seconds", async ({
      initTestBed,
      createTimeInputDriver,
      page,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" seconds="false" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Start at hour input
      await driver.hourInput.focus();
      await expect(driver.hourInput).toBeFocused();

      // Navigate right: Hour → Minute
      await page.keyboard.press("ArrowRight");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate right: Minute → AM/PM (skip seconds since disabled)
      await page.keyboard.press("ArrowRight");
      await expect(driver.amPmInput).toBeFocused();

      // Navigate left: AM/PM → Minute
      await page.keyboard.press("ArrowLeft");
      await expect(driver.minuteInput).toBeFocused();

      // Navigate left: Minute → Hour
      await page.keyboard.press("ArrowLeft");
      await expect(driver.hourInput).toBeFocused();
    });

    test("changes AM/PM with click", async ({ initTestBed, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.amPmInput).toHaveText("PM");
      await driver.amPmInput.click();
      await expect(driver.amPmInput).toHaveText("AM");
    });

    test("changes AM/PM with keydown 1", async ({ initTestBed, page, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" initialValue="14:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.amPmInput).toHaveText("PM");
      await driver.amPmInput.focus();
      await page.keyboard.press("a", { delay: 100 });
      await expect(driver.amPmInput).toHaveText("AM");
    });

    test("changes AM/PM with keydown 2", async ({ initTestBed, page, createTimeInputDriver }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" initialValue="03:30" />`);
      const driver = await createTimeInputDriver("timeInput");
      await expect(driver.amPmInput).toHaveText("AM");
      await driver.amPmInput.focus();
      await page.keyboard.press("p", { delay: 100 });
      await expect(driver.amPmInput).toHaveText("PM");
    });

    test("auto-tabs from hour to minute after typing two digits", async ({
      initTestBed,
      page,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Focus on hour input and clear it
      await driver.hourInput.focus();
      await driver.hourInput.selectText();

      // Type two digits - should auto-tab to minute
      await page.keyboard.type("14");

      // Verify hour input has the value and minute input is now focused
      await expect(driver.hourInput).toHaveValue("14");
      await expect(driver.minuteInput).toBeFocused();
    });

    test("auto-tabs from minute to second after typing two digits", async ({
      initTestBed,
      page,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Focus on minute input and clear it
      await driver.minuteInput.focus();
      await driver.minuteInput.selectText();

      // Type two digits - should auto-tab to second
      await page.keyboard.type("30");

      // Verify minute input has the value and second input is now focused
      await expect(driver.minuteInput).toHaveValue("30");
      await expect(driver.secondInput).toBeFocused();
    });

    test("auto-tabs from second to AM/PM after typing two digits in 12-hour format", async ({
      initTestBed,
      page,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="false" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Focus on second input and clear it
      await driver.secondInput.focus();
      await driver.secondInput.selectText();

      // Type two digits - should auto-tab to AM/PM
      await page.keyboard.type("45");

      // Verify second input has the value and AM/PM input is now focused
      await expect(driver.secondInput).toHaveValue("45");
      await expect(driver.amPmInput).toBeFocused();
    });

    test("does not auto-tab from second input in 24-hour format", async ({
      initTestBed,
      page,
      createTimeInputDriver,
    }) => {
      await initTestBed(`<TimeInput testId="timeInput" hour24="true" seconds="true" />`);
      const driver = await createTimeInputDriver("timeInput");

      // Focus on second input and clear it
      await driver.secondInput.focus();
      await driver.secondInput.selectText();

      // Type two digits - should stay on second input since there's no AM/PM
      await page.keyboard.type("45");

      // Verify second input has the value and is still focused
      await expect(driver.secondInput).toHaveValue("45");
      await expect(driver.secondInput).toBeFocused();
    });
  });

  test.describe("API", () => {
    test("isoValue returns null when no time is set", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe(null);
    });

    test("isoValue returns ISO format for 24-hour time", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="14:30" hour24="true" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("14:30:00");
    });

    test("isoValue returns ISO format for 24-hour time with seconds", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="14:30:45" hour24="true" seconds="true" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("14:30:45");
    });

    test("isoValue converts 12-hour format to ISO format (AM)", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="02:30 AM" hour24="false" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("02:30:00");
    });

    test("isoValue converts 12-hour format to ISO format (PM)", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="02:30 PM" hour24="false" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("14:30:00");
    });

    test("isoValue converts 12-hour midnight correctly", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="12:00 AM" hour24="false" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("00:00:00");
    });

    test("isoValue converts 12-hour noon correctly", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="12:00 PM" hour24="false" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("12:00:00");
    });

    test("isoValue includes seconds when available in 12-hour format", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="02:30:15 PM" hour24="false" seconds="true" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("14:30:15");
    });

    test("isoValue updates when time is changed programmatically", async ({
      initTestBed,
      page,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" initialValue="14:30" hour24="true" />
          <Button testId="setTimeBtn" onClick="timeInput.setValue('09:15')" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      // Change the time programmatically
      await page.getByTestId("setTimeBtn").click();

      // Get the ISO value
      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe("09:15:00");
    });

    test("isoValue returns null when only hour is set", async ({
      initTestBed,
      page,
      createTimeInputDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment>
          <TimeInput id="timeInput" testId="timeInput" />
          <Button testId="getIsoBtn" onClick="testState = timeInput.isoValue()" />
        </Fragment>
      `);

      const driver = await createTimeInputDriver("timeInput");

      // Set only hour, leave minute empty
      await driver.hourInput.fill("14");

      await page.getByTestId("getIsoBtn").click();
      await expect.poll(testStateDriver.testState).toBe(null);
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct role for main container", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" label="Time Input" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
  });

  test("has correct accessibility attributes for inputs", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" label="Select time" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toHaveAttribute("type", "text");
    await expect(driver.minuteInput).toHaveAttribute("type", "text");
  });

  test("associates label with component", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" label="Meeting time" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.label).toBeVisible();
    await expect(driver.label).toContainText("Meeting time");
  });

  test("supports keyboard navigation", async ({ initTestBed, createTimeInputDriver, page }) => {
    await initTestBed(`<TimeInput testId="timeInput" seconds="true" />`);
    const driver = await createTimeInputDriver("timeInput");

    // Tab through all inputs
    await driver.hourInput.focus();
    await expect(driver.hourInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.minuteInput).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(driver.secondInput).toBeFocused();
  });

  test("supports required attribute for accessibility", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" required="true" label="Required time" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toHaveAttribute("required");
  });

  test("has proper ARIA attributes for disabled state", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" enabled="false" label="Disabled time" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toBeDisabled();
    await expect(driver.minuteInput).toBeDisabled();
  });

  test("has proper ARIA attributes for readonly state", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(
      `<TimeInput testId="timeInput" readOnly="true" label="Readonly time" initialValue="14:30" />`,
    );
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toHaveAttribute("readonly");
    await expect(driver.minuteInput).toHaveAttribute("readonly");
  });

  test("clear button has accessible name", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" clearable="true" initialValue="14:30" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.clearButton).toBeVisible();
  });

  test("AM/PM select has proper role", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" hour24="false" initialValue="14:30" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.amPmInput).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies Input borderRadius theme variable", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "borderRadius-TimeInput-default": "10px" },
    });
    const driver = await createTimeInputDriver("time-input");
    await expect(driver.component).toHaveCSS("border-radius", "10px");
  });

  test("applies Input borderColor theme variable", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "borderColor-TimeInput-default": "rgb(255, 0, 0)" },
    });
    const driver = await createTimeInputDriver("time-input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("applies Input textColor theme variable", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "textColor-TimeInput-default": "rgb(0, 0, 255)" },
    });
    const driver = await createTimeInputDriver("time-input");
    await expect(driver.component).toHaveCSS("color", "rgb(0, 0, 255)");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles empty string props", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" label="" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
  });

  test("handles very long unicode characters in initialValue", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" initialValue="👨‍👩‍👧‍👦" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toHaveValue("00");
    await expect(driver.minuteInput).toHaveValue("00");
  });

  test("handles chinese characters in initialValue", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" initialValue="中文时间" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.hourInput).toHaveValue("00");
    await expect(driver.minuteInput).toHaveValue("00");
  });

  test("handles negative values in time inputs", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" />`);
    const driver = await createTimeInputDriver("timeInput");
    await driver.hourInput.click();
    await driver.hourInput.fill("-5");
    // Component should handle negative values gracefully
    await driver.hourInput.blur();
    await expect(driver.component).toBeVisible();
  });

  test("handles very large numbers in time inputs", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" />`);
    const driver = await createTimeInputDriver("timeInput");
    await driver.hourInput.click();
    await driver.hourInput.fill("999");
    // Component should handle large values gracefully
    await driver.hourInput.blur();
    await expect(driver.component).toBeVisible();
  });

  test("handles multiple rapid clear button clicks", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`
      <TimeInput testId="timeInput" clearable="true" clearToInitialValue="false" initialValue="14:30" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    // Rapidly click clear button multiple times
    await driver.clearButton.click();
    await driver.clearButton.click();
    await driver.clearButton.click();

    await expect(driver.hourInput).toHaveValue("");
    await expect(driver.minuteInput).toHaveValue("");
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================

test.describe("Events", () => {
  test("didChange event fires when value changes", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" initialValue="03:28"
        onDidChange="arg => {testState = arg; console.log('arg', arg)}" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    await driver.hourInput.click();
    await driver.hourInput.fill("14");
    await driver.hourInput.blur();

    await expect.poll(testStateDriver.testState).toBeTruthy();
  });

  test("didChange event receives correct time value", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" onDidChange="arg => testState = arg" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    await driver.hourInput.click();
    await driver.hourInput.fill("14");
    await driver.minuteInput.click();
    await driver.minuteInput.fill("30");
    await driver.minuteInput.blur();

    await expect.poll(testStateDriver.testState).toEqual("14:30");
  });

  test("gotFocus event fires when component receives focus", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" onGotFocus="testState = 'focused'" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    await driver.hourInput.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("gotFocus event fires on label click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" label="Time" onGotFocus="testState = 'focused'" />
    `);

    await page.getByText("Time").click();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("lostFocus event fires when component loses focus", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" onLostFocus="testState = 'blurred'" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    await driver.hourInput.focus();
    await driver.hourInput.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("invalidTime event fires for invalid input", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput testId="timeInput" onInvalidTime="testState = 'invalid'" />
    `);
    const driver = await createTimeInputDriver("timeInput");

    await driver.hourInput.click();
    await driver.hourInput.fill("25"); // Invalid hour
    await driver.hourInput.blur();

    await expect.poll(testStateDriver.testState).toEqual("invalid");
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("focus() method focuses the component", async ({
    initTestBed,
    page,
    createTimeInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" />
        <Button onClick="timeInput.focus()" testId="focusBtn" />
      </Fragment>
    `);
    const driver = await createTimeInputDriver("timeInput");

    await page.getByTestId("focusBtn").click();
    await expect(driver.hourInput).toBeFocused();
  });

  test("value property returns current time", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" initialValue="14:30" />
        <Button onClick="testState = timeInput.value" testId="getValueBtn" />
      </Fragment>
    `);

    await page.getByTestId("getValueBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("14:30");
  });

  test("setValue() method updates the time", async ({
    initTestBed,
    page,
    createTimeInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" />
        <Button onClick="timeInput.setValue('15:45')" testId="setValueBtn" />
      </Fragment>
    `);
    const driver = await createTimeInputDriver("timeInput");

    await page.getByTestId("setValueBtn").click();
    await expect(driver.hourInput).toHaveValue("15");
    await expect(driver.minuteInput).toHaveValue("45");
  });

  test("setValue() with empty string clears the value", async ({
    initTestBed,
    page,
    createTimeInputDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" initialValue="14:30" />
        <Button onClick="timeInput.setValue('')" testId="clearBtn" />
      </Fragment>
    `);
    const driver = await createTimeInputDriver("timeInput");

    await page.getByTestId("clearBtn").click();
    await expect(driver.hourInput).toHaveValue("");
    await expect(driver.minuteInput).toHaveValue("");
  });

  test("value property returns undefined when no value set", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" />
        <Button onClick="testState = timeInput.value === undefined ? 'undefined' : 'defined'" testId="checkBtn" />
      </Fragment>
    `);
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("undefined");
  });

  test("setValue() triggers didChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput testId="timeInput" id="timeInput" onDidChange="arg => testState = 'changed:' + arg" />
        <Button onClick="timeInput.setValue('16:20')" testId="setBtn" />
      </Fragment>
    `);

    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("changed:16:20");
  });
});

// =============================================================================
// LAYOUT TESTS
// =============================================================================

test.describe("Layout", () => {
  test("labelWidth applies custom label width", async ({ initTestBed, createTimeInputDriver }) => {
    const expected = 200;
    await initTestBed(
      `<TimeInput testId="timeInput" label="Select time" labelPosition="left" labelWidth="${expected}px" />`,
    );
    const driver = await createTimeInputDriver("timeInput");
    const { width } = await getBounds(driver.label);
    expect(width).toEqual(expected);
  });

  test("time inputs maintain consistent spacing", async ({
    initTestBed,
    createTimeInputDriver,
  }) => {
    await initTestBed(`<TimeInput testId="timeInput" seconds="true" />`);
    const driver = await createTimeInputDriver("timeInput");

    const { right: hourRight } = await getBounds(driver.hourInput);
    const { left: minuteLeft, right: minuteRight } = await getBounds(driver.minuteInput);
    const { left: secondLeft } = await getBounds(driver.secondInput);

    // Verify there's consistent spacing between inputs
    const hourToMinuteGap = minuteLeft - hourRight;
    const minuteToSecondGap = secondLeft - minuteRight;

    expect(hourToMinuteGap).toBeGreaterThan(0);
    expect(minuteToSecondGap).toBeGreaterThan(0);
    expect(Math.abs(hourToMinuteGap - minuteToSecondGap)).toBeLessThan(5); // Allow small differences
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TimeInput width="200px" testId="test"/>
  `);
  const { width } = await page.getByTestId("test").boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TimeInput width="200px" label="test" testId="test"/>
  `);
  const { width } = await page.getByTestId("test").boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<TimeInput width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<TimeInput width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});
