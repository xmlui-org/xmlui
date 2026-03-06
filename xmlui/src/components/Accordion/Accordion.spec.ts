import { test, expect } from "../../testing/fixtures";

const CODE = `
  <Accordion>
    <AccordionItem>Hello</AccordionItem>
  </Accordion>
`;

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("clicking on header expands content", async ({ initTestBed, page }) => {
  await initTestBed(
    `<Accordion>
      <AccordionItem header="header-here">Content</AccordionItem>
    </Accordion>`,
  );

  const header = page.getByText("header-here");
  const content = page.getByText("Content");

  await expect(content).not.toBeVisible();
  await header.click();
  await expect(content).toBeVisible();
});

test("component renders custom header with headerTemplate prop", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <Accordion>
      <AccordionItem>
        <property name="headerTemplate">
          <Text>Click me</Text>
        </property>
        Simple header content
      </AccordionItem>
    </Accordion>
  `,
    {},
  );
  const content = page.getByText("Simple header content");
  await expect(content).not.toBeVisible();

  const templatedButton = page.getByText("Click me");
  await templatedButton.click({ delay: 100 });

  await expect(content).toBeVisible();
});
// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("AccordionItem has correct accessibility attributes", async ({ initTestBed, page }) => {
  await initTestBed(
    `<Accordion>
      <AccordionItem header="header-here">Content</AccordionItem>
    </Accordion>`,
  );

  const header = page.getByRole("button");

  await expect(header).toContainText("header-here");
  await expect(header).toHaveAttribute("aria-expanded", "false");

  await header.click({ delay: 100 });
  await expect(header).toHaveAttribute("aria-expanded", "true");
});

test("pressing enter on header expands content", async ({ initTestBed, page }) => {
  await initTestBed(
    `<Accordion>
      <AccordionItem header="header-here">Content</AccordionItem>
    </Accordion>`,
  );

  const header = page.getByRole("button");
  const content = page.getByText("Content");

  await expect(content).not.toBeVisible();
  await expect(header).toBeVisible(); 
  await header.focus();
  await expect(header).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(content).toBeVisible();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("applies border-side and combination theme variables", async ({
  initTestBed,
  createAccordionDriver,
}) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  // border - all sides
  await initTestBed(CODE, {
    testThemeVars: {
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  let component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderLeft - only left
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderRight - only right
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderHorizontal - left and right
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
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

  // borderLeft overrides borderHorizontal
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderRight overrides borderHorizontal
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderTop - only top
  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderBottom - only bottom
  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderVertical - top and bottom
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderTop overrides borderVertical
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderBottom overrides borderVertical
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

test("applies border-color theme variables", async ({
  initTestBed,
  createAccordionDriver,
}) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  // borderColor - all sides
  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": UPDATED,
    },
  });
  let component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", UPDATED);
  await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", UPDATED);
  await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", UPDATED);
  await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", UPDATED);
  await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderColor overrides border color
  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderHorizontalColor - left and right
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderLeftColor overrides border color
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderRightColor overrides border color
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderVerticalColor - top and bottom
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderTop overrides borderVertical color (top)
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderBottom overrides borderVertical color (bottom)
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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
test("applies border-style and border-width theme variables", async ({
  initTestBed,
  createAccordionDriver,
}) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED_STYLE = "double";
  const UPDATED_WIDTH = "12px";

  // borderStyle - all sides
  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": EXPECTED_STYLE,
    },
  });
  let component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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

  // borderStyle overrides border style
  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", UPDATED_STYLE);

  // borderHorizontalStyle - left and right
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", UPDATED_STYLE);

  // borderLeftStyle overrides border style
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
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
  await expect(component).toHaveCSS("border-left-style", UPDATED_STYLE);

  // borderRightStyle overrides border style
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderVerticalStyle - top and bottom
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderTopStyle overrides border style
  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderBottomStyle overrides border style
  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-Accordion": UPDATED_STYLE,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", UPDATED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderWidth - all sides
  const EXPECTED_WIDE = "8px";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": EXPECTED_WIDE,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDE);
  await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDE);
  await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDE);
  await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDE);
  await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);

  // borderWidth overrides border width
  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": UPDATED_WIDTH,
      "border-Accordion": `${EXPECTED_STYLE} rgb(255, 0, 0) ${EXPECTED_WIDTH}`,
    },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("border-top-color", "rgb(255, 0, 0)");
  await expect(component).toHaveCSS("border-top-width", UPDATED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", "rgb(255, 0, 0)");
  await expect(component).toHaveCSS("border-right-width", UPDATED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", "rgb(255, 0, 0)");
  await expect(component).toHaveCSS("border-bottom-width", UPDATED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", "rgb(255, 0, 0)");
  await expect(component).toHaveCSS("border-left-width", UPDATED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("applies padding theme variables", async ({
  initTestBed,
  createAccordionDriver,
}) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";

  // padding - all sides
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED },
  });
  let component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingHorizontal - left and right
  await initTestBed(CODE, {
    testThemeVars: { "paddingHorizontal-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingLeft - only left
  await initTestBed(CODE, {
    testThemeVars: { "paddingLeft-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingRight - only right
  await initTestBed(CODE, {
    testThemeVars: { "paddingRight-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);

  // paddingVertical - top and bottom
  await initTestBed(CODE, {
    testThemeVars: { "paddingVertical-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);

  // paddingTop - only top
  await initTestBed(CODE, {
    testThemeVars: { "paddingTop-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);

  // paddingBottom - only bottom
  await initTestBed(CODE, {
    testThemeVars: { "paddingBottom-Accordion": EXPECTED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);

  // paddingHorizontal overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingHorizontal-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);

  // paddingLeft overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingLeft-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);

  // paddingRight overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingRight-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingVertical overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingVertical-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingTop overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingTop-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);

  // paddingBottom overrides padding
  await initTestBed(CODE, {
    testThemeVars: { "padding-Accordion": EXPECTED, "paddingBottom-Accordion": UPDATED },
  });
  component = (await createAccordionDriver()).component;
  await expect(component).toBeVisible();
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("expanded treats null as false", async ({ initTestBed, page }) => {
  // Test with null expanded prop
  await initTestBed(
    `
    <Accordion>
      <AccordionItem expanded="{null}">Null Expanded</AccordionItem>
    </Accordion>
  `,
    {},
  );

  await expect(page.getByText("Null Expanded")).not.toBeVisible();
});
