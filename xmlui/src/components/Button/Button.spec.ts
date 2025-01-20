import type { Locator } from "@playwright/test";
import {
  getElementStyle,
  getFullRectangle,
  pixelStrToNum,
  SKIP_REASON,
} from "@testing/component-test-helpers";
import { expect as fixtureExpect, test } from "@testing/fixtures";
import {
  alignmentOptionValues,
  buttonTypeValues,
  type IconPosition,
} from "@components/abstractions";

// --- Setup

const expect = fixtureExpect.extend({
  /**
   * Asserts whether the Button component has the expected label either through the `label` property
   * or as a text node child.
   *
   * **Usage**
   *
   * ```js
   * const driver = await createDriver(`<Button label="hello" />`);
   * await expect(driver.component).toHaveLabel("hello"); // true
   * ```
   *
   * @param expected Expected string label
   */
  async toHaveExplicitLabel(locator: Locator, expected: string) {
    const assertionName = "toHaveLabel";
    let pass = false;

    const label = await locator.evaluate(
      (element) =>
        [...element.childNodes]
          .filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent.trim())
          .map((e) => e.textContent.trim())?.[0],
    );

    if (label === expected) {
      pass = true;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(label)}`
      : () =>
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(label)}`;

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: undefined,
    };
  },
});

// --- Props

// --- --- label

test("Button renders and is visible", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button label="hello" />`);
  await expect((await createButtonDriver()).component).toBeVisible();
});

test("renders ASCII text in label", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button label="hello" />`);
  await expect((await createButtonDriver()).component).toHaveText("hello");
});

test("renders Unicode text in label", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button label="😀" />`);
  await expect((await createButtonDriver()).component).toHaveText("😀");
});

test("renders without label, icon or children", async ({ initTestBed, createButtonDriver }) => {
  // We could get the sum of vertical paddings, margins and comp height to get the expected height
  await initTestBed(`<Button height="20px" />`);
  const driver = await createButtonDriver();
  const { width, height } = await driver.getComponentSize();

  // These should be comp height >= button vertical paddings
  expect(height).toBeGreaterThan(0);
  expect(width).toBeGreaterThan(0);
});

// TODO
[
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "empty array", value: [] },
  { label: "array", value: [] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test.skip(
    `does not render if label is ${type.label}`,
    SKIP_REASON.UNSURE(
      "Need to talk this through, ex. the function throws an error, the rest just don't render",
    ),
    async ({ initTestBed, createButtonDriver }) => {
      await initTestBed(`<Button label="${type.value}" />`);
      await expect((await createButtonDriver()).component).not.toBeAttached();
    },
  );
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

// TODO
test.skip(
  "renders XMLUI Text component as child",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "Flesh out these tests by adding child targeting locators or targeting the children as a whole as a black box",
  ),
  async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button label="hello"><Text>world</Text></Button>`);
    await expect((await createButtonDriver()).component).not.toHaveExplicitLabel("hello");
  },
);

// TODO
test.skip(
  "renders XMLUI Complex component as child",
  SKIP_REASON.TO_BE_IMPLEMENTED("See skip reason in test above"),
  async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button label="hello"><Card title="Button">Content</Card></Button>`);
    await expect((await createButtonDriver()).component).toHaveText("world");
  },
);

// --- --- icon

test("can render icon", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button icon="test" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect((await createButtonDriver()).getFirstIcon()).toBeVisible();
});

test("renders icon and label", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button icon="test" label="hello" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  const driver = await createButtonDriver();

  await expect(driver.component).toHaveText("hello");
  await expect(driver.getFirstIcon()).toBeVisible();
});

test("renders icon if children present", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button icon="test">Hello World</Button>`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect((await createButtonDriver()).getFirstIcon()).toBeVisible();
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
    await expect((await createButtonDriver()).getFirstIcon()).not.toBeAttached();
  });
});

test("renders if icon is not found and label is present", async ({
  initTestBed,
  createButtonDriver,
}) => {
  await initTestBed(`<Button icon="_" label="hello" />`);
  const driver = await createButtonDriver();

  await expect(driver.getFirstIcon()).not.toBeAttached();
  await expect(driver.component).toHaveText("hello");
});

// --- --- iconPosition

// TODO: These tests require some work: iconPosition=start/end + with label, without label, with children
// 1. The idea of testing positioning this way can be challenged: it may be too specific
// 2. The logic is not final since getters are used differently because async functions,
//    the calculation may be too verbose or should be restructured

const iconPositionCases: { position: string; value: IconPosition }[] = [
  { position: "left (ltr)", value: "start" },
  { position: "right (rtl)", value: "end" },
];

// With label
iconPositionCases.forEach(({ position, value }) => {
  test.skip(
    `iconPosition=${value} places icon on ${position} of label`,
    SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
    async ({ initTestBed, createButtonDriver }) => {
      await initTestBed(`<Button icon="test" label="hello" iconPosition="${value}" />`, {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      });

      const driver = await createButtonDriver();
      const buttonDimensions = await getFullRectangle(driver.component);
      /* const contentStart = pixelStrToNum(
        buttonDimensions[pos] + (await getElementStyle(driver.component, `padding-${pos}`)),
      );
      const iconStart = (await getFullRectangle(driver.getFirstNonTextNode()))[pos];

      expect(contentStart).toEqualWithTolerance(iconStart); */
    },
  );
});

// Without label
iconPositionCases.forEach(({ position, value }) => {
  test.skip(
    `iconPosition=${value} places icon on ${position}`,
    SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
    async ({ initTestBed, createButtonDriver }) => {
      await initTestBed(`<Button icon="test" iconPosition="${value}" />`, {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      });

      await expect((await createButtonDriver()).component).toBeAttached();
    },
  );
});

// With children instead of label
iconPositionCases.forEach(({ position, value }) => {
  test.skip(
    `iconPosition=${value} places icon on ${position} of children`,
    SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
    async ({ initTestBed, createButtonDriver }) => {
      await initTestBed(`<Button icon="test" label="hello" iconPosition="${value}" />`, {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      });

      await expect((await createButtonDriver()).component).toBeAttached();
    },
  );
});

// --- --- contentPosition

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

// --- --- type

buttonTypeValues.forEach((type) => {
  test(`type="${type}" is reflected in html`, async ({ initTestBed, createButtonDriver }) => {
    await initTestBed(`<Button type="${type}" />`);
    await expect((await createButtonDriver()).component).toHaveAttribute("type", type);
  });
});

// --- --- enabled

test("has enabled state", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button enabled="true" />`);
  await expect((await createButtonDriver()).component).toBeEnabled();
});

test("has disabled state", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button enabled="false" />`);
  await expect((await createButtonDriver()).component).toBeDisabled();
});

// --- --- autoFocus

test("focuses component if autoFocus is set", async ({ initTestBed, createButtonDriver }) => {
  await initTestBed(`<Button autoFocus="{true}" />`);
  await expect((await createButtonDriver()).component).toBeFocused();
});

// --- --- variant & themeColor

// TODO: add theme variable tests - a Solid Button has specific background, border, font colors, size, etc.
// import from abstractions: buttonVariantMd
// import from abstractions: buttonThemeMd
["solid", "outlined", "ghost"].forEach((variant) => {
  ["primary", "secondary", "attention"].forEach((themeColor) => {
    test.skip(
      `themeColor "${themeColor}" is applied for variant "${variant}"`,
      SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
      async ({ initTestBed, createButtonDriver }) => {},
    );
    ["disabled", "hover", "active", "focused"].forEach((state) => {
      test.skip(
        `${state} state for themeColor "${themeColor}" is applied for variant "${variant}"`,
        SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
        async ({ initTestBed, createButtonDriver }) => {},
      );
    });
  });
});

// --- --- size

// TODO: add size tests
// Relative testing is acceptable for now - basis of the test is the default size
["xs", "sm", "md", "lg"].forEach((size) => {
  test.skip(
    `compare size "${size}" with default size`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createButtonDriver }) => {},
  );
});

// --- Events

test("testState initializes to default value", async ({ initTestBed }) => {
  const getState = (await initTestBed(`<Fragment />`)).testState;
  await expect.poll(getState).toEqual(null);
});

// --- --- click

test("click event fires", async ({ initTestBed, createButtonDriver }) => {
  // test for event doing actually what is defined, e.g. change label text, write to console, etc.
  const testStateDriver = await initTestBed(`<Button onClick="testState = true" />`);
  await (await createButtonDriver()).click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

// --- --- gotFocus

test("is focused & gotFocus event fires", async ({ initTestBed, createButtonDriver }) => {
  const testStateDriver = await initTestBed(`<Button onGotFocus="testState = true" />`);
  const driver = await createButtonDriver();

  await driver.focus();
  await expect(driver.component).toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("gotFocus event does not fire if disabled", async ({ initTestBed, createButtonDriver }) => {
  const testStateDriver = await initTestBed(
    `<Button enabled="false" onGotFocus="testState = true" />`,
  );
  const driver = await createButtonDriver();

  await driver.focus();
  // testState remains unchanged
  await expect(driver.component).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- --- lostFocus

test("lostFocus event fires & is not focused", async ({ initTestBed, createButtonDriver }) => {
  const testStateDriver = await initTestBed(`<Button onLostFocus="testState = true" />`);
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
  const testStateDriver = await initTestBed(`<Button onLostFocus="testState = true" />`);
  const driver = await createButtonDriver();

  await driver.blur();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

test("lostFocus event does not fire if disabled", async ({ initTestBed, createButtonDriver }) => {
  const testStateDriver = await initTestBed(
    `<Button enabled="false" onLostFocus="testState = true" />`,
  );
  const driver = await createButtonDriver();

  await driver.focus();
  await driver.blur();

  // testState remains unchanged
  await expect(driver.component).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- Should be added to tests regarding the framework loading mechanism:
/*
test("can render correct icon", async ({ createDriver }) => {
  // 1. Define the icon resource we wish to load
  // 2. Provide the XLMUI app ecosystem with the resource
  // 3. Fetch the icon ourselves
  // 4. Compare both icons

  const testIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bell"
       width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
       stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
  </svg>
  `;

  const driver = await createDriver(`<Button icon="test" />`,{esources: { "icon.test": "resources/bell.svg" } });
  await expect(driver.buttonIcon).toBeVisible();
});
*/
