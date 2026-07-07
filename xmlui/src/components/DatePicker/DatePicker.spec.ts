import type { Locator, Page } from "@playwright/test";

import { expect, test } from "../../testing/fixtures";

// Clicking the editable input is reserved for typing; the calendar opens from the
// non-input chrome of the control. Click its top-left padding to open.
async function openCalendar(page: Page) {
  await page
    .getByTestId("dp")
    .locator('[data-part="control"]')
    .first()
    .click({ position: { x: 6, y: 6 } });
}

// A day cell in the *day* view of the calendar (popover or inline). Ark also
// mounts month/year picker views whose cells carry other data-view values, so
// scope to data-view="day" and match the day number exactly.
function dayCell(scope: Page | Locator, day: number | string) {
  return scope
    .locator('[data-part="table-cell-trigger"][data-view="day"]')
    .filter({ hasText: new RegExp(`^${day}$`) });
}

// Smoke coverage for the Ark UI backed DatePicker. The full interaction
// surface is exercised by the original component's app-level e2e suite; these
// tests lock in that the component mounts, honors its value props, and opens
// inside the xmlui runtime after being moved into core.
test.describe("DatePicker - smoke", () => {
  test("renders", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
  });

  test("renders inline", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker inline testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
  });

  // Inline mode mirrors the core DatePicker: only the calendar (the dropdown
  // content) is shown — no input control — and it is visible without any click.
  test("inline renders only the calendar, no input control", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker inline testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const root = page.getByTestId("dp");
    await expect(root).toBeVisible();
    // The calendar day grid is on screen immediately (no trigger to click).
    await expect(root.locator('[data-part="table"]').first()).toBeVisible();
    // No editable input control is rendered in inline mode.
    await expect(root.locator("input")).toHaveCount(0);
    await expect(root.locator('[data-part="control"]')).toHaveCount(0);
  });

  // Regression: with no input there is no floating-ui reference, so Ark parks the
  // positioner off-screen with pointer-events:none. The inline calendar must stay
  // interactive — clicking a day moves the selection.
  test("inline calendar is interactive (days are clickable)", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker inline testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    const root = page.getByTestId("dp");
    await expect(root.locator('[data-part="table"]').first()).toBeVisible();
    // Scope to the day view — the inline calendar also mounts the month/year
    // views, which carry their own [data-selected] cells.
    const dayCells = root.locator('[data-part="table-cell-trigger"][data-view="day"]');
    const selectedDay = root.locator('[data-part="table-cell-trigger"][data-view="day"][data-selected]');
    await expect(selectedDay).toHaveText("15");
    await dayCells.filter({ hasText: /^20$/ }).first().click();
    await expect(selectedDay).toHaveText("20");
  });

  test("shows single initialValue in the input", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    await expect(page.getByTestId("dp").locator("input").first()).toHaveValue("05/25/2024");
  });

  test("shows range initialValue in both inputs", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/25/2024', to: '05/26/2024' }}" />`,
    );
    const inputs = page.getByTestId("dp").locator("input");
    await expect(inputs.nth(0)).toHaveValue("05/25/2024");
    await expect(inputs.nth(1)).toHaveValue("05/26/2024");
  });

  test("opens the calendar from the trigger", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
    await openCalendar(page);
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
  });

  // The styling was migrated to the xmlui theme-variable system (createThemeVar +
  // defaultThemeVars), so the SCSS no longer carries inline fallbacks. These
  // checks lock in that the theme variables resolve to real values: an unset var
  // would compute to an empty / transparent value instead.
  test("theme variables resolve (Input inheritance + day defaults)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );

    // Input-family inheritance: the trigger border resolves to a solid border.
    const borderStyle = await page
      .getByTestId("dp")
      .locator('[data-part="control"]')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopStyle);
    expect(borderStyle).toBe("solid");

    // Day-cell default: the selected day paints a non-transparent background.
    await openCalendar(page);
    const selectedBg = await page
      .locator('[data-selected]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(selectedBg).not.toBe("rgba(0, 0, 0, 0)");
    expect(selectedBg).not.toBe("transparent");
  });
});

// Feature parity with the core DatePicker: disabledDates, confirmRangeSelection,
// concise validation feedback, and the `value` query API.
test.describe("DatePicker - DatePicker parity", () => {
  test("disabledDates marks the matching day unavailable", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy"
         initialValue="05/15/2024" disabledDates="{['05/20/2024']}" />`,
    );
    await openCalendar(page);
    // Exactly the one disabled day in the visible month is unavailable.
    await expect(page.locator("[data-unavailable]")).toHaveCount(1);
  });

  test("no disabled days without disabledDates", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`,
    );
    await openCalendar(page);
    await expect(page.locator("[data-unavailable]")).toHaveCount(0);
  });

  test("confirmRangeSelection shows a Cancel/Proceed footer and Cancel keeps the value", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" confirmRangeSelection="true"
         initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}" />`,
    );
    const inputs = page.getByTestId("dp").locator("input");
    await openCalendar(page);
    await expect(page.getByRole("button", { name: "Proceed" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    // Cancel drops the pending selection — the committed value is unchanged.
    await expect(inputs.nth(0)).toHaveValue("05/10/2024");
    await expect(inputs.nth(1)).toHaveValue("05/15/2024");
  });

  test("no confirm footer when confirmRangeSelection is off", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy"
         initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}" />`,
    );
    await openCalendar(page);
    await expect(page.getByRole("button", { name: "Proceed" })).toHaveCount(0);
  });

  test("concise validation feedback shows when verbose is disabled", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" validationStatus="error" verboseValidationFeedback="false"
         invalidMessages="{['Invalid date']}" />`,
    );
    await expect(
      page.getByTestId("dp").locator('[class*="conciseValidation"]'),
    ).toBeVisible();
  });

  test("no concise feedback icon by default (verbose)", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" validationStatus="error" />`);
    await expect(
      page.getByTestId("dp").locator('[class*="conciseValidation"]'),
    ).toHaveCount(0);
  });

  test("exposes the current value via the `value` API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="picker" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
        <Text testId="out">{picker.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("out")).toHaveText("05/25/2024");
  });
});

// Range presets are optional (showPresets) and customizable (built-in keys,
// relabeled keys, or fully custom { label, from, to } ranges).
test.describe("DatePicker - presets", () => {
  // Ark puts a computed range on the preset button's aria-label, so match the
  // visible label text rather than the accessible name.
  test("presets are hidden by default in range mode", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" mode="range" />`);
    await openCalendar(page);
    await expect(page.getByText("Last 7 days")).toHaveCount(0);
  });

  test("showPresets=true shows the built-in presets", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" mode="range" showPresets="true" />`);
    await openCalendar(page);
    await expect(page.getByText("Last 7 days")).toBeVisible();
  });

  test("showPresets=false hides presets even with a custom list", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" showPresets="false"
         presets="{[{ label: 'Q1 2024', from: '01/01/2024', to: '03/31/2024' }]}" />`,
    );
    await openCalendar(page);
    await expect(page.getByText("Q1 2024")).toHaveCount(0);
  });

  test("no presets in single mode (even with showPresets)", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" mode="single" showPresets="true" />`);
    await openCalendar(page);
    await expect(page.getByText("Last 7 days")).toHaveCount(0);
  });

  test("a custom { label, from, to } preset renders and applies its range", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy"
         presets="{[{ label: 'Q1 2024', from: '01/01/2024', to: '03/31/2024' }]}" />`,
    );
    await openCalendar(page);
    const preset = page.getByText("Q1 2024");
    await expect(preset).toBeVisible();
    // The custom list replaces the built-in defaults.
    await expect(page.getByText("Last 7 days")).toHaveCount(0);
    await preset.click();
    const inputs = page.getByTestId("dp").locator("input");
    await expect(inputs.nth(0)).toHaveValue("01/01/2024");
    await expect(inputs.nth(1)).toHaveValue("03/31/2024");
  });
});

// The clear affordance is optional (clearable) and off by default, matching
// DateInput/TimeInput/Select.
test.describe("DatePicker - clearable", () => {
  test("the clear button is hidden by default", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" initialValue="05/25/2024" />`);
    await expect(page.getByRole("button", { name: "Clear date" })).toHaveCount(0);
  });

  test("clearable shows the clear button", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" clearable="true" initialValue="05/25/2024" />`);
    await expect(page.getByRole("button", { name: "Clear date" })).toBeVisible();
  });

  test("clicking the clear button resets the value", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" clearable="true" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await expect(input).toHaveValue("05/25/2024");
    await page.getByRole("button", { name: "Clear date" }).click();
    await expect(input).toHaveValue("");
  });
});

// Icons follow the core DatePicker model: no default calendar icon — adornments
// only appear when startIcon/endIcon/startText/endText are supplied.
test.describe("DatePicker - icons", () => {
  test("no adornment icon by default", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" initialValue="05/25/2024" />`);
    await expect(page.getByTestId("dp").locator('[class*="adornment"]')).toHaveCount(0);
  });

  test("startIcon renders an adornment at the start of the input", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" startIcon="date" initialValue="05/25/2024" />`);
    const adornment = page.getByTestId("dp").locator('[class*="adornment"]');
    await expect(adornment).toHaveCount(1);
    await expect(adornment.locator("svg")).toBeVisible();
  });

  test("endText renders an adornment at the end of the input", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" endText="UTC" initialValue="05/25/2024" />`);
    await expect(page.getByTestId("dp").getByText("UTC")).toBeVisible();
  });
});

// When disabled the field is non-interactive with a not-allowed cursor, matching
// the core DatePicker.
test.describe("DatePicker - disabled", () => {
  test("the control shows a not-allowed cursor", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" enabled="false" initialValue="05/25/2024" />`);
    const cursor = await page
      .getByTestId("dp")
      .locator('[data-part="control"]')
      .first()
      .evaluate((el) => getComputedStyle(el).cursor);
    expect(cursor).toBe("not-allowed");
  });

  test("the inputs are disabled and clicking does not open the calendar", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" enabled="false" initialValue="05/25/2024" />`);
    await expect(page.getByTestId("dp").locator("input").first()).toBeDisabled();
    // Clicking the field must not open the calendar popup.
    await page.getByTestId("dp").locator('[data-part="control"]').first().click();
    await expect(page.getByTestId("dp")).not.toHaveAttribute("data-state", "open");
    // The calendar content stays mounted but hidden — it must not become visible.
    await expect(page.getByText("Sun")).not.toBeVisible();
  });
});

// Read-only allows opening/browsing the calendar but never changes the value,
// and the input cannot be typed into — matching the core DatePicker.
test.describe("DatePicker - readOnly", () => {
  test("the input cannot be typed into", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" readOnly="true" dateFormat="MM/dd/yyyy" initialValue="05/26/2024" />`,
    );
    await expect(page.getByTestId("dp").locator("input").first()).not.toBeEditable();
  });

  test("selecting a day in the calendar does not change the value", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" readOnly="true" dateFormat="MM/dd/yyyy" initialValue="05/26/2024" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await expect(input).toHaveValue("05/26/2024");
    await openCalendar(page);
    // Click a different day — read-only must ignore the selection.
    await page.locator('[class*="cellTrigger"]').filter({ hasText: /^15$/ }).first().click();
    await expect(input).toHaveValue("05/26/2024");
  });
});

// The day view is rendered from a custom focused-value anchor; Ark's month/year
// pickers must still move the visible month (regression: the anchor froze after
// chevron navigation, so the picker had no effect).
test.describe("DatePicker - month & year navigation", () => {
  // The calendar popup is portaled to <body>, so its content is queried at page
  // scope (initTestBed renders a single picker).
  test("the month picker moves the visible month, even after chevron navigation", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    await openCalendar(page);
    const dayHeader = page.locator('[data-part="view-trigger"]').first();
    await expect(dayHeader).toHaveText(/May 2024/);
    // Chevron forward sets the day-view anchor (this used to freeze it).
    await page.getByRole("button", { name: "Next month" }).click();
    await expect(dayHeader).toHaveText(/June 2024/);
    // Open the month picker and choose September.
    await dayHeader.click();
    await page.locator('[data-part="table-cell-trigger"]').filter({ hasText: /^Sep$/ }).click();
    // The day view must follow the picker (regression: it stayed on June).
    await expect(dayHeader).toHaveText(/September 2024/);
  });

  test("the year picker moves the visible year, even after chevron navigation", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    await openCalendar(page);
    const dayHeader = page.locator('[data-part="view-trigger"]').first();
    await page.getByRole("button", { name: "Next month" }).click();
    await expect(dayHeader).toHaveText(/June 2024/);
    // Day view header → month picker → its header → year picker → pick 2026.
    await dayHeader.click();
    await page.locator('[data-part="view-trigger"]:visible').first().click();
    await page.locator('[data-part="table-cell-trigger"]:visible').filter({ hasText: /^2026$/ }).click();
    // Pick a month to return to the day view in the chosen year.
    await page.locator('[data-part="table-cell-trigger"]:visible').filter({ hasText: /^Jun$/ }).click();
    await expect(dayHeader).toHaveText(/June 2026/);
  });

  // Regression: re-anchoring on every focus change shifted the multi-month row
  // when the range start was picked in the second visible month, so the end date
  // "jumped away". Picking within the visible months must not move the view.
  test("range: selecting a start in the second visible month does not shift the view", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/10/2024', to: '05/20/2024' }}" />`,
    );
    await openCalendar(page);
    const months = page.locator('[class*="_calendarMonth_"]');
    const firstHeader = months.nth(0).locator('[data-part="view-trigger"]');
    await expect(firstHeader).toHaveText(/May 2024/);
    // Start in the SECOND visible month (June).
    await months.nth(1).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^5$/ }).first().click();
    // The row must not jump (regression: it re-anchored to June).
    await expect(firstHeader).toHaveText(/May 2024/);
    // The end date is still where it was — pick it and confirm the range commits.
    await months.nth(1).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^20$/ }).first().click();
    const inputs = page.getByTestId("dp").locator("input");
    await expect(inputs.nth(0)).toHaveValue("06/05/2024");
    await expect(inputs.nth(1)).toHaveValue("06/20/2024");
  });

  // Regression (hover): while selecting a range, hovering days in the second
  // visible month fired Ark focus changes that re-anchored the view, so it
  // jumped to the next month and the end date became unselectable.
  test("range: hovering days in the second month does not shift the view", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/10/2024', to: '05/20/2024' }}" />`,
    );
    await openCalendar(page);
    const months = page.locator('[class*="_calendarMonth_"]');
    const firstHeader = months.nth(0).locator('[data-part="view-trigger"]');
    await expect(firstHeader).toHaveText(/May 2024/);
    // Start in the first month.
    await months.nth(0).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^12$/ }).first().click();
    // Hover across days in the SECOND month — the view must stay put.
    await months.nth(1).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^8$/ }).first().hover();
    await months.nth(1).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^22$/ }).first().hover();
    await expect(firstHeader).toHaveText(/May 2024/);
    // The end date is still reachable — select it.
    await months.nth(1).locator('[data-part="table-cell-trigger"]').filter({ hasText: /^22$/ }).first().click();
    const inputs = page.getByTestId("dp").locator("input");
    await expect(inputs.nth(0)).toHaveValue("05/12/2024");
    await expect(inputs.nth(1)).toHaveValue("06/22/2024");
  });
});

// The field is the open trigger only on its non-input chrome. Clicking the
// editable date input is reserved for typing and must NOT open the calendar.
test.describe("DatePicker - trigger vs typing", () => {
  test("clicking the editable input focuses it and does not open the calendar", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const input = page.getByTestId("dp").locator("input").first();
    await input.click();
    await expect(input).toBeFocused();
    await expect(page.getByTestId("dp")).not.toHaveAttribute("data-state", "open");
    await expect(page.getByText("Sun")).not.toBeVisible();
  });

  test("clicking the control's non-input chrome opens the calendar", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    await openCalendar(page);
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
  });

  test("control shows a pointer cursor and the editable input a text cursor", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" initialValue="05/25/2024" />`);
    const control = page.getByTestId("dp").locator('[data-part="control"]').first();
    const input = page.getByTestId("dp").locator("input").first();
    expect(await control.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");
    expect(await input.evaluate((el) => getComputedStyle(el).cursor)).toBe("text");
  });

  test("a read-only input shows a pointer cursor (it is a trigger, not editable)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" readOnly="true" initialValue="05/25/2024" />`);
    const input = page.getByTestId("dp").locator("input").first();
    expect(await input.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");
  });

  // Full-width: the control fills its container, but the number input stays only
  // as wide as its digits so the rest of the field is clickable open-chrome.
  test("full-width keeps the number input narrow with clickable chrome", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" width="100%" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const control = page.getByTestId("dp").locator('[data-part="control"]');
    const cBox = await control.boundingBox();
    const iBox = await control.locator("input").first().boundingBox();
    // The input only spans its digits; the control is much wider — leaving room
    // to click-to-open.
    expect(iBox!.width).toBeLessThan(140);
    expect(cBox!.width - iBox!.width).toBeGreaterThan(60);
    // Clicking the empty chrome on the far side of the control opens the calendar.
    await control.click({ position: { x: cBox!.width - 8, y: 8 } });
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
  });

  // Adornments hug the edges of a full-width field: start text at the left, end
  // text at the right, with a wide clickable gap (the value) between them.
  test("full-width: start adornment hugs the left edge, end adornment the right", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" width="100%" startText="From" endText="UTC" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const control = page.getByTestId("dp").locator('[data-part="control"]');
    const adornments = control.locator('[class*="_adornment_"]');
    const cBox = await control.boundingBox();
    const startBox = await adornments.first().boundingBox();
    const endBox = await adornments.last().boundingBox();
    // Start near the left edge, end near the right edge.
    expect(startBox!.x - cBox!.x).toBeLessThan(40);
    expect(cBox!.x + cBox!.width - (endBox!.x + endBox!.width)).toBeLessThan(40);
    // A wide gap separates them (the clickable open-surface around the value).
    expect(endBox!.x - (startBox!.x + startBox!.width)).toBeGreaterThan(100);
  });

  test("full-width: clicking the gap before the end adornment opens the calendar", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" width="100%" startText="From" endText="UTC" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    const control = page.getByTestId("dp").locator('[data-part="control"]');
    const cBox = await control.boundingBox();
    // The middle of the field is empty control surface (value is narrow on the
    // left, end adornment on the right) — clicking it opens the calendar.
    await control.click({ position: { x: cBox!.width / 2, y: cBox!.height / 2 } });
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
  });
});

// The mobile bottom-sheet scrolls vertically through months. The window must
// grow as the user scrolls so any past/future date is reachable (regression: it
// was capped at a fixed ±6-month window).
test.describe("DatePicker - mobile infinite scroll", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("scrolling the sheet to the bottom reveals months beyond the initial window", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    // Tapping the field opens the bottom sheet on mobile.
    await page.getByTestId("dp").locator('[data-part="control"]').click();
    await expect(page.getByTestId("datepicker-sheet")).toBeVisible();
    // A month a year ahead is outside the initial ±6-month window (May 2024).
    await expect(page.getByText("June 2025", { exact: true })).toHaveCount(0);
    // Scroll the month list to the bottom a few times — each extends the window.
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const months = document.querySelector('[class*="_calendarMonths_"]');
        const view = months?.parentElement as HTMLElement | null;
        if (view) view.scrollTop = view.scrollHeight;
      });
      await page.waitForTimeout(200);
    }
    // Far-future months are now rendered (reachable by scrolling).
    await expect(page.getByText("June 2025", { exact: true })).toHaveCount(1);
  });

  test("scrolling the sheet to the top reveals months before the initial window", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    await page.getByTestId("dp").locator('[data-part="control"]').click();
    await expect(page.getByTestId("datepicker-sheet")).toBeVisible();
    // A month a year back is outside the initial window.
    await expect(page.getByText("April 2023", { exact: true })).toHaveCount(0);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const months = document.querySelector('[class*="_calendarMonths_"]');
        const view = months?.parentElement as HTMLElement | null;
        if (view) view.scrollTop = 0;
      });
      await page.waitForTimeout(200);
    }
    await expect(page.getByText("April 2023", { exact: true })).toHaveCount(1);
  });

  // The month/year picker must work inside the sheet too: tapping a month header
  // opens the picker, and choosing a far year/month jumps the calendar there.
  test("the month/year picker jumps the sheet to the chosen year and month", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`);
    await page.getByTestId("dp").locator('[data-part="control"]').click();
    const sheet = page.getByTestId("datepicker-sheet");
    await expect(sheet).toBeVisible();
    const dayHeaders = sheet.locator('[class*="_calendarMonths_"] [data-part="view-trigger"]');
    // 2027 is well outside the initial ±6-month window.
    await expect(dayHeaders.filter({ hasText: "June 2027" })).toHaveCount(0);
    // Tap the anchor month header → month picker, then its header → year picker.
    await dayHeaders.filter({ hasText: "May 2024" }).click();
    await sheet.locator('[data-part="view-trigger"]:visible').first().click();
    await sheet.locator('[data-part="table-cell-trigger"]:visible').filter({ hasText: /^2027$/ }).click();
    await sheet.locator('[data-part="table-cell-trigger"]:visible').filter({ hasText: /^Jun$/ }).click();
    // The day view jumped to June 2027.
    await expect(dayHeaders.filter({ hasText: "June 2027" })).toHaveCount(1);
  });
});

// ===========================================================================
// Behavioral parity with the core DatePicker (DatePicker.spec.ts), re-expressed
// against the Ark UI DOM. The assertions target behaviour (committed value,
// resolved theme colours, ARIA/keyboard) rather than the react-day-picker DOM
// the original suite probed, so they stay robust across the backend swap.
// ===========================================================================

test.describe("Basic Functionality", () => {
  test("applies a non-default dateFormat to the input", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" dateFormat="yyyy-MM-dd" initialValue="2024-05-25" />`,
    );
    await expect(page.getByTestId("dp").locator("input").first()).toHaveValue("2024-05-25");
  });

  test("allows date selection in single mode", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await openCalendar(page);
    await dayCell(page, 26).first().click();
    await expect(input).toHaveValue("05/26/2024");
  });

  test("changes the date when a new day is selected", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await openCalendar(page);
    await dayCell(page, 26).first().click();
    await expect(input).toHaveValue("05/26/2024");
    await openCalendar(page);
    await dayCell(page, 27).first().click();
    await expect(input).toHaveValue("05/27/2024");
  });

  test("shows the date-format mask as the input placeholder when empty", async ({
    page,
    initTestBed,
  }) => {
    // The segment input guides the user with a lowercased mask of the format
    // (the core DatePicker showed the `placeholder` prop; the Ark segment input
    // uses the format mask instead).
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" />`);
    await expect(page.getByTestId("dp").locator("input").first()).toHaveAttribute(
      "placeholder",
      "mm/dd/yyyy",
    );
  });

  test("shows week numbers when showWeekNumber is enabled", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" showWeekNumber="true" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`,
    );
    await openCalendar(page);
    await expect(page.locator('[class*="weekNumber"]').first()).toBeVisible();
  });

  test("renders start and end adornments together", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" startText="From" endText="Select" startIcon="date" endIcon="date" initialValue="05/25/2024" />`,
    );
    const root = page.getByTestId("dp");
    await expect(root.getByText("From")).toBeVisible();
    await expect(root.getByText("Select")).toBeVisible();
    await expect(root.locator('[class*="adornment"] svg')).toHaveCount(2);
  });
});

test.describe("Accessibility", () => {
  test("respects the autoFocus property", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" autoFocus="true" />`);
    await expect(page.getByTestId("dp").locator("input").first()).toBeFocused();
  });

  test("associates its label with the input (accessible name)", async ({ page, initTestBed }) => {
    // The label names the editable input, so it is exposed as the input's
    // accessible name.
    await initTestBed(`<DatePicker testId="dp" label="Birth Date" />`);
    await expect(page.getByRole("textbox", { name: "Birth Date" })).toBeVisible();
  });

  test("is focusable via its label (click moves focus)", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" label="Birth Date" />`);
    await page.getByText("Birth Date").click();
    await expect(page.getByTestId("dp").locator("input").first()).toBeFocused();
  });

  test("Escape closes the open calendar", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    await openCalendar(page);
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("dp")).not.toHaveAttribute("data-state", "open");
  });

  test("arrow keys move the focused day inside the calendar", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    await openCalendar(page);
    const start = dayCell(page, 15).first();
    await start.focus();
    await expect(start).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dayCell(page, 16).first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(dayCell(page, 23).first()).toBeFocused();
  });

  test("Enter selects the focused day and commits the value", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await openCalendar(page);
    const start = dayCell(page, 15).first();
    await start.focus();
    await expect(start).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dayCell(page, 16).first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("05/16/2024");
  });
});

test.describe("Event Handling", () => {
  test("fires gotFocus when focused", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(
      `<DatePicker testId="dp" onGotFocus="testState = 'focused'" />`,
    );
    await page.getByTestId("dp").locator("input").first().focus();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("fires lostFocus when blurred", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(
      `<DatePicker testId="dp" onLostFocus="testState = 'blurred'" />`,
    );
    const input = page.getByTestId("dp").locator("input").first();
    await input.focus();
    await expect(input).toBeFocused();
    await input.blur();
    await expect.poll(testStateDriver.testState).toBe("blurred");
  });

  test("fires gotFocus when the label is clicked", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(
      `<DatePicker testId="dp" label="Pick" onGotFocus="testState = 'focused'" />`,
    );
    await page.getByText("Pick").click();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });
});

test.describe("Theme Variables", () => {
  test("applies the error validation border color", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" validationStatus="error" />`, {
      testThemeVars: { "borderColor-DatePicker--error": "rgb(220, 38, 38)" },
    });
    await expect(
      page.getByTestId("dp").locator('[data-part="control"]').first(),
    ).toHaveCSS("border-top-color", "rgb(220, 38, 38)");
  });

  test("applies the warning validation border color", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" validationStatus="warning" />`, {
      testThemeVars: { "borderColor-DatePicker--warning": "rgb(255, 165, 0)" },
    });
    await expect(
      page.getByTestId("dp").locator('[data-part="control"]').first(),
    ).toHaveCSS("border-top-color", "rgb(255, 165, 0)");
  });

  test("applies the valid validation border color", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" validationStatus="valid" />`, {
      testThemeVars: { "borderColor-DatePicker--success": "rgb(0, 128, 0)" },
    });
    await expect(
      page.getByTestId("dp").locator('[data-part="control"]').first(),
    ).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  });

  test("weekday header uses the configured textColor-weekday", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" inline />`, {
      testThemeVars: { "textColor-weekday-DatePicker": "rgb(123, 45, 67)" },
    });
    await expect(page.getByTestId("dp").locator('[class*="weekday"]').first()).toHaveCSS(
      "color",
      "rgb(123, 45, 67)",
    );
  });

  test("today cell paints a ring, not a background fill", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" inline />`, {
      testThemeVars: {
        "backgroundColor-day-DatePicker--today": "transparent",
        "borderColor-selectedItem-DatePicker": "rgb(11, 22, 33)",
        "borderWidth-day-DatePicker--today": "2px",
      },
    });
    const today = page.getByTestId("dp").locator('[data-view="day"][data-today]').first();
    await expect(today).toBeVisible();
    await expect(today).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const shadow = await today.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe("none");
    expect(shadow).toContain("rgb(11, 22, 33)");
  });

  test("selected day uses the configured selected colors", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`,
      {
        testThemeVars: {
          "backgroundColor-day-DatePicker--selected": "rgb(50, 100, 200)",
          "textColor-day-DatePicker--selected": "rgb(255, 255, 255)",
        },
      },
    );
    await openCalendar(page);
    const selected = page.locator('[data-view="day"][data-selected]').first();
    await expect(selected).toHaveCSS("background-color", "rgb(50, 100, 200)");
    await expect(selected).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("range middle uses the configured rangeMiddle colors", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}" />`,
      {
        testThemeVars: {
          "backgroundColor-day-DatePicker--rangeMiddle": "rgb(230, 240, 255)",
          "textColor-day-DatePicker--rangeMiddle": "rgb(11, 22, 33)",
        },
      },
    );
    await openCalendar(page);
    const middle = page
      .locator('[data-view="day"][data-in-range]:not([data-range-start]):not([data-range-end])')
      .filter({ hasText: /^12$/ })
      .first();
    await expect(middle).toHaveCSS("background-color", "rgb(230, 240, 255)");
    await expect(middle).toHaveCSS("color", "rgb(11, 22, 33)");
  });
});

test.describe("Disabled Days", () => {
  test("startDate blocks selecting an earlier day", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" testId="dp" mode="single" dateFormat="MM/dd/yyyy"
          initialValue="05/15/2024" startDate="05/10/2024" />
        <Text testId="out">{dp.value}</Text>
      </Fragment>
    `);
    await openCalendar(page);
    // Day 5 is before the start date — clicking it must not change the value.
    await dayCell(page, 5).first().click({ force: true });
    await expect(page.getByTestId("out")).toHaveText("05/15/2024");
  });

  test("endDate blocks selecting a later day", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" testId="dp" mode="single" dateFormat="MM/dd/yyyy"
          initialValue="05/15/2024" endDate="05/20/2024" />
        <Text testId="out">{dp.value}</Text>
      </Fragment>
    `);
    await openCalendar(page);
    await dayCell(page, 25).first().click({ force: true });
    await expect(page.getByTestId("out")).toHaveText("05/15/2024");
  });

  test("disabled day paints the configured disabled colors", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" inline dateFormat="MM/dd/yyyy" initialValue="05/15/2024" disabledDates="{['05/20/2024']}" />`,
      {
        testThemeVars: {
          "backgroundColor-day-DatePicker--disabled": "rgb(220, 38, 38)",
          "textColor-day-DatePicker--disabled": "rgb(255, 255, 255)",
        },
      },
    );
    const disabled = page.getByTestId("dp").locator('[data-view="day"][data-unavailable]').filter({
      hasText: /^20$/,
    }).first();
    await expect(disabled).toHaveCSS("background-color", "rgb(220, 38, 38)");
    await expect(disabled).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("disabled day is not interactive (no pointer cursor)", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" inline dateFormat="MM/dd/yyyy" initialValue="05/15/2024" disabledDates="{['05/20/2024']}" />`,
    );
    const disabled = page.getByTestId("dp").locator('[data-view="day"][data-unavailable]').filter({
      hasText: /^20$/,
    }).first();
    await expect(disabled).toHaveCSS("cursor", "default");
  });

  test("clicking a disabled date does not change the value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" testId="dp" inline dateFormat="MM/dd/yyyy"
          initialValue="05/15/2024" disabledDates="{['05/20/2024']}" />
        <Text testId="out">{dp.value}</Text>
      </Fragment>
    `);
    await page.getByTestId("dp").locator('[data-view="day"][data-unavailable]').filter({
      hasText: /^20$/,
    }).first().click({ force: true });
    await expect(page.getByTestId("out")).toHaveText("05/15/2024");
  });

  test("disabled day defaults to a faded look with no background fill", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" inline dateFormat="MM/dd/yyyy" initialValue="05/15/2024" disabledDates="{['05/20/2024']}" />`,
    );
    const root = page.getByTestId("dp");
    const disabled = root.locator('[data-view="day"][data-unavailable]').filter({ hasText: /^20$/ }).first();
    // No filled background by default.
    await expect(disabled).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    // Faded out relative to an enabled day.
    const disabledOpacity = await disabled.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(disabledOpacity)).toBeLessThan(1);
  });
});

test.describe("Api", () => {
  test("setValue updates the input", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
        <Button testId="btn" onClick="dp.setValue('06/01/2024')" />
      </Fragment>
    `);
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("dp").locator("input").first()).toHaveValue("06/01/2024");
  });

  test("getValue returns the current value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
        <Button testId="btn" onClick="testState = dp.getValue()" />
        <Text testId="out">{testState}</Text>
      </Fragment>
    `);
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("out")).toHaveText("05/25/2024");
  });

  test("focus() moves keyboard focus to the input", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="dp" testId="dp" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
        <Button testId="btn" onClick="dp.focus()" />
      </Fragment>
    `);
    await page.getByTestId("btn").click();
    await expect(page.getByTestId("dp").locator("input").first()).toBeFocused();
  });

  test("bindTo syncs $data and value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <DatePicker id="bound" bindTo="dateValue" dateFormat="MM/dd/yyyy" />
        <Button testId="setBtn" onClick="bound.setValue('06/01/2024')" />
        <Text testId="dataValue">{$data.dateValue}</Text>
        <Text testId="compValue">{bound.value}</Text>
      </Form>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("dataValue")).toHaveText("06/01/2024");
    await expect(page.getByTestId("compValue")).toHaveText("06/01/2024");
  });

  test("submits its bound value inside a Form", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="(data) => testState = data.testField" data="{{ testField: '05/25/2024' }}">
        <DatePicker label="Choose Date" bindTo="testField" dateFormat="MM/dd/yyyy" />
      </Form>
    `);
    await page.locator("[type=submit]").click();
    await expect.poll(testStateDriver.testState).toEqual("05/25/2024");
  });
});

test.describe("Layout & Sizing", () => {
  test("full-width fills its container", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack width="400px">
        <DatePicker testId="dp" width="100%" />
      </Stack>
    `);
    const { width } = (await page.getByTestId("dp").boundingBox())!;
    expect(width).toBe(400);
  });

  test("height matches sibling input components", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker testId="dp" />
        <TextBox testId="textBox" />
        <NumberBox testId="numberBox" />
      </Fragment>
    `);
    const dpBox = (await page.getByTestId("dp").locator('[data-part="control"]').first().boundingBox())!;
    const tbBox = (await page.getByTestId("textBox").boundingBox())!;
    const nbBox = (await page.getByTestId("numberBox").boundingBox())!;
    expect(Math.round(dpBox.height)).toBe(Math.round(tbBox.height));
    expect(Math.round(dpBox.height)).toBe(Math.round(nbBox.height));
  });

  test("the calendar popup is not clipped by a narrow control", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" width="100%" dateFormat="MM/dd/yyyy" initialValue="05/15/2024" />`);
    await openCalendar(page);
    const table = page.locator('[data-part="table"]').first();
    await expect(table).toBeVisible();
    const overflow = await page
      .locator('[data-part="content"]')
      .first()
      .evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(overflow).toBe(false);
  });

  // GAP: unlike the core DatePicker (which leaves `width` to the framework's
  // universal layout, so px/% sizes apply to the root), DatePicker declares
  // `width` in its metadata to drive keyword sizing (100%/*/full → fullWidth,
  // auto → autoWidth). That opt-out means a concrete px/% width is not applied to
  // the root. Re-enable if DatePicker stops claiming `width` (and derives its
  // full-width layout another way) so the framework can size the root again.
  test.fixme("applies a px width to the root", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" width="200px" />`);
    const { width } = (await page.getByTestId("dp").boundingBox())!;
    expect(Math.round(width)).toBe(200);
  });

  test.fixme("applies a px width with a label", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" width="200px" label="Date" />`);
    const { width } = (await page.getByTestId("dp").boundingBox())!;
    expect(Math.round(width)).toBe(200);
  });

  test.fixme("applies a percentage width relative to its container", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack width="400px">
        <DatePicker testId="dp" width="50%" />
      </Stack>
    `);
    const { width } = (await page.getByTestId("dp").boundingBox())!;
    expect(Math.round(width)).toBe(200);
  });
});

// Inside a <Form>, a bound DatePicker is wrapped by FormBindingWrapper's
// ItemWithLabel, which renders the single requireLabelMode-decorated label. The
// component suppresses its own label in that context (no duplicate).
test.describe("Behaviors and Parts", () => {
  test("requireLabelMode='markRequired' shows an asterisk for required fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker label="Birth Date" required="true" requireLabelMode="markRequired" bindTo="birthDate" />
      </Form>
    `);
    const label = page.getByText("Birth Date");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markOptional' shows an optional tag for optional fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker label="Birth Date" required="false" requireLabelMode="markOptional" bindTo="birthDate" />
      </Form>
    `);
    const label = page.getByText("Birth Date");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='markBoth' marks required and optional fields distinctly", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker label="Required Field" required="true" requireLabelMode="markBoth" bindTo="f1" />
        <DatePicker label="Optional Field" required="false" requireLabelMode="markBoth" bindTo="f2" />
      </Form>
    `);
    await expect(page.getByText("Required Field")).toContainText("*");
    await expect(page.getByText("Optional Field")).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides the Form itemRequireLabelMode", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markRequired">
        <DatePicker label="Birth Date" required="false" requireLabelMode="markOptional" bindTo="birthDate" />
      </Form>
    `);
    const label = page.getByText("Birth Date");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits the Form itemRequireLabelMode when not specified", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markBoth">
        <DatePicker label="Required Field" required="true" bindTo="f1" />
        <DatePicker label="Optional Field" required="false" bindTo="f2" />
      </Form>
    `);
    await expect(page.getByText("Required Field")).toContainText("*");
    await expect(page.getByText("Optional Field")).toContainText("(Optional)");
  });
});

test.describe("Validation Feedback", () => {
  test("shows helper text and no concise icon when verbose feedback is on", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DatePicker testId="dp" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    await page.getByTestId("submit").click();
    await expect(page.getByText("This field is required")).toBeVisible();
    await expect(page.getByTestId("dp").locator('[class*="conciseValidation"]')).toHaveCount(0);
  });

  test("concise feedback prop on the input overrides the Form default", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DatePicker testId="dp" bindTo="input" verboseValidationFeedback="{false}" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    await page.getByTestId("submit").click();
    await expect(page.getByText("This field is required")).not.toBeVisible();
    await expect(page.getByTestId("dp").locator('[class*="conciseValidation"]')).toBeVisible();
  });

  test("does not duplicate the label when inside a Form", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="dp" label="Select date" labelPosition="top" />
      </Form>
    `);
    await expect(page.getByText("Select date")).toHaveCount(1);
  });

  test("shows a valid icon in concise mode when the field becomes valid", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DatePicker testId="dp" bindTo="input" required="{true}" validationMode="onChanged" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    await page.getByTestId("submit").click();
    // Select a day so the required field becomes valid.
    await openCalendar(page);
    await dayCell(page, 15).first().click();
    const concise = page.getByTestId("dp").locator('[class*="conciseValidation"]');
    await expect(concise).toBeVisible();
    await expect(concise.locator("[data-icon-name='checkmark']")).toBeVisible();
  });

  test("concise feedback shows the error message in a tooltip on hover", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DatePicker testId="dp" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);
    await page.getByTestId("submit").click();
    const concise = page.getByTestId("dp").locator('[class*="conciseValidation"]');
    await expect(concise).toBeVisible();
    await concise.hover();
    const tooltip = page.locator("[data-tooltip-container]");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("This field is required");
  });
});

test.describe("Range Mode Features", () => {
  test("range mode shows two months side by side", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" />`);
    await openCalendar(page);
    await expect(page.locator('[class*="_calendarMonth_"]')).toHaveCount(2);
  });

  test("range start and end days both use the selected background", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}" />`,
      {
        testThemeVars: {
          "backgroundColor-day-DatePicker--selected": "rgb(50, 100, 200)",
        },
      },
    );
    await openCalendar(page);
    const may = page.locator('[class*="_calendarMonth_"]').nth(0);
    const startCell = may.locator('[data-view="day"][data-range-start]').first();
    const endCell = may.locator('[data-view="day"][data-range-end]').first();
    await expect(startCell).toHaveCSS("background-color", "rgb(50, 100, 200)");
    await expect(endCell).toHaveCSS("background-color", "rgb(50, 100, 200)");
  });

  test("range mode shows prev and next chevrons", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePicker testId="dp" mode="range" inline />`);
    await expect(page.getByRole("button", { name: "Previous month" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Next month" }).first()).toBeVisible();
  });

  test("hover preview shows a background on intermediate dates", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/01/2024', to: '05/01/2024' }}" />`,
      {
        testThemeVars: {
          "backgroundColor-day-DatePicker--rangeMiddle": "rgb(230, 240, 255)",
        },
      },
    );
    await openCalendar(page);
    const months = page.locator('[class*="_calendarMonth_"]');
    const may = months.nth(0);
    // Start a fresh range on day 10, then hover day 15 — the days in between
    // must show the range-middle preview background.
    await dayCell(may, 10).first().click();
    await dayCell(may, 15).first().hover();
    await expect(dayCell(may, 12).first()).toHaveCSS("background-color", "rgb(230, 240, 255)");
  });

  test("didChange fires with a range object after Proceed", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" confirmRangeSelection="true"
        initialValue="{{ from: '05/01/2024', to: '05/01/2024' }}"
        onDidChange="(value) => testState = value" />
    `);
    await openCalendar(page);
    const may = page.locator('[class*="_calendarMonth_"]').nth(0);
    await dayCell(may, 10).first().click();
    await dayCell(may, 15).first().click();
    await page.getByRole("button", { name: "Proceed" }).click();
    await expect
      .poll(testStateDriver.testState)
      .toEqual(expect.objectContaining({ from: expect.any(String), to: expect.any(String) }));
  });

  test("auto-commit fires didChange with a range object on the second click", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/01/2024', to: '05/01/2024' }}"
        onDidChange="(value) => testState = value" />
    `);
    await openCalendar(page);
    const may = page.locator('[class*="_calendarMonth_"]').nth(0);
    await dayCell(may, 10).first().click();
    await dayCell(may, 15).first().click();
    await expect
      .poll(testStateDriver.testState)
      .toEqual(expect.objectContaining({ from: expect.any(String), to: expect.any(String) }));
  });

  test("Cancel discards the pending range and does not fire didChange", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker testId="dp" mode="range" dateFormat="MM/dd/yyyy" confirmRangeSelection="true"
        initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}"
        onDidChange="(value) => testState = value" />
    `);
    const inputs = page.getByTestId("dp").locator("input");
    await openCalendar(page);
    const may = page.locator('[class*="_calendarMonth_"]').nth(0);
    await dayCell(may, 20).first().click();
    await dayCell(may, 25).first().click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(inputs.nth(0)).toHaveValue("05/10/2024");
    await expect(inputs.nth(1)).toHaveValue("05/15/2024");
    expect(await testStateDriver.testState()).toBe(null);
  });
});
