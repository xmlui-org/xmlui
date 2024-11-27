import { expect, ComponentDriver, createTestWithDriver } from "./fixtures";

// --- Setup

class ButtonDriver extends ComponentDriver {
  get button() {
    return this.locator;
  }
}

const test = createTestWithDriver(ButtonDriver);

// --- Props

// --- --- label

test("renders ASCII text in label", async ({ createDriver }) => {
  const { button } = await createDriver(`<Button label="hello" />`);
  await expect(button).toBeVisible();
  await expect(button).toHaveText("hello");
});

test("renders Unicode text in label", async ({ createDriver }) => {
  const { button } = await createDriver(`<Button label="😀" />`);
  await expect(button).toBeVisible();
  await expect(button).toHaveText("😀");
});

test.skip("renders without label, icon or children", async ({ createDriver }) => {
  const { button, getSize } = await createDriver(`<Button />`);
  const { width, height } = await getSize();
  console.log(button, { width, height });

  await expect(button).toBeVisible();
  expect(height).not.toBeFalsy();
  expect(height).toBeGreaterThan(0);
  expect(width).not.toBeFalsy();
  expect(width).toBeGreaterThan(0);
});

// First, see how this renders
[
  null, 
  undefined, 
  { a: 1, b: "hi" }, 
  [1, 2, 3], 
  () => {},
].forEach((label) => {
  test.skip(`does not render if label is ${typeof label}`, async ({ createDriver }) => {});  
});

test("ignores label if children present", async ({ createDriver }) => {
  const { button } = await createDriver(`<Button label="hello">world</Button>`);
  await expect(button).toHaveText("world");
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

/* 
function addTestId(entryPoint: string) {
  const generatedTestId = `button-${Date.now()}`;
  let testId = "";
  if (!entryPoint.includes("testId")) {
    testId = generatedTestId;
    entryPoint = entryPoint.replace("<Button", `<Button testId="${testId}"`);
  } else {
    // Note: does not work if testId is set like this testId='asd'

    const testIdsWithTag = entryPoint.match(/testId="(.*?)"/);
    // Just to be safe, though this branch shouldn't be possible
    if (!testIdsWithTag) {
      testId = generatedTestId;
      entryPoint = entryPoint.replace("<Button", `<Button testId="${testId}"`);      
    } else if (testIdsWithTag.length > 1) {
      throw new Error("More than one testId found");
    } else if (testIdsWithTag[0] === "testId=\"\"") {
      testId = generatedTestId;
      entryPoint = entryPoint.replace("testId=\"\"", `testId="${testId}"`);
    } else {
      testId = testIdsWithTag[0].substring(
        testIdsWithTag[0].indexOf("\"") + 1, 
        testIdsWithTag[0].lastIndexOf("\"")
      );
    }
  }
  return {code: entryPoint, testId};
}

class ButtonDriver {
  label: string | null | undefined;
  size: {width: number, height: number} | null | undefined;

  constructor(
    public readonly component: Locator,
    public readonly testId?: string
  ) {
    this.component = component;
    this.testId = testId;
  }

  // Get all properties that are requested async
  async init() {
    // Getting the label does not work - not needed right now anyway
    this.label = await this.component.innerText();
    this.size = await getElementSize(this.component);
  }

  async getLabel() {
    return this.component.innerText();
  }

  async expectToBeRendered() {
    await expect(this.component).toBeVisible();
    expect(this.size?.width).toBeGreaterThan(0);
    expect(this.size?.height).toBeGreaterThan(0);  
  }

  async click() {
    await this.component.click();
  }
}

const test = baseTest.extend<{
  createDriver: (entryPoint: string) => Promise<ButtonDriver>;
}>({
  createDriver: async ({ page }, use) => {
    await use(async (entryPoint: string) => {
      const {code, testId} = addTestId(entryPoint);
      await initApp(page, { entryPoint: code });

      const locator = page.getByTestId(testId);
      const driver = new ButtonDriver(locator);
      await driver.init();

      return driver;
    });

  },
});
 */