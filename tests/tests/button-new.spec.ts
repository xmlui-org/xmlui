import { expect, ComponentDriver, createTestWithDriver } from "./fixtures";

// --- Setup

class ButtonDriver extends ComponentDriver {}

const test = createTestWithDriver(ButtonDriver);

// --- Props

// --- --- label

test("renders ASCII text in label", async ({ createDriver }) => {
  const { locator } = await createDriver(`<Button label="hello" />`);
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText("hello");
});

test("renders Unicode text in label", async ({ createDriver }) => {
  const { locator } = await createDriver(`<Button label="😀" />`);
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText("😀");
});

test.skip("renders without label, icon or children", async ({ createDriver }) => {
  const { locator, getSize } = await createDriver(`<Button />`);
  const { width, height } = await getSize();
  console.log(locator, { width, height });

  await expect(locator).toBeVisible();
  expect(height).not.toBeFalsy();
  expect(height).toBeGreaterThan(0);
  expect(width).not.toBeFalsy();
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
    const { locator } = await createDriver(`<Button label="${type.value}" />`);
    //await expect(locator).not.toBeVisible();
  });  
});

test("ignores label if children present", async ({ createDriver }) => {
  const { locator } = await createDriver(`<Button label="hello">world</Button>`);
  await expect(locator).toHaveText("world");
});

test.skip("renders XMLUI component in children", async ({ createDriver }) => {});

// --- --- icon

test.skip("renders if icon is found", async ({ createDriver }) => {});

test.skip("renders if icon and label are present", async ({ createDriver }) => {});

test.skip("renders if icon is incorrect type", async ({ createDriver }) => {});

test.skip("renders if icon is incorrect type and label is present", async ({ createDriver }) => {});

test.skip("renders if icon is not found", async ({ createDriver }) => {});

test.skip("renders if icon is not found and label is present", async ({ createDriver }) => {});

// --- --- iconPosition

// With label

test.skip("left position appears left of label in ltr", async ({ createDriver }) => {});

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
  test.skip(`type="${type}" is reflected in html`, async ({ createDriver }) => {});  
});

// --- --- enabled

// await expect(locator).toBeEnabled()
test.skip("has enabled state", async ({ createDriver }) => {});

// await expect(locator).toBeDisabled()
test.skip("has disabled state", async ({ createDriver }) => {});

// --- --- autoFocus

// await expect(locator).toBeFocused()
test.skip("focuses component if autoFocus is set", async ({ createDriver }) => {});

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

test.skip("Button height is determined by content", async ({ createDriver }) => {});

// --- Events

// --- --- click

test.skip("click event fires", async ({ createDriver }) => {
  // test for event doing actually what is defined, e.g. change label text, write to console, etc.
  /* 
  testBed.expectEventNotToBeInvoked()
  await driver.click();
  testBed.expectEventToBeInvoked()
  */
});

test.skip("click event does not fire if disabled", async ({ createDriver }) => {});

// --- --- gotFocus

test.skip("gotFocus event fires & is focused", async ({ createDriver }) => {});

test.skip("gotFocus event does not fire if disabled", async ({ createDriver }) => {});

// --- --- lostFocus

test.skip("lostFocus event fires & is not focused", async ({ createDriver }) => {});

test.skip("cannot emit lostFocus event if not focused before", async ({ createDriver }) => {});

test.skip("lostFocus event does not fire if disabled", async ({ createDriver }) => {});
