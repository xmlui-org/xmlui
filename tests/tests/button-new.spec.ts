import { expect, ComponentDriver, createTestWithDriver } from "./fixtures";

// --- Setup

class ButtonDriver extends ComponentDriver {

  get button () {
    return this.locator;
  }

  get buttonIcon () {
    return this.locator.locator("svg").or(this.locator.locator("img"));
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

// First, see how this renders
[
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "empty array", value: [] },
  { label: "array", value: [] },
  { label: "function", value: () => {} },
].forEach((type) => {
  test.skip(`does not render if label is ${type.label}`, async ({ createDriver }) => {
    const driver = await createDriver(`<Button label="${type.value}" />`);
    //await expect(driver.button).not.toBeVisible();
  });
});

test("ignores label if children present", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello">world</Button>`);
  await expect(driver.button).toHaveText("world");
});

// Should this be different compared to the regular label test?
test.skip("renders XMLUI Text component as child", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello"><Text>world</Text></Button>`);
  await expect(driver.button).toHaveText("world");
});

// Not elaborated yet - need to get the children reliably
test.skip("renders XMLUI Complex component as child", async ({ createDriver }) => {
  const driver = await createDriver(`<Button label="hello"><Card title="Button">Content</Card></Button>`);
  await expect(driver.button).toHaveText("world");
});

// --- --- icon

test("can render icon", async ({ createDriver }) => {
  // const driver = await createDriver(`<Button icon="test" />`, { "icon.test": "resources/xmlui-logo.svg" });
  const driver = await createDriver(`<Button icon="trash" />`);
  await expect(driver.buttonIcon).toBeVisible();
});

test.skip("renders correct icon", async ({ createDriver }) => {
  // const driver = await createDriver(`<Fragment><Button icon="test" /><Icon name="test" /></Fragment>`,
  // { "icon.test": "resources/xmlui-logo.svg" });
  const driver = await createDriver(`<Button icon="trash" />`);
  await expect(driver.buttonIcon).toBeVisible();
});

test("renders icon and label", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="trash" label="hello" />`);
  await expect(driver.button).toHaveText("hello");
  await expect(driver.buttonIcon).toBeVisible();
});

test("renders icon if children present", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="trash">Hello World</Button>`);
  await expect(driver.buttonIcon).toBeVisible();
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
    await expect(driver.buttonIcon).not.toBeAttached();
  });
});

test.skip("renders if icon is not found and label is present", async ({ createDriver }) => {
  /* const driver = await createDriver(`<Button icon="___" label="hello" />`);
  await expect(driver.buttonIcon).not.toBeAttached();
  await expect(driver.button).toHaveText("hello"); */
});

// --- --- iconPosition

test("has a horizontal content layout", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="trash" label="hello" />`);
  await expect(driver.button).toBeVisible();
});

// With label

test.skip("left position appears left of label in ltr", async ({ createDriver }) => {
  const driver = await createDriver(`<Button icon="trash" label="hello" />`);
  await expect(driver.button).toBeVisible();
});

test.skip("right position appears right of label in ltr", async ({ createDriver }) => {});

test.skip("start position appears at left of label", async ({ createDriver }) => {});

test.skip("end position appears at right of label", async ({ createDriver }) => {});

// Without label

test.skip("left position appears left of label in ltr (no label)", async ({ createDriver }) => {});

test.skip("right position appears right of label in ltr (no label)", async ({ createDriver }) => {});

test.skip("start position appears at left of label (no label)", async ({ createDriver }) => {});

test.skip("end position appears at right of label (no label)", async ({ createDriver }) => {});

// With children instead of label

test.skip("left position appears left of children in ltr", async ({ createDriver }) => {});

test.skip("right position appears right of children in ltr", async ({ createDriver }) => {});

test.skip("start position appears at left of children", async ({ createDriver }) => {});

test.skip("end position appears at right of children", async ({ createDriver }) => {});

// --- --- contentPosition

// Same thing as with iconPosition

["center", "left", "right"].forEach((pos) => {
  test.skip(`label is positioned to the ${pos}`, async ({ createDriver }) => {});
  test.skip(`icon is positioned to the ${pos}`, async ({ createDriver }) => {});
  test.skip(`children is positioned to the ${pos}`, async ({ createDriver }) => {});
  test.skip(`label and icon is positioned to the ${pos}`, async ({ createDriver }) => {});
  test.skip(`children and icon is positioned to the ${pos}`, async ({ createDriver }) => {});
});

// --- --- type

["button", "reset", "submit"].forEach((type) => {
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

// import from abstractions: buttonVariantMd
// import from abstractions: buttonThemeMd
["solid", "outlined", "ghost"].forEach((variant) => {
  ["primary", "secondary", "attention"].forEach((themeColor) => {
    test.skip(`themeColor "${themeColor}" is applied for variant "${variant}"`, async ({ createDriver }) => {});
    ["disabled", "hover", "active", "focused"].forEach((state) => {
      test.skip(`${state} state for themeColor "${themeColor}" is applied for variant "${variant}"`, async ({ createDriver }) => {});
    });
  });
});

// --- --- size

// Relative testing is acceptable for now - basis of the test is the default size
["xs", "sm", "md", "lg"].forEach((size) => {
  test.skip(`compare size "${size}" with default size`, async ({ createDriver }) => {});  
});

//test.skip("Button height is determined by content", async ({ createDriver }) => {});

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

test("click event does not fire if disabled", async ({ createDriver }) => {
  const driver = await createDriver(`<Button enabled="false" onClick="testState = true" />`);  
  try {
    await driver.click({ timeout: 500 });
  } catch (e) {
    // This click event is deliberately ignored
  }
  // testState remains unchanged
  await expect.poll(driver.testState).toEqual(null);
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
