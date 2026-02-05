import { PART_INPUT } from "../../components-core/parts";
import { validationStatusValues } from "../abstractions";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });

  test("renders default 5 stars", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByRole("button", { name: `Set rating to ${i}` })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Set rating to 6" })).not.toBeVisible();
  });

  test("sets initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="3" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("3", { timeout: 2000 });
  });

  test("accepts empty initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    const valueText = await page.getByTestId("value").textContent();
    expect(valueText === "" || valueText === "undefined").toBeTruthy();
  });

  [
    { label: "int", value: 1, expected: "1" },
    { label: "max 5", value: 5, expected: "5" },
  ].forEach(({ label, value, expected }) => {
    test(`handles initialValue ${label} correctly`, async ({ initTestBed, page }) => {
      await initTestBed(`
        <Fragment>
          <RatingInput id="r" initialValue="${value}" />
          <Text testId="value">{r.value}</Text>
        </Fragment>
      `);
      await expect(page.getByTestId("value")).toHaveText(expected, { timeout: 2000 });
    });
  });

  test("maxRating renders correct number of stars", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="10" />`);
    for (let i = 1; i <= 10; i++) {
      await expect(
        page.getByRole("button", { name: `Set rating to ${i}`, exact: true }),
      ).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Set rating to 11" })).not.toBeVisible();
  });

  test("maxRating 1 renders single star", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="1" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 2" })).not.toBeVisible();
  });

  test("maxRating clamps to 1-10", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="0" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });

  test("placeholder visible when value empty", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput placeholder="Rate this" />`);
    await expect(page.getByText("Rate this")).toBeVisible();
  });

  test("placeholder hidden when value set", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput placeholder="Rate this" initialValue="1" />`);
    await expect(page.getByText("Rate this")).not.toBeVisible({ timeout: 2000 });
  });

  test("clicking star updates value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await page.getByRole("button", { name: "Set rating to 4" }).click();
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("clicking different star updates value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="2" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await page.getByRole("button", { name: "Set rating to 5" }).click();
    await expect(page.getByTestId("value")).toHaveText("5");
  });

  test("enabled=false disables interaction", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" enabled="false" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    const firstStar = container.getByRole("button", { name: "Set rating to 1", exact: true });
    await expect(container).toHaveAttribute("aria-disabled", "true");
    await expect(firstStar).toBeDisabled();
    await container.getByRole("button", { name: "Set rating to 3", exact: true }).click({ force: true });
    const valueText = await page.getByTestId("value").textContent();
    expect(valueText === "" || valueText === "undefined").toBeTruthy();
  });

  test("readOnly prevents value change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" readOnly="true" initialValue="2" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("2");
    const inputPart = page.locator(`[data-part-id="${PART_INPUT}"]`);
    const setRating5 = inputPart.getByRole("button", { name: "Set rating to 5", exact: true });
    await expect(setRating5).toBeVisible();
    await setRating5.click({ force: true });
    await expect(page.getByTestId("value")).toHaveText("2");
  });

  test("handles invalid maxRating gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="invalid" />`);
    await expect(
      page.getByRole("button", { name: "Set rating to 1", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Set rating to 5", exact: true }),
    ).toBeVisible();
  });

  test("handles initialValue exceeding maxRating", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" maxRating="3" initialValue="5" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("5");
  });

  test("required does not prevent rendering", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput required="true" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("each star has aria-label", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="3" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 2" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 3" })).toBeVisible();
  });

  test("container has aria-disabled when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput enabled="false" />`);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveAttribute("aria-disabled", "true");
  });

  test("container has aria-disabled false when enabled", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveAttribute("aria-disabled", "false");
  });

  test("star buttons are disabled when enabled=false", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput enabled="false" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeDisabled();
  });

  test("container is focusable", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await container.focus();
    await expect(container).toBeFocused();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("color-star-RatingInput applies to inactive star", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RatingInput initialValue="0" />`,
      { testThemeVars: { "color-star-RatingInput": "rgb(255, 0, 0)" } },
    );
    const star = page.locator(`[data-part-id="${PART_INPUT}"]`).getByRole("button", { name: "Set rating to 1" });
    await expect(star).toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("color-star-RatingInput--active applies to filled star", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RatingInput initialValue="1" />`,
      { testThemeVars: { "color-star-RatingInput--active": "rgb(0, 128, 0)" } },
    );
    const star = page.locator(`[data-part-id="${PART_INPUT}"]`).getByRole("button", { name: "Set rating to 1" });
    await expect(star).toHaveCSS("color", "rgb(0, 128, 0)");
  });

  test("textColor-placeholder-RatingInput applies to placeholder", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RatingInput placeholder="Rate" />`,
      { testThemeVars: { "textColor-placeholder-RatingInput": "rgb(0, 0, 255)" } },
    );
    const placeholder = page.locator(`[data-part-id="${PART_INPUT}"]`).getByText("Rate");
    await expect(placeholder).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("outlineColor-RatingInput--error applies when validationStatus error", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<RatingInput validationStatus="error" />`,
      { testThemeVars: { "outlineColor-RatingInput--error": "rgb(200, 0, 0)" } },
    );
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveCSS("outline-color", "rgb(200, 0, 0)");
  });

  test("outlineColor-RatingInput--warning applies when validationStatus warning", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<RatingInput validationStatus="warning" />`,
      { testThemeVars: { "outlineColor-RatingInput--warning": "rgb(200, 100, 0)" } },
    );
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveCSS("outline-color", "rgb(200, 100, 0)");
  });

  test("outlineColor-RatingInput--valid applies when validationStatus valid", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<RatingInput validationStatus="valid" />`,
      { testThemeVars: { "outlineColor-RatingInput--valid": "rgb(0, 150, 0)" } },
    );
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveCSS("outline-color", "rgb(0, 150, 0)");
  });

  test("opacity-RatingInput--disabled applies when disabled", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RatingInput enabled="false" />`,
      { testThemeVars: { "opacity-RatingInput--disabled": "0.3" } },
    );
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveCSS("opacity", "0.3");
  });

  test("gap-RatingInput applies between stars", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RatingInput maxRating="2" />`,
      { testThemeVars: { "gap-RatingInput": "12px" } },
    );
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).toHaveCSS("gap", "12px");
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange fires on star click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RatingInput onDidChange="arg => testState = arg" />
    `);
    await page.getByRole("button", { name: "Set rating to 3" }).click();
    await expect.poll(testStateDriver.testState).toEqual(3);
  });

  test("didChange passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RatingInput initialValue="1" onDidChange="arg => testState = arg" />
    `);
    await page.getByRole("button", { name: "Set rating to 5" }).click();
    await expect.poll(testStateDriver.testState).toEqual(5);
  });

  test("gotFocus fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RatingInput onGotFocus="testState = 'focused'" />
    `);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await container.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("lostFocus fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RatingInput onLostFocus="testState = 'blurred'" />
    `);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await container.focus();
    await container.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("events do not fire when disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RatingInput enabled="false" onDidChange="testState = 'changed'" onGotFocus="testState = 'focused'" />
    `);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await container.getByRole("button", { name: "Set rating to 2", exact: true }).click({ force: true });
    await container.focus();
    await expect.poll(testStateDriver.testState).toEqual(null);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("value API returns current state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="4" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("4");
  });

  test("value API updates after click", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="1" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await page.getByRole("button", { name: "Set rating to 3" }).click();
    await expect(page.getByTestId("value")).toHaveText("3");
  });

  test("setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Button testId="setBtn" onClick="r.setValue(5)" label="{r.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("5");
  });

  test("setValue API from number", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="1" />
        <Button testId="setBtn" onClick="r.setValue(3)" label="{r.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("3");
  });

  test("focus API focuses the container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" />
        <Button testId="focusBtn" onClick="r.focus()" />
      </Fragment>
    `);
    const container = page.locator(`[data-part-id="${PART_INPUT}"]`);
    await expect(container).not.toBeFocused();
    await page.getByTestId("focusBtn").click();
    await expect(container).toBeFocused();
  });

  test("setValue triggers didChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <RatingInput id="r" onDidChange="arg => testState = arg" />
        <Button testId="setBtn" onClick="r.setValue(4)" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(4);
  });

  test("bindTo syncs $data and value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <RatingInput id="r" bindTo="rating" />
        <Button testId="setBtn" onClick="r.setValue(3)" />
        <Text testId="dataValue">{$data.rating}</Text>
        <Text testId="compValue">{r.value}</Text>
      </Form>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("dataValue")).toHaveText("3");
    await expect(page.getByTestId("compValue")).toHaveText("3");
  });

  test("setValue does not update when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" enabled="false" initialValue="2" />
        <Button testId="setBtn" onClick="r.setValue(5)" label="{r.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("2");
  });

  test("setValue with invalid value leaves value unchanged", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="3" />
        <Button testId="setBtn" onClick="r.setValue('invalid')" label="{r.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("3");
  });
});

// =============================================================================
// VALIDATION TESTS
// =============================================================================

test.describe("Validation", () => {
  test("handles invalid validationStatus gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput validationStatus="invalid" />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });

  validationStatusValues.forEach((status) => {
    test(`validationStatus "${status}" renders`, async ({ initTestBed, page }) => {
      await initTestBed(`<RatingInput validationStatus="${status}" />`);
      await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
    });
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput />`);
    await expect(page.getByRole("button", { name: "Set rating to 1" })).toBeVisible();
  });

  test("handles initialValue null", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="{null}" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("");
  });

  test("handles initialValue undefined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <RatingInput id="r" initialValue="{undefined}" />
        <Text testId="value">{r.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("");
  });

  test("maxRating 10 renders 10 stars", async ({ initTestBed, page }) => {
    await initTestBed(`<RatingInput maxRating="10" />`);
    await expect(page.getByRole("button", { name: "Set rating to 10" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Set rating to 11" })).not.toBeVisible();
  });

  test("multiple RatingInputs work independently", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <div testId="rating-a">
          <RatingInput id="a" />
        </div>
        <div testId="rating-b">
          <RatingInput id="b" />
        </div>
        <Text testId="value-a">{a.value}</Text>
        <Text testId="value-b">{b.value}</Text>
      </Fragment>
    `);
    const firstInput = page.getByTestId("rating-a").locator(`[data-part-id="${PART_INPUT}"]`);
    const secondInput = page.getByTestId("rating-b").locator(`[data-part-id="${PART_INPUT}"]`);
    await firstInput.getByRole("button", { name: "Set rating to 2", exact: true }).click();
    await secondInput.getByRole("button", { name: "Set rating to 4", exact: true }).click();
    await expect(page.getByTestId("value-a")).toHaveText("2");
    await expect(page.getByTestId("value-b")).toHaveText("4");
  });
});
