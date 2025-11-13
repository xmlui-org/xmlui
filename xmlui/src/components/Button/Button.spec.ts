import { getBorders, getBounds, getPaddings } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import {
  alignmentOptionValues,
  buttonTypeValues,
  buttonThemeValues,
  buttonVariantValues,
  type IconPosition,
} from "../../components/abstractions";
import type { ComponentDriver } from "../../testing/ComponentDrivers";
import { sizeValues } from "../abstractions";

// --- Smoke

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button />`);
    await expect((await createButtonDriver()).component).toBeAttached();
  });

  // --- label

  test("renders ASCII text in label", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button label="hello" />`);
    await expect((await createButtonDriver()).component).toHaveText("hello");
  });

  test("renders Unicode text in label", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button label="😀" />`);
    await expect((await createButtonDriver()).component).toHaveText("😀");
  });

  // --- icon

  test("can render icon", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button icon="test" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    await expect((await createButtonDriver()).getIcons().first()).toBeVisible();
  });

  // --- enabled

  test("has enabled state", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button enabled="true" />`);
    await expect((await createButtonDriver()).component).toBeEnabled();
  });

  test("has disabled state", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button enabled="false" />`);
    await expect((await createButtonDriver()).component).toBeDisabled();
  });

  // --- click

  test("click event fires", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`<Button onClick="testState = true" />`);
    await (await createButtonDriver()).click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  // --- variant & themeColor

  // background color
  const EXPECTED_BACKGROUND_COLOR = "rgb(255, 0, 0)";
  buttonThemeValues.forEach((themeColor) => {
    test(`"solid" background color: "${themeColor}"`, async ({
      initTestBed,
      createButtonDriver,
    }) => {
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

  // --- Accessibility

  test("icon-only button has accessible name", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button icon="test" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    await expect((await createButtonDriver()).component).toHaveText("test");
  });

  test("icon & label button uses label name only", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button icon="test" label="label" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    await expect((await createButtonDriver()).component).toHaveText("label");
  });

  test("icon-only button uses contextualLabel", async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button icon="test" contextualLabel="label" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    await expect((await createButtonDriver()).component).toHaveText("label");
  });

  test("icon, label, contextualLabel button uses label", async ({
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`<Button icon="test" label="label" contextualLabel="contextLabel" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    await expect((await createButtonDriver()).component).toHaveText("label");
  });
});

// --- E2E

// --- label

// Label inputs resolved with converting them to a string
[
  { label: "null", input: null, toExpect: "null" },
  { label: "undefined", input: undefined, toExpect: "undefined" },
  { label: "empty object", input: {}, toExpect: "[object Object]" },
  { label: "object", input: { a: 1, b: "hi" }, toExpect: "[object Object]" },
  { label: "empty array", input: [], toExpect: undefined },
  { label: "array", input: [1, 2, 3], toExpect: "1,2,3" },
  { label: "arrow function returning string", input: "{() => ''}", toExpect: "[object Object]" },
  {
    label: "function returning string",
    input: "{function () { return ''; }}",
    toExpect: "[object Object]",
  },
  {
    label: "IIFE returning string",
    input: "{(function () { return 'hello'; })()}",
    toExpect: "hello",
  },
].forEach((type) => {
  test(`if label is ${type.label} renders label as "${type.toExpect}"`, async ({
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`<Button label="${type.input}" />`);
    await expect((await createButtonDriver()).component).toHaveExplicitLabel(type.toExpect);
  });
});

test("text node as children are same as setting label", async ({
  initTestBed,
  createButtonDriver,
}) => {
  await initTestBed(`<Button>hello</Button>`);
  await expect((await createButtonDriver()).component).toHaveExplicitLabel("hello");
});

test("ignores label property if children present", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button label="hello">world</Button>`);
  await expect((await createButtonDriver()).component).toHaveExplicitLabel("world");
});

test("renders XMLUI Text component as child", async ({
  initTestBed,
  createButtonDriver,
  createTextDriver,
}) => {
  await initTestBed(`<Button label="hello"><Text testId="text">world</Text></Button>`);
  await expect((await createButtonDriver()).component).not.toHaveExplicitLabel("hello");
  await expect((await createTextDriver("text")).component).toHaveText("world");
});

test("renders XMLUI Complex component as child", async ({
  initTestBed,
  createButtonDriver,
  createCardDriver,
}) => {
  await initTestBed(
    `<Button label="hello"><Card testId="card" title="Button">Content</Card></Button>`,
  );
  await expect((await createButtonDriver()).component).not.toHaveExplicitLabel("hello");
  await expect((await createCardDriver("card")).component).toBeAttached();
});

// --- icon

test("renders icon and label", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button icon="test" label="hello" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  const driver = await createButtonDriver();

  await expect(driver.component).toHaveText("hello");
  await expect(driver.getIcons().first()).toBeVisible();
});

test("renders icon if children present", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button icon="test">Hello World</Button>`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect((await createButtonDriver()).getIcons().first()).toBeVisible();
});

[
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "empty array", value: [] },
  { label: "array", value: [] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test(`does not render icon if icon is of type ${type.label}`, async ({
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`<Button icon="${type.value}" />`);
    await expect((await createButtonDriver()).getIcons().first()).not.toBeAttached();
  });
});

test("renders if icon is not found and label is present", async ({
  initTestBed,
  createButtonDriver,
}) => {
  await initTestBed(`<Button icon="_" label="hello" />`);
  const driver = await createButtonDriver();

  await expect(driver.getIcons().first()).not.toBeAttached();
  await expect(driver.component).toHaveText("hello");
});

// --- iconPosition

const iconPositionCases: {
  position: "left" | "right";
  value: IconPosition;
}[] = [
  { position: "left", value: "start" },
  { position: "right", value: "end" },
];

// This is a helper function to calculate the icon position
async function iconPositionCalculation(buttonDriver: ComponentDriver, iconDriver: ComponentDriver) {
  const buttonBounds = await getBounds(buttonDriver.component);
  const buttonPadding = await getPaddings(buttonDriver.component);
  const buttonBorders = await getBorders(buttonDriver);
  const { left: iconLeft, right: iconRight } = await getBounds(iconDriver.component);
  const buttonContentLeft =
    buttonBounds.left + buttonBorders.left.width.value + buttonPadding.left.value;
  const buttonContentRight =
    buttonBounds.right - buttonBorders.right.width.value - buttonPadding.right.value;
  return { buttonContentLeft, buttonContentRight, iconLeft, iconRight };
}

iconPositionCases.forEach(({ value }) => {
  test(`iconPosition=${value} leaves icon in middle`, async ({
    initTestBed,
    createButtonDriver,
    createIconDriver,
  }) => {
    await initTestBed(`<Button icon="test" iconPosition="${value}" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    const buttonDriver = await createButtonDriver();
    const iconDriver = await createIconDriver(buttonDriver.getIcons().first());
    const { buttonContentLeft, buttonContentRight, iconLeft, iconRight } =
      await iconPositionCalculation(buttonDriver, iconDriver);

    expect(buttonContentLeft).toBeCloseTo(iconLeft, 5);
    expect(buttonContentRight).toBeCloseTo(iconRight, 5);
  });
});

// With label
iconPositionCases.forEach(({ position, value }) => {
  test(`iconPosition=${value} places icon on the ${position} of label`, async ({
    initTestBed,
    createButtonDriver,
    createIconDriver,
  }) => {
    await initTestBed(`<Button icon="test" label="hello" iconPosition="${value}" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    const buttonDriver = await createButtonDriver();
    const iconDriver = await createIconDriver(buttonDriver.getIcons().first());
    const { buttonContentLeft, buttonContentRight, iconLeft, iconRight } =
      await iconPositionCalculation(buttonDriver, iconDriver);

    // Depending on orientation, the icon's leftmost and rightmost points fall shorter
    // compared to the button's leftmost and rightmost points because of the label
    if (value === "start") {
      expect(buttonContentLeft).toBeCloseTo(iconLeft, 5);
      expect(buttonContentRight).toBeGreaterThan(iconRight + 1);
    } else {
      expect(buttonContentLeft).toBeLessThan(iconLeft - 1);
      expect(buttonContentRight).toBeCloseTo(iconRight, 5);
    }
  });
});

// With children
iconPositionCases.forEach(({ position, value }) => {
  test(`iconPosition=${value} places icon on ${position} of children`, async ({
    initTestBed,
    createButtonDriver,
    createIconDriver,
  }) => {
    await initTestBed(
      `<Button icon="test" iconPosition="${value}">
          <Card title="Test">This is some content</Card>
        </Button>`,
      {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      },
    );
    const buttonDriver = await createButtonDriver();
    const iconDriver = await createIconDriver(buttonDriver.getIcons().first());
    const { buttonContentLeft, buttonContentRight, iconLeft, iconRight } =
      await iconPositionCalculation(buttonDriver, iconDriver);

    // Depending on orientation, the icon's leftmost and rightmost points fall shorter
    // compared to the button's leftmost and rightmost points because of the children
    if (value === "start") {
      expect(buttonContentLeft).toBeCloseTo(iconLeft, 5);
      expect(buttonContentRight).toBeGreaterThan(iconRight + 1);
    } else {
      expect(buttonContentLeft).toBeLessThan(iconLeft - 1);
      expect(buttonContentRight).toBeCloseTo(iconRight, 5);
    }
  });
});

// --- contentPosition

alignmentOptionValues.forEach((pos) => {
  test(`label and icon is positioned to the ${pos}`, async ({
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(
      `<Button width="100%" icon="test" label="hello" contentPosition="${pos}" />`,
      {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      },
    );
    await expect((await createButtonDriver()).component).toHaveCSS("justify-content", pos);
  });
});

// --- type

buttonTypeValues.forEach((type) => {
  test(`type="${type}" is reflected in html`, async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button type="${type}" />`);
    await expect((await createButtonDriver()).component).toHaveAttribute("type", type);
  });
});

// --- autoFocus

test("focuses component if autoFocus is set", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button autoFocus="{true}" />`);
  await expect((await createButtonDriver()).component).toBeFocused();
});

// --- size

// Relative testing is acceptable for now - basis of the test is the default size
test("relative size test", async ({ initTestBed, page }) => {
  const components = sizeValues
    .map((size) => {
      return `<Button testId="${size}" size="${size}" />`;
    })
    .join("\n");

  await initTestBed(`<Fragment>${components}</Fragment>`);
  const { width: widthXs, height: heightXs } = await getBounds(page.getByTestId("xs"));
  const { width: widthSm, height: heightSm } = await getBounds(page.getByTestId("sm"));
  const { width: widthMd, height: heightMd } = await getBounds(page.getByTestId("md"));
  const { width: widthLg, height: heightLg } = await getBounds(page.getByTestId("lg"));

  expect(widthXs).toBeLessThanOrEqual(widthSm);
  expect(widthSm).toBeLessThanOrEqual(widthMd);
  expect(widthMd).toBeLessThanOrEqual(widthLg);
  expect(heightXs).toBeLessThanOrEqual(heightSm);
  expect(heightSm).toBeLessThanOrEqual(heightMd);
  expect(heightMd).toBeLessThanOrEqual(heightLg);
});

test("testState initializes to default value", async ({ initTestBed }) => {
  const getState = (await initTestBed(`<Fragment />`)).testStateDriver.testState;
  await expect.poll(getState).toEqual(null);
});

// --- gotFocus

test("is focused & gotFocus event fires", async ({ initTestBed, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(`<Button onGotFocus="testState = true" />`);
  const driver = await createButtonDriver();

  await driver.focus();
  await expect(driver.component).toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("gotFocus event does not fire if disabled", async ({ initTestBed, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(
    `<Button enabled="false" onGotFocus="testState = true" />`,
  );
  const driver = await createButtonDriver();

  await driver.focus();
  // testState remains unchanged
  await expect(driver.component).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- lostFocus

test("lostFocus event fires & is not focused", async ({ initTestBed, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(`<Button onLostFocus="testState = true" />`);
  const driver = await createButtonDriver();

  await driver.focus();
  await driver.blur();

  await expect(driver.component).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("cannot emit lostFocus event if not focused before", async ({
  initTestBed,
  createButtonDriver,
}) => {
  const { testStateDriver } = await initTestBed(`<Button onLostFocus="testState = true" />`);
  const driver = await createButtonDriver();

  await driver.blur();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

test("lostFocus event does not fire if disabled", async ({ initTestBed, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(
    `<Button enabled="false" onLostFocus="testState = true" />`,
  );
  const driver = await createButtonDriver();

  await driver.focus();
  await driver.blur();

  // testState remains unchanged
  await expect(driver.component).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(null);
});
