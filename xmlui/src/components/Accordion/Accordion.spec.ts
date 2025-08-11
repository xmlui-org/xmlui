import { test, expect } from "../../testing/fixtures";

const CODE = `
  <Accordion>
    <AccordionItem>Hello</AccordionItem>
  </Accordion>
`;

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("component renders with basic props", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  await initTestBed(CODE, {});
  const driver = await createAccordionDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Hello");
  
  // Verify basic structure
  const accordionItem = driver.component.locator("*[data-testid='accordion-item']");
  await expect(accordionItem).toBeVisible();
  
  // Verify accordion is initially collapsed
  const content = driver.component.locator(".accordion-content");
  await expect(content).toHaveAttribute("aria-hidden", "true");
});

test.skip("component prop changes update display correctly", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test default collapsed state
  await initTestBed(`
    <Accordion>
      <AccordionItem>Default Content</AccordionItem>
    </Accordion>
  `, {});
  
  let driver = await createAccordionDriver();
  const content = driver.component.locator(".accordion-content");
  await expect(content).toHaveAttribute("aria-hidden", "true");
  
  // Test expanded state
  await initTestBed(`
    <Accordion>
      <AccordionItem expanded={true}>Expanded Content</AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  const expandedContent = driver.component.locator(".accordion-content");
  await expect(expandedContent).toHaveAttribute("aria-hidden", "false");
  
  // Test disabled state
  await initTestBed(`
    <Accordion>
      <AccordionItem disabled={true}>Disabled Content</AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  const header = driver.component.locator(".accordion-header");
  await expect(header).toHaveClass(/disabled/);
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct accessibility attributes", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Accordion>
      <AccordionItem>Accessible Content</AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  
  // Check header accessibility attributes
  const header = driver.component.locator(".accordion-header");
  await expect(header).toHaveAttribute("role", "button");
  await expect(header).toHaveAttribute("aria-expanded", "false");
  await expect(header).toHaveAttribute("aria-controls");
  await expect(header).toHaveAttribute("tabindex", "0");
  
  // Check content panel accessibility attributes
  const content = driver.component.locator(".accordion-content");
  await expect(content).toHaveAttribute("role", "region");
  await expect(content).toHaveAttribute("aria-hidden", "true");
  await expect(content).toHaveAttribute("aria-labelledby");
});

test.skip("component is keyboard accessible when interactive", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Accordion>
      <AccordionItem onToggle="testState = testState ? testState + 1 : 1">
        Keyboard Accessible Content
      </AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  const header = driver.component.locator(".accordion-header");
  
  // Test Enter key interaction
  await header.focus();
  await expect(header).toBeFocused();
  await header.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual(1);
  
  // Verify content is now expanded
  const content = driver.component.locator(".accordion-content");
  await expect(content).toHaveAttribute("aria-hidden", "false");
  await expect(header).toHaveAttribute("aria-expanded", "true");
  
  // Test Space key interaction to collapse
  await header.press("Space");
  await expect.poll(testStateDriver.testState).toEqual(2);
  
  // Verify content is now collapsed
  await expect(content).toHaveAttribute("aria-hidden", "true");
  await expect(header).toHaveAttribute("aria-expanded", "false");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("applies border to all sides with single theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("applies only left border with borderLeft theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies only right border with borderRight theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies left and right borders with borderHorizontal theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes borderLeft over borderHorizontal when both set", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-left-width", "8px");
  await expect(component).toHaveCSS("border-left-style", "double");
});

test("prioritizes borderRight over borderHorizontal when both set", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-right-width", "8px");
  await expect(component).toHaveCSS("border-right-style", "double");
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test.skip("applies only top border with borderTop theme var", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: Review this test, often results in flaky
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies only bottom border with borderBottom theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies top and bottom borders with borderVertical theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes borderTop over borderVertical when both set", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-top-width", "8px");
  await expect(component).toHaveCSS("border-top-style", "double");
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes borderBottom over borderVertical when both set", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-bottom-width", "8px");
  await expect(component).toHaveCSS("border-bottom-style", "double");
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies color to all borders with borderColor theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": EXPECTED_COLOR,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("prioritizes borderColor over border's color value", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("applies horizontal border colors over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", UPDATED);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", UPDATED);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes left border color over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", UPDATED);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes right border color over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", UPDATED);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies vertical border colors over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

await expect(component).toHaveCSS("border-top-color", UPDATED);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", UPDATED);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes top border color over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-top-width", "8px");
  await expect(component).toHaveCSS("border-top-style", "double");
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes bottom border color over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(component).toHaveCSS("border-bottom-width", "8px");
  await expect(component).toHaveCSS("border-bottom-style", "double");
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies style to all borders with borderStyle theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": EXPECTED_STYLE,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("prioritizes borderStyle over border's style value", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("applies horizontal border styles over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", UPDATED);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", UPDATED);
});

test("prioritizes left border style over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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
  await expect(component).toHaveCSS("border-left-style", UPDATED);
});

test("prioritizes right border style over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", UPDATED);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies vertical border styles over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", UPDATED);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", UPDATED);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("prioritizes top border style over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", UPDATED);
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

test("prioritizes bottom border style over default border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", UPDATED);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies width to all borders with borderWidth theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": EXPECTED_WIDTH,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("prioritizes borderWidth over border's width value", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("applies padding to all sides with padding theme var", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to left and right with paddingHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingHorizontal-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to left side with paddingLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingLeft-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to right side with paddingRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingRight-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to top and bottom with paddingVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingVertical-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to top side with paddingTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingTop-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("applies padding to bottom side with paddingBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingBottom-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("prioritizes paddingHorizontal over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingHorizontal-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);
});

test("prioritizes paddingLeft over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingLeft-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);
});

test("prioritizes paddingRight over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingRight-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("prioritizes paddingVertical over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingVertical-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("prioritizes paddingTop over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingTop-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("prioritizes paddingBottom over default padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingBottom-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("component handles null and undefined props gracefully", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test with null expanded prop
  await initTestBed(`
    <Accordion>
      <AccordionItem expanded={null}>Null Expanded</AccordionItem>
    </Accordion>
  `, {});
  
  let driver = await createAccordionDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Null Expanded");
  
  // Test with undefined onClick handler
  await initTestBed(`
    <Accordion>
      <AccordionItem onClick={undefined}>Undefined Handler</AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  const header = driver.component.locator(".accordion-header");
  await header.click();
  // Should not throw any errors
  await expect(driver.component).toBeVisible();
  
  // Test with empty children
  await initTestBed(`
    <Accordion>
      <AccordionItem></AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  await expect(driver.component).toBeVisible();
});

test.skip("component handles special characters correctly", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test with special characters in header and content
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Special Ch@r$ & Symb@ls!">
        Content with special characters: José María, 你好, Здравствуйте, €¥£¢
      </AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  const header = driver.component.locator(".accordion-header");
  
  // Verify special characters render correctly in header
  await expect(header).toContainText("Special Ch@r$ & Symb@ls!");
  
  // Expand the accordion
  await header.click();
  
  // Verify special characters render correctly in content
  const content = driver.component.locator(".accordion-content");
  await expect(content).toContainText("José María");
  await expect(content).toContainText("你好");
  await expect(content).toContainText("Здравствуйте");
  await expect(content).toContainText("€¥£¢");
});

test.skip("component handles very long content values", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Create a very long text string
  const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(100);
  
  // Test with very long content
  await initTestBed(`
    <Accordion>
      <AccordionItem>
        ${longText}
      </AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  
  // Verify the component renders without breaking layout
  await expect(driver.component).toBeVisible();
  
  // Expand the accordion
  const header = driver.component.locator(".accordion-header");
  await header.click();
  
  // Verify content is visible and properly contained
  const content = driver.component.locator(".accordion-content");
  await expect(content).toBeVisible();
  
  // Check that content is properly contained within its container
  const contentBox = await content.boundingBox();
  const parentBox = await driver.component.boundingBox();
  expect(contentBox.width).toBeLessThanOrEqual(parentBox.width);
  expect(contentBox.x >= parentBox.x).toBeTruthy();
  expect(contentBox.x + contentBox.width <= parentBox.x + parentBox.width).toBeTruthy();
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.skip("component memoization prevents unnecessary re-renders", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Accordion>
      <AccordionItem 
        onClick="testState = testState ? testState + 1 : 1"
        header="Memoized Header">
        Memoized Content
      </AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  const header = driver.component.locator(".accordion-header");
  
  // Click to expand accordion
  await header.click();
  
  // Verify first click registered
  await expect.poll(() => testStateDriver.testState).toEqual(1);
  
  // Click again to collapse it
  await header.click();
  
  // Verify second click registered
  await expect.poll(() => testStateDriver.testState).toEqual(2);
  
  // Click again to expand it
  await header.click();
  
  // Verify third click registered
  await expect.poll(() => testStateDriver.testState).toEqual(3);
  
  // The component should maintain consistent behavior over multiple interactions
  const content = driver.component.locator(".accordion-content");
  await expect(content).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component API methods work correctly", async ({ initTestBed, createAccordionDriver, page }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Accordion ref="accordionRef">
      <AccordionItem header="API Test">
        Content to test API methods
      </AccordionItem>
    </Accordion>
    <Button id="expandBtn" onClick="accordionRef.expand('0'); testState = 'expanded'">Expand</Button>
    <Button id="collapseBtn" onClick="accordionRef.collapse('0'); testState = 'collapsed'">Collapse</Button>
    <Button id="toggleBtn" onClick="accordionRef.toggle('0'); testState = 'toggled'">Toggle</Button>
    <Button id="focusBtn" onClick="accordionRef.focus('0'); testState = 'focused'">Focus</Button>
  `, {});
  
  const driver = await createAccordionDriver();
  
  // Test expand API method
  await page.locator("#expandBtn").click();
  await expect.poll(testStateDriver.testState).toEqual('expanded');
  let content = driver.component.locator(".accordion-content");
  await expect(content).toBeVisible();
  
  // Test collapse API method
  await page.locator("#collapseBtn").click();
  await expect.poll(testStateDriver.testState).toEqual('collapsed');
  content = driver.component.locator(".accordion-content");
  await expect(content).not.toBeVisible();
  
  // Test toggle API method
  await page.locator("#toggleBtn").click();
  await expect.poll(testStateDriver.testState).toEqual('toggled');
  content = driver.component.locator(".accordion-content");
  await expect(content).toBeVisible();
  
  // Test focus API method
  await page.locator("#focusBtn").click();
  await expect.poll(testStateDriver.testState).toEqual('focused');
  const header = driver.component.locator(".accordion-header");
  await expect(header).toBeFocused();
});

test.skip("component expanded property correctly reports state", async ({ initTestBed, createAccordionDriver, page }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Accordion ref="accordionRef">
      <AccordionItem header="Expanded API Test">
        Content to test expanded API property
      </AccordionItem>
    </Accordion>
    <Button id="checkBtn" onClick="testState = accordionRef.expanded('0')">Check Expanded</Button>
  `, {});
  
  const driver = await createAccordionDriver();
  
  // Check initially not expanded
  await page.locator("#checkBtn").click();
  await expect.poll(testStateDriver.testState).toEqual(false);
  
  // Expand the accordion
  const header = driver.component.locator(".accordion-header");
  await header.click();
  
  // Check now expanded
  await page.locator("#checkBtn").click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test.skip("component renders custom header with headerTemplate prop", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test with string header (default)
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Simple Header">
        Simple header content
      </AccordionItem>
    </Accordion>
  `, {});
  
  let driver = await createAccordionDriver();
  const simpleHeader = driver.component.locator(".accordion-header");
  await expect(simpleHeader).toContainText("Simple Header");
  
  // Test with custom template header
  await initTestBed(`
    <Accordion>
      <AccordionItem headerTemplate={
        <div>
          <Icon name="star" />
          <Text fontWeight="bold" color="red">Custom Template Header</Text>
        </div>
      }>
        Custom template header content
      </AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  const customHeader = driver.component.locator(".accordion-header");
  
  // Verify icon exists in header
  await expect(customHeader.locator("svg[data-icon-name='star']")).toBeVisible();
  
  // Verify text exists in header with correct styling
  const headerText = customHeader.locator("text=Custom Template Header");
  await expect(headerText).toBeVisible();
  await expect(headerText).toHaveCSS("font-weight", "bold");
  await expect(headerText).toHaveCSS("color", "rgb(255, 0, 0)");
});

test.skip("component supports multiple accordion items expanding simultaneously", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Item 1">Content for item 1</AccordionItem>
      <AccordionItem header="Item 2">Content for item 2</AccordionItem>
      <AccordionItem header="Item 3">Content for item 3</AccordionItem>
    </Accordion>
  `, {});
  
  const driver = await createAccordionDriver();
  const headers = driver.component.locator(".accordion-header").all();
  
  // Initially all should be collapsed
  let contents = driver.component.locator(".accordion-content").all();
  for (const content of await contents) {
    await expect(content).not.toBeVisible();
  }
  
  // Expand first item
  await (await headers)[0].click();
  contents = driver.component.locator(".accordion-content").all();
  await expect((await contents)[0]).toBeVisible();
  await expect((await contents)[1]).not.toBeVisible();
  await expect((await contents)[2]).not.toBeVisible();
  
  // Expand second item - first should still be expanded (multiple expansion supported)
  await (await headers)[1].click();
  contents = driver.component.locator(".accordion-content").all();
  await expect((await contents)[0]).toBeVisible();
  await expect((await contents)[1]).toBeVisible();
  await expect((await contents)[2]).not.toBeVisible();
  
  // Expand third item - all three should now be expanded
  await (await headers)[2].click();
  contents = driver.component.locator(".accordion-content").all();
  await expect((await contents)[0]).toBeVisible();
  await expect((await contents)[1]).toBeVisible();
  await expect((await contents)[2]).toBeVisible();
  
  // Collapse first item - others should remain expanded
  await (await headers)[0].click();
  contents = driver.component.locator(".accordion-content").all();
  await expect((await contents)[0]).not.toBeVisible();
  await expect((await contents)[1]).toBeVisible();
  await expect((await contents)[2]).toBeVisible();
});

test.skip("initiallyExpanded prop correctly sets initial accordion state", async ({ initTestBed, createAccordionDriver }) => {
  // TODO: review these Copilot-created tests
  
  // Test with default initiallyExpanded (false)
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Default Collapsed">
        This should be initially collapsed
      </AccordionItem>
    </Accordion>
  `, {});
  
  let driver = await createAccordionDriver();
  let content = driver.component.locator(".accordion-content");
  await expect(content).not.toBeVisible();
  
  // Test with initiallyExpanded set to true
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Initially Expanded" initiallyExpanded={true}>
        This should be initially expanded
      </AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  content = driver.component.locator(".accordion-content");
  await expect(content).toBeVisible();
  
  // Test with multiple items, one expanded
  await initTestBed(`
    <Accordion>
      <AccordionItem header="Item 1">Content 1</AccordionItem>
      <AccordionItem header="Item 2" initiallyExpanded={true}>Content 2</AccordionItem>
      <AccordionItem header="Item 3">Content 3</AccordionItem>
    </Accordion>
  `, {});
  
  driver = await createAccordionDriver();
  const items = driver.component.locator("*[data-testid='accordion-item']").all();
  const contents = driver.component.locator(".accordion-content").all();
  
  // First and third items should be collapsed
  await expect((await contents)[0]).not.toBeVisible();
  // Second item should be expanded
  await expect((await contents)[1]).toBeVisible();
  // Third item should be collapsed
  await expect((await contents)[2]).not.toBeVisible();
});
