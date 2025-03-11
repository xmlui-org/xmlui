import { expect, test } from "./fixtures";
import { getFullRectangle, initApp, initThemedApp } from "./component-test-helpers";

test("enabled property", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <VStack margin="1rem" gap="0.8rem">
        Enabled checkbox:
        <Checkbox testId="cbEna" enabled="true" />
        Disabled checkbox:
        <Checkbox testId="cbDis" enabled="false" />
      </VStack>`,
  });

  await expect(page.getByTestId("cbEna")).toBeEnabled();
  await expect(page.getByTestId("cbDis")).toBeDisabled();
});

test("indeterminate", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Checkbox
        label="Indeterminate Checkbox"
        indeterminate="{true}"/>
      `,
  });

  // there is an indeterminate element in the page
  await page.locator(":indeterminate").check();
  await expect(page.getByRole("checkbox")).toBeChecked();
});

test("initialValue true", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <VStack>
        <Checkbox testId="cbCheck" initialValue="{true}" />
        <Checkbox testId="cbUnckd" initialValue="{false}" />
      </VStack>
    `,
  });

  await expect(page.getByTestId("cbCheck")).toBeChecked();
  await expect(page.getByTestId("cbUnckd")).not.toBeChecked();
});

test("label", async ({ page }) => {
  const EXPECTED_LABEL = "test checkbox label";
  await initApp(page, {
    entryPoint: `
      <Checkbox
        label="${EXPECTED_LABEL}"
        testId="cb0" />
      `,
  });

  const labelCheckbox = page.getByLabel(EXPECTED_LABEL, { exact: true });
  await expect(labelCheckbox).toBeVisible();
  await labelCheckbox.click();
  await expect(labelCheckbox).toBeChecked();
});

test("labelPosition", async ({ page }) => {
  const labelTop = "Top label";
  const labelStart = "Right label (ltr)";
  const labelBottom = "Bottom label";
  const labelEnd = "Left label (ltr)";

  await initApp(page, {
    entryPoint: `
      <VStack margin="1rem" gap="0.8rem">
        <Checkbox testId="checkTop" label="${labelTop}" labelPosition="top" />
        <Checkbox testId="checkRight" label="${labelEnd}" labelPosition="end" />
        <Checkbox testId="checkBottom" label="${labelBottom}" labelPosition="bottom" />
        <Checkbox testId="checkLeft" label="${labelStart}" labelPosition="start" />
      </VStack>
      `,
  });

  const { bottom: labelTopPosBottom } = await getFullRectangle(page.getByText(labelTop, { exact: true }));
  const { top: checkTopPosTop } = await getFullRectangle(page.getByLabel(labelTop, { exact: true }));

  const { left: labelRightPosLeft } = await getFullRectangle(page.getByText(labelEnd, { exact: true }));
  const { right: checkRightPosRight } = await getFullRectangle(page.getByLabel(labelEnd, { exact: true }));

  const { top: labelBottomPosTop } = await getFullRectangle(page.getByText(labelBottom, { exact: true }));
  const { bottom: checkBottomPosBottom } = await getFullRectangle(page.getByLabel(labelBottom, { exact: true }));

  const { right: labelLeftPosRight } = await getFullRectangle(page.getByText(labelStart, { exact: true }));
  const { left: checkLeftPosLeft } = await getFullRectangle(page.getByLabel(labelStart, { exact: true }));

  expect(labelTopPosBottom).toBeLessThan(checkTopPosTop);
  expect(labelRightPosLeft).toBeGreaterThan(checkRightPosRight);
  expect(labelBottomPosTop).toBeGreaterThan(checkBottomPosBottom);
  expect(labelLeftPosRight).toBeLessThan(checkLeftPosLeft);
});

test("readOnly", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Checkbox initialValue="true" readOnly="true" />`,
  });

  const cb = page.getByRole("checkbox");
  await cb.check();
  await expect(cb).toBeChecked();
});

test("value", async ({ page }) => {
  const EXPECTED_TEXT = "This only shows if the checkbox is checked";
  await initApp(page, {
    entryPoint: `
      <VStack>
        <Checkbox id="cb" initialValue="false" />
        <Text when="{cb.value}">${EXPECTED_TEXT}</Text>
      </VStack>`,
  });

  const textToggleable = page.getByText(EXPECTED_TEXT);

  await expect(textToggleable).not.toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(textToggleable).toBeVisible();
});

test("setValue", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <VStack margin="1rem" gap="0.5rem">
        <Checkbox initialValue="{false}" id="checkbox" />
        <HStack gap="0.5rem">
          <Button 
            testId="btnCheck"
            label="Check" 
            onClick="checkbox.setValue(true)" />
          <Button 
            testId="btnUncheck"
            label="Uncheck" 
            onClick="checkbox.setValue(false)" />
        </HStack>
      </VStack>
      `,
  });

  const cb = page.getByRole("checkbox");
  const btnCheck = page.getByTestId("btnCheck");
  const btnUncheck = page.getByTestId("btnUncheck");

  await expect(cb).not.toBeChecked();
  await btnCheck.click();
  await expect(cb).toBeChecked();
  await btnUncheck.click();
  await expect(cb).not.toBeChecked();
});

test("onDidChange", async ({ page }) => {
  const EXPECTED_TEXT = "This only shows after the checkbox has changed";
  await initApp(page, {
    entryPoint: `
      <VStack gap="0.5rem" var.changes="">
        <Checkbox label="Changeable" onDidChange="changes = '${EXPECTED_TEXT}'" />
        <Text value="{changes}" />
      </VStack>`,
  });

  const textToggleable = page.getByText(EXPECTED_TEXT);

  await expect(textToggleable).not.toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(textToggleable).toBeVisible();
});

test("gotFocus", async ({ page }) => {
  const EXPECTED_TEXT = "This only shows after the checkbox was focused on";
  await initApp(page, {
    entryPoint: `
      <VStack var.focused="{false}" gap="0.5rem" >
        <Checkbox
          initialValue="{false}"
          onGotFocus="focused = true"
        />
        <Text when="{focused}" value="${EXPECTED_TEXT}" />
      </VStack>`,
  });

  const textToggleable = page.getByText(EXPECTED_TEXT);

  await expect(textToggleable).not.toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(textToggleable).toBeVisible();
});

test("lostFocus", async ({ page }) => {
  const EXPECTED_TEXT = "This only shows after the checkbox lost focus";
  await initApp(page, {
    entryPoint: `
      <VStack var.lostFocus="{false}" gap="0.5rem" >
        <Checkbox
          initialValue="{false}"
          onLostFocus="lostFocus = true"
        />
        <Text when="{!lostFocus}" value="${EXPECTED_TEXT}" />
      </VStack>`,
  });

  const textToggleable = page.getByText(EXPECTED_TEXT);

  await expect(textToggleable).toBeVisible();
  await page.getByRole("checkbox").check();
  await expect(textToggleable).toBeVisible();
  await textToggleable.click();
  await expect(textToggleable).not.toBeVisible();
});

// --- Theme variable tests ---

const COLOR_RED = "rgb(255, 0, 0)" as const;
const COLOR_GREEN = "rgb(0, 255, 0)" as const;
const COLOR_BLUE = "rgb(0, 0, 255)" as const;
const COLOR_BLACK = "rgb(0, 0, 0)" as const;
const ERROR_LEVELS = ["default", "warning", "error", "valid"] as const;

// Set the background & border color for the checkbox (default, warning, error, valid variants; checked/unchecked)
ERROR_LEVELS.forEach((errorLevel) => {
  test(`theme: bg & border (${errorLevel})`, async ({ page }) => {
    const EXPECTED_BACKGROUND = COLOR_BLUE;
    const EXPECTED_BORDER = COLOR_BLUE;
    const EXPECTED_CHECKED_BACKGROUND = COLOR_RED;
    const EXPECTED_CHECKED_BORDER = COLOR_RED;

    const validationStatus = errorLevel === "default" ? "" : `validationStatus="${errorLevel}"`;
    // TEMP: need to rename validation to either valid or success
    const themeErrorLevel = errorLevel === "valid" ? "success" : errorLevel;
    // END TEMP

    const background = errorLevel === "default" ? `color-bg-Checkbox` : `color-bg-Checkbox-${themeErrorLevel}`;
    const checkedBackground =
      errorLevel === "default" ? `color-bg-checked-Checkbox` : `color-bg-checked-Checkbox-${themeErrorLevel}`;
    const border = `color-border-Checkbox-${themeErrorLevel}`;
    const checkedBorder =
      errorLevel === "default" ? `color-border-checked-Checkbox` : `color-border-checked-Checkbox-${themeErrorLevel}`;

    await initThemedApp(
      page,
      `<Stack>
        <Checkbox testId="checkbox1" initialValue="false" ${validationStatus} />
        <Checkbox testId="checkbox2" initialValue="true" ${validationStatus} />
      </Stack>`,
      {
        themeVars: {
          [border]: EXPECTED_BORDER,
          [background]: EXPECTED_BACKGROUND,
          [checkedBorder]: EXPECTED_CHECKED_BORDER,
          [checkedBackground]: EXPECTED_CHECKED_BACKGROUND,
        },
      }
    );

    await expect(page.getByTestId("checkbox1")).toHaveCSS("background-color", EXPECTED_BACKGROUND);
    await expect(page.getByTestId("checkbox1")).toHaveCSS("border-color", EXPECTED_BORDER);
    await expect(page.getByTestId("checkbox2")).toHaveCSS("background-color", EXPECTED_CHECKED_BACKGROUND);
    await expect(page.getByTestId("checkbox2")).toHaveCSS("border-color", EXPECTED_CHECKED_BORDER);
  });
});

// Input is overriden by Checkbox -> higher specificity
test(`theme: checkbox overrides input`, async ({ page }) => {
  const TO_OVERRIDE_COLORS = COLOR_GREEN;
  const EXPECTED_BACKGROUND = COLOR_BLUE;
  const EXPECTED_CHECKED_BACKGROUND = COLOR_RED;

  await initThemedApp(
    page,
    `<Stack>
      <Checkbox testId="checkbox1" initialValue="false" />
      <Checkbox testId="checkbox2" initialValue="true" />
    </Stack>`,
    {
      themeVars: {
        "color-bg-Input": TO_OVERRIDE_COLORS,
        "color-bg-checked-Input": TO_OVERRIDE_COLORS,
        "color-bg-Checkbox": EXPECTED_BACKGROUND,
        "color-bg-checked-Checkbox": EXPECTED_CHECKED_BACKGROUND,
      },
    }
  );

  await expect(page.getByTestId("checkbox1")).toHaveCSS("background-color", EXPECTED_BACKGROUND);
  await expect(page.getByTestId("checkbox2")).toHaveCSS("background-color", EXPECTED_CHECKED_BACKGROUND);
});

// focus state checks
ERROR_LEVELS.forEach((errorLevel) => {
  test(`theme: focus (${errorLevel})`, async ({ page }) => {  
    const EXPECTED_OUTLINE_COLOR = COLOR_BLUE;
    const EXPECTED_OUTLINE_THICKNESS = "4px" as const;
    const EXPECTED_OUTLINE_STYLE = "dotted" as const;
    const EXPECTED_OUTLINE_OFFSET = "2px" as const;
    
    const validationStatus = errorLevel === "default" ? "" : `validationStatus="${errorLevel}"`;
    // TEMP: need to rename validation to either valid or success
    const themeErrorLevel = errorLevel === "valid" ? "success" : errorLevel;
    // END TEMP

    const outlineThickness = `outlineWidth-Checkbox-${themeErrorLevel}--focus`;
    const outlineColor = `outlineColor-Checkbox-${themeErrorLevel}--focus`;
    const outlineStyle = `outlineStyle-Checkbox-${themeErrorLevel}--focus`;
    const outlineOffset = `outlineOffset-Checkbox-${themeErrorLevel}--focus`;

    await initThemedApp(
      page,
      `<Checkbox testId="checkbox1" initialValue="false" ${validationStatus} />`,
      {
        themeVars: {
          [outlineThickness]: EXPECTED_OUTLINE_THICKNESS,
          [outlineColor]: EXPECTED_OUTLINE_COLOR,
          [outlineStyle]: EXPECTED_OUTLINE_STYLE,
          [outlineOffset]: EXPECTED_OUTLINE_OFFSET,
        },
      }
    );

    const checkbox = page.getByTestId("checkbox1");
    await checkbox.focus();

    await expect(checkbox).toHaveCSS("outline-width", EXPECTED_OUTLINE_THICKNESS);
    await expect(checkbox).toHaveCSS("outline-color", EXPECTED_OUTLINE_COLOR);
    await expect(checkbox).toHaveCSS("outline-style", EXPECTED_OUTLINE_STYLE);
    await expect(checkbox).toHaveCSS("outline-offset", EXPECTED_OUTLINE_OFFSET);
  });
});

// Disabled state background color check
test(`theme: disabled`, async ({ page }) => {
  const EXPECTED_COLORS = COLOR_BLACK;

  await initThemedApp(
    page,
    `<Stack>
      <Checkbox testId="checkbox1" initialValue="false" enabled="false" />
      <Checkbox testId="checkbox2" initialValue="true" enabled="false" />
    </Stack>`,
    {
      themeVars: {
        "color-bg-Checkbox--disabled": EXPECTED_COLORS,
        "color-border-Checkbox--disabled": EXPECTED_COLORS,
      },
    }
  );

  await expect(page.getByTestId("checkbox1")).toHaveCSS("background-color", EXPECTED_COLORS);
  await expect(page.getByTestId("checkbox1")).toHaveCSS("border-color", EXPECTED_COLORS);
  await expect(page.getByTestId("checkbox2")).toHaveCSS("background-color", EXPECTED_COLORS);
  await expect(page.getByTestId("checkbox2")).toHaveCSS("border-color", EXPECTED_COLORS);
});

// Border radius check
ERROR_LEVELS.forEach((errorLevel) => {
  test(`theme: border borderRadius (${errorLevel})`, async ({ page }) => {  
    const EXPECTED_BORDER_RADIUS = "4px" as const;
    
    const validationStatus = errorLevel === "default" ? "" : `validationStatus="${errorLevel}"`;
    // TEMP: need to rename validation to either valid or success
    const themeErrorLevel = errorLevel === "valid" ? "success" : errorLevel;
    // END TEMP

    const radius = `borderRadius-Checkbox-${themeErrorLevel}`;

    await initThemedApp(
      page,
      `<Checkbox testId="checkbox1" initialValue="false" ${validationStatus} />`,
      {
        themeVars: {
          [radius]: EXPECTED_BORDER_RADIUS,
        },
      }
    );

    await expect(page.getByTestId("checkbox1")).toHaveCSS("border-radius", EXPECTED_BORDER_RADIUS);
  });
});
