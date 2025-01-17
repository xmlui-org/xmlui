import type { Locator } from "@playwright/test";
import {
  getElementStyle,
  getFullRectangle,
  pixelStrToNum,
  SKIP_REASON,
} from "@testing/component-test-helpers";
import { expect as fixtureExpect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";
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
   * await expect(driver.button).toHaveLabel("hello"); // true
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

class ButtonDriver extends ComponentDriver {
  get button() {
    return this.locator;
  }

  // Ensure we either get rtl or ltr strings - Pending approval
  /* async getWritingDirection() {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/dir
    const attribute = await this.locator.getAttribute("dir");
    if (attribute && attribute !== "auto") return attribute as "rtl" | "ltr";
    const style = await this.locator.evaluate((element) => window.getComputedStyle(element).direction);
    // Default is ltr: https://developer.mozilla.org/en-US/docs/Web/CSS/direction#values
    return style === "rtl" ? "rtl" : "ltr";
  } */

  // NOTE: It may be prudent to target the text nodes and wrap them in a Locator-like, very basic class
  // to better handle them and provide supporting methods such as dimensions (via getClientRects?)
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects
  async getTextNodes() {
    return await this.locator.evaluate((element) =>
      [...element.childNodes]
        .filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent.trim())
        .map((e) => e.textContent.trim()),
    );
  }

  // NOTE: Accounts for the icon being passed as a child as well
  getIcons() {
    return this.locator.locator("> svg").or(this.locator.locator("> img"));
  }

  // NOTE: Added because we can set an icon via the icon prop as well as child
  getFirstIcon() {
    return this.locator.locator("> svg").or(this.locator.locator("> img")).first();
  }

  // NOTE: Added because we can set an icon via the icon prop as well as child
  getLastIcon() {
    return this.locator.locator("> svg").or(this.locator.locator("> img")).last();
  }

  getFirstNonTextNode() {
    return this.locator.locator("> *").first();
  }
}

const test = createTestWithDriver(ButtonDriver);

// --- Props

// --- --- label

test("renders and is visible", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello" />`);
  await expect(driver.button).toBeVisible();
});

test("renders ASCII text in label", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello" />`);
  await expect(driver.button).toHaveText("hello");
});

test("renders Unicode text in label", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="😀" />`);
  await expect(driver.button).toHaveText("😀");
});

test("renders without label, icon or children", async ({ createDriver }) => {
  // We could get the sum of vertical paddings, margins and comp height to get the expected height
  const driver = await createDriver(`<Button height="20px" />`);
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
    async ({ createDriver }) => {
      const driver = await createDriver(`<Button label="${type.value}" />`);
      await expect(driver.button).not.toBeAttached();
    },
  );
});

test("text node as children are same as setting label", async ({ createDriver }) => {
  const driver = await createDriver(`<Button>hello</Button>`);
  await expect(driver.button).toHaveExplicitLabel("hello");
});

test("ignores label property if children present", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello">world</Button>`);
  await expect(driver.button).toHaveExplicitLabel("world");
});

// TODO
test.skip(
  "renders XMLUI Text component as child",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "Flesh out these tests by adding child targeting locators or targeting the children as a whole as a black box",
  ),
  async ({ createDriver }) => {
    const driver = await createDriver(`<Button label="hello"><Text>world</Text></Button>`);
    await expect(driver.button).not.toHaveExplicitLabel("hello");
  },
);

// TODO
test.skip(
  "renders XMLUI Complex component as child",
  SKIP_REASON.TO_BE_IMPLEMENTED("See skip reason in test above"),
  async ({ createDriver }) => {
    const driver = await createDriver(
      `<Button label="hello"><Card title="Button">Content</Card></Button>`,
    );
    await expect(driver.button).toHaveText("world");
  },
);

// --- --- icon

test("can render icon", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="test" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect(driver.getFirstIcon()).toBeVisible();
});

test("renders icon and label", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="test" label="hello" />`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect(driver.button).toHaveText("hello");
  await expect(driver.getFirstIcon()).toBeVisible();
});

test("renders icon if children present", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="test">Hello World</Button>`, {
    resources: {
      "icon.test": "resources/bell.svg",
    },
  });
  await expect(driver.getFirstIcon()).toBeVisible();
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
  test(`does not render icon if icon is of type ${type.label}`, async ({ createDriver }) => {
    const driver = await createDriver(`<Button icon="${type.value}" />`);
    await expect(driver.getFirstIcon()).not.toBeAttached();
  });
});

test("renders if icon is not found and label is present", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="_" label="hello" />`);
  await expect(driver.getFirstIcon()).not.toBeAttached();
  await expect(driver.button).toHaveText("hello");
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
    async ({ createDriver }) => {
      const driver = await createDriver(
        `<Button icon="test" label="hello" iconPosition="${value}" />`,
        {
          resources: {
            "icon.test": "resources/bell.svg",
          },
        },
      );
      const buttonDimensions = await getFullRectangle(driver.button);
      /* const contentStart = pixelStrToNum(
        buttonDimensions[pos] + (await getElementStyle(driver.button, `padding-${pos}`)),
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
    async ({ createDriver }) => {
      const driver = await createDriver(`<Button icon="test" iconPosition="${value}" />`, {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      });

      await expect(driver.button).toBeAttached();
    },
  );
});

// With children instead of label
iconPositionCases.forEach(({ position, value }) => {
  test.skip(
    `iconPosition=${value} places icon on ${position} of children`,
    SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
    async ({ createDriver }) => {
      const driver = await createDriver(
        `<Button icon="test" label="hello" iconPosition="${value}" />`,
        {
          resources: {
            "icon.test": "resources/bell.svg",
          },
        },
      );

      await expect(driver.button).toBeAttached();
    },
  );
});

// --- --- contentPosition

alignmentOptionValues.forEach((pos) => {
  test(`label and icon is positioned to the ${pos}`, async ({ createDriver }) => {
    const driver = await createDriver(
      `<Button width="100%" icon="test" label="hello" contentPosition="${pos}" />`,
      {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      },
    );
    await expect(driver.button).toHaveCSS("justify-content", pos);
  });
});

// --- --- type

buttonTypeValues.forEach((type) => {
  test(`type="${type}" is reflected in html`, async ({ createDriver }) => {
    const driver = await createDriver(`<Button type="${type}" />`);
    await expect(driver.button).toHaveAttribute("type", type);
  });
});

// --- --- enabled

test("has enabled state", async ({ createDriver }) => {
  const driver = await createDriver(`<Button enabled="true" />`);
  await expect(driver.button).toBeEnabled();
});

test("has disabled state", async ({ createDriver }) => {
  const driver = await createDriver(`<Button enabled="false" />`);
  await expect(driver.button).toBeDisabled();
});

// --- --- autoFocus

test("focuses component if autoFocus is set", async ({ createDriver }) => {
  const driver = await createDriver(`<Button autoFocus="{true}" />`);
  await expect(driver.button).toBeFocused();
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
      async ({ createDriver }) => {},
    );
    ["disabled", "hover", "active", "focused"].forEach((state) => {
      test.skip(
        `${state} state for themeColor "${themeColor}" is applied for variant "${variant}"`,
        SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
        async ({ createDriver }) => {},
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
    async ({ createDriver }) => {},
  );
});

// --- Events

test("testState initializes to default value", async ({ createDriver }) => {
  const driver = await createDriver(`<Fragment />`);
  await expect.poll(driver.testState).toEqual(null);
});

// --- --- click

test("click event fires", async ({ createDriver }) => {
  // test for event doing actually what is defined, e.g. change label text, write to console, etc.
  const driver = await createDriver(`<Button onClick="testState = true" />`);
  await driver.click();
  await expect.poll(driver.testState).toEqual(true);
});

// --- --- gotFocus

test("is focused & gotFocus event fires", async ({ createDriver }) => {
  const driver = await createDriver(`<Button onGotFocus="testState = true" />`);
  await driver.focus();

  await expect(driver.button).toBeFocused();
  await expect.poll(driver.testState).toEqual(true);
});

test("gotFocus event does not fire if disabled", async ({ createDriver }) => {
  const driver = await createDriver(`<Button enabled="false" onGotFocus="testState = true" />`);
  await driver.focus();

  // testState remains unchanged
  await expect(driver.button).not.toBeFocused();
  await expect.poll(driver.testState).toEqual(null);
});

// --- --- lostFocus

test("lostFocus event fires & is not focused", async ({ createDriver }) => {
  const driver = await createDriver(`<Button onLostFocus="testState = true" />`);
  await driver.focus();
  await driver.blur();

  await expect(driver.button).not.toBeFocused();
  await expect.poll(driver.testState).toEqual(true);
});

test("cannot emit lostFocus event if not focused before", async ({ createDriver }) => {
  const driver = await createDriver(`<Button onLostFocus="testState = true" />`);
  await driver.blur();

  await expect.poll(driver.testState).toEqual(null);
});

test("lostFocus event does not fire if disabled", async ({ createDriver }) => {
  const driver = await createDriver(`<Button enabled="false" onLostFocus="testState = true" />`);
  await driver.focus();
  await driver.blur();

  // testState remains unchanged
  await expect(driver.button).not.toBeFocused();
  await expect.poll(driver.testState).toEqual(null);
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
