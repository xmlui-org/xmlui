import { test, expect } from "../../testing/fixtures";
import { buttonThemeValues, buttonVariantValues } from "../../components/abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";

// --- variant & themeColor

// background color
const EXPECTED_BACKGROUND_COLOR = "rgb(255, 0, 0)";
buttonThemeValues.forEach((themeColor) => {
  test(`"solid" background color: "${themeColor}"`, async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button variant="solid" themeColor="${themeColor}" />`, {
      testThemeVars: {
        [`backgroundColor-Button-${themeColor}-solid`]: EXPECTED_BACKGROUND_COLOR,
      },
    });
    await expect((await createButtonDriver()).component).toHaveCSS(
      "background-color",
      EXPECTED_BACKGROUND_COLOR,
    );
  });
});

// content/label color
const EXPECTED_CONTENT_COLOR = "rgb(255, 255, 255)";
buttonVariantValues.forEach((variant) => {
  buttonThemeValues.forEach((themeColor) => {
    test(`"${variant}" content color: "${themeColor}"`, async ({
      initTestBed,
      createButtonDriver,
    }) => {
      await initTestBed(`<Button variant="${variant}" themeColor="${themeColor}" />`, {
        testThemeVars: {
          [`textColor-Button-${themeColor}-${variant}`]: EXPECTED_CONTENT_COLOR,
        },
      });
      await expect((await createButtonDriver()).component).toHaveCSS(
        "color",
        EXPECTED_CONTENT_COLOR,
      );
    });
  });
});

// border
const EXPECTED_BORDER_COLOR = "rgb(255, 0, 0)";
const EXPECTED_BORDER_WIDTH = "5px";
const EXPECTED_BORDER_STYLE = "dotted";
const EXPECTED_BORDER_RADIUS = "10px";
buttonVariantValues
  .filter((v) => v !== "ghost")
  .forEach((variant) => {
    buttonThemeValues.forEach((themeColor) => {
      test(`border: "${themeColor}" "${variant}" variant`, async ({
        initTestBed,
        createButtonDriver,
      }) => {
        await initTestBed(`<Button variant="${variant}" themeColor="${themeColor}" />`, {
          testThemeVars: {
            [`borderColor-Button-${themeColor}-${variant}`]: EXPECTED_BORDER_COLOR,
            [`borderWidth-Button-${themeColor}-${variant}`]: EXPECTED_BORDER_WIDTH,
            [`borderRadius-Button-${themeColor}-${variant}`]: EXPECTED_BORDER_RADIUS,
            [`borderStyle-Button-${themeColor}-${variant}`]: EXPECTED_BORDER_STYLE,
          },
        });

        const driver = await createButtonDriver();
        await expect(driver.component).toHaveCSS("border-color", EXPECTED_BORDER_COLOR);
        await expect(driver.component).toHaveCSS("border-width", EXPECTED_BORDER_WIDTH);
        await expect(driver.component).toHaveCSS("border-radius", EXPECTED_BORDER_RADIUS);
        await expect(driver.component).toHaveCSS("border-style", EXPECTED_BORDER_STYLE);
      });
    });
  });

buttonThemeValues.forEach((themeColor) => {
  test(`border: "${themeColor}" "ghost" variant`, async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button variant="ghost" themeColor="${themeColor}" />`, {
      testThemeVars: {
        [`borderWidth-Button-${themeColor}-ghost`]: EXPECTED_BORDER_WIDTH,
        [`borderRadius-Button-${themeColor}-ghost`]: EXPECTED_BORDER_RADIUS,
      },
    });
    const driver = await createButtonDriver();
    await expect(driver.component).toHaveCSS("border-width", EXPECTED_BORDER_WIDTH);
    await expect(driver.component).toHaveCSS("border-radius", EXPECTED_BORDER_RADIUS);
  });
});

// fonts
const EXPECTED_FONT_FAMILY = "Arial, sans-serif";
const EXPECTED_FONT_SIZE = "20px";
const EXPECTED_FONT_WEIGHT = "200";
buttonVariantValues.forEach((variant) => {
  buttonThemeValues.forEach((themeColor) => {
    test(`font: "${themeColor}" "${variant}" variant`, async ({
      initTestBed,
      createButtonDriver,
    }) => {
      await initTestBed(`<Button variant="${variant}" themeColor="${themeColor}" />`, {
        testThemeVars: {
          [`fontFamily-Button-${themeColor}-${variant}`]: EXPECTED_FONT_FAMILY,
          [`fontSize-Button-${themeColor}-${variant}`]: EXPECTED_FONT_SIZE,
          [`fontWeight-Button-${themeColor}-${variant}`]: EXPECTED_FONT_WEIGHT,
        },
      });
      const driver = await createButtonDriver();
      await expect(driver.component).toHaveCSS("font-family", EXPECTED_FONT_FAMILY);
      await expect(driver.component).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
      await expect(driver.component).toHaveCSS("font-weight", EXPECTED_FONT_WEIGHT);
    });
  });
});

const variantsWithBorder = buttonVariantValues.filter((v) => v === "solid" || v === "outlined");
variantsWithBorder.forEach((variant) => {
  buttonThemeValues.forEach((themeColor) => {
    const CODE = `<Button variant="${variant}" themeColor="${themeColor}" />`;

    test(`border ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(255, 0, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";

      await initTestBed(CODE, {
        testThemeVars: {
          [`border-Button-${themeColor}-${variant}`]: `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
    });

    test(`bordercolor ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(0, 128, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderColor-Button-${themeColor}-${variant}`]: EXPECTED_COLOR,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
    });

    test(`border, border-color ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(255, 0, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";
      const UPDATED = "rgb(0, 128, 0)";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderColor-Button-${themeColor}-${variant}`]: UPDATED,
          [`border-Button-${themeColor}-${variant}`]: `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).toHaveCSS("border-top-color", UPDATED);
      await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-right-color", UPDATED);
      await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-bottom-color", UPDATED);
      await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-left-color", UPDATED);
      await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
    });

    test(`border-style ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(0, 128, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderStyle-Button-${themeColor}-${variant}`]: EXPECTED_STYLE,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
    });

    test(`border, border-style ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(255, 0, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";
      const UPDATED = "double";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderStyle-Button-${themeColor}-${variant}`]: UPDATED,
          [`border-Button-${themeColor}-${variant}`]: `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-top-style", UPDATED);
      await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-right-style", UPDATED);
      await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-bottom-style", UPDATED);
      await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).toHaveCSS("border-left-style", UPDATED);
    });

    test(`border-thickness ${variant} ${themeColor}`, async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(0, 128, 0)";
      const EXPECTED_WIDTH = "8px";
      const EXPECTED_STYLE = "dotted";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderWidth-Button-${themeColor}-${variant}`]: EXPECTED_WIDTH,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
      await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
    });

    test(`border, border-thickness ${variant} ${themeColor}`, 
      SKIP_REASON.TEST_NOT_WORKING("borderWidth is disregarded because the regular border overrides it... somehow"),
      async ({ initTestBed, createButtonDriver }) => {
      const EXPECTED_COLOR = "rgb(255, 0, 0)";
      const EXPECTED_WIDTH = "5px";
      const EXPECTED_STYLE = "dotted";
      const UPDATED = "12px";

      await initTestBed(CODE, {
        testThemeVars: {
          [`borderWidth-Button-${themeColor}-${variant}`]: UPDATED,
          [`border-Button-${themeColor}-${variant}`]: `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        },
      });
      const component = (await createButtonDriver()).component;

      await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-top-width", UPDATED);
      await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-right-width", UPDATED);
      await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-bottom-width", UPDATED);
      await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
      await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
      await expect(component).toHaveCSS("border-left-width", UPDATED);
      await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
    });
  });
});
