import { test, expect } from "../../testing/fixtures";

const CODE = `<NavPanel><NavLink to="/">Hello</NavLink></NavPanel>`;

test.describe("discover NavGroups and NavLinks", () => {
  test("Nested NavGroups and NavLinks show in NavPanel", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <NavPanel>
          <NavGroup label="group1" to="/link-1">
            <NavLink to="/link-2">Hello</NavLink>
          </NavGroup>
        </NavPanel>
      `,
      {
        components: [
          `
          <Component name="Custom">
            <Card>
              <H3>Use these actions</H3>
              <HStack>
                <Slot />
              </HStack>
            </Card>
          </Component>
          `,
        ],
      },
    );

    const navgroup = page.getByRole("link", { name: "group1" });
    await expect(navgroup).toHaveAttribute("href", /\/link-1/);

    await navgroup.click();
    await expect(page.getByRole("menuitem", { name: "Hello" })).toHaveAttribute("href", /\/link-2/);
  });

  test("Nested NavGroups and NavLinks in compound component show in NavPanel", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<NavPanel>
          <NavGroup label="group1">
            <NavLink to="/path1">link1</NavLink>
            <Links/>
          </NavGroup>
        </NavPanel>`,
      {
        components: [
          `<Component name="Links">
            <NavGroup label="group2">
              <NavLink to="/path2">link2</NavLink>
              <NavGroup label="group3">
                <NavLink to="/path3">link3</NavLink>
              </NavGroup>
            </NavGroup>
          </Component>`,
        ],
      },
    );

    const link1 = page.getByRole("menuitem", { name: "link1" });
    await expect(link1).not.toBeVisible();

    const navgroup1 = page.getByRole("button", { name: "group1" });
    await navgroup1.click();
    await expect(link1).toHaveAttribute("href", /path1/);

    const navgroup2 = page.getByRole("menuitem", { name: "group2" });
    await navgroup2.click();
    const link2 = page.getByRole("menuitem", { name: "link2" });
    await expect(link2).toHaveAttribute("href", /path2/);

    const navgroup3 = page.getByRole("menuitem", { name: "group3" });
    await navgroup3.click();
    const link3 = page.getByRole("menuitem", { name: "link3" });
    await expect(link3).toHaveAttribute("href", /path3/);
  });

  test("Nested NavGroups and NavLinks in nested compound component show in NavPanel", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `<NavPanel>
          <NavGroup label="group1">
            <NavLink to="/path1">link1</NavLink>
            <Links/>
          </NavGroup>
        </NavPanel>`,
      {
        components: [
          `<Component name="Links">
            <NavGroup label="group2">
              <NavLink to="/path2">link2</NavLink>
              <Links2/>
            </NavGroup>
          </Component>`,

          `<Component name="Links2">
            <NavGroup label="group3">
              <NavLink to="/path3">link3</NavLink>
            </NavGroup>
          </Component>`,
        ],
      },
    );

    const link1 = page.getByRole("menuitem", { name: "link1" });
    await expect(link1).not.toBeVisible();

    const navgroup1 = page.getByRole("button", { name: "group1" });
    await navgroup1.click();
    await expect(link1).toHaveAttribute("href", /path1/);

    const navgroup2 = page.getByRole("menuitem", { name: "group2" });
    await navgroup2.click();
    const link2 = page.getByRole("menuitem", { name: "link2" });
    await expect(link2).toHaveAttribute("href", /path2/);

    const navgroup3 = page.getByRole("menuitem", { name: "group3" });
    await navgroup3.click();
    const link3 = page.getByRole("menuitem", { name: "link3" });
    await expect(link3).toHaveAttribute("href", /path3/);
  });
});

test("border", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderLeft", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderRight", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderHorizontal", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderHorizontal and borderLeft", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderHorizontal and borderRight", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderTop", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderBottom", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderVertical", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderVertical and borderTop", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("borderVertical and border-bottom", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border-color", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-NavPanel": EXPECTED_COLOR,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color-horizontal", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color-left", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color-right", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color-vertical", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-color-top", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", UPDATED);
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

test("border, border-color-bottom", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
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

test("border-style", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-NavPanel": EXPECTED_STYLE,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-horizontal", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-left", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-right", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-vertical", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-top", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-style-bottom", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border-thickness", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-NavPanel": EXPECTED_WIDTH,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-thickness", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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

test("border, border-thickness-horizontal", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", UPDATED);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", UPDATED);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

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
  await expect(component).toHaveCSS("border-left-width", UPDATED);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", UPDATED);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", UPDATED);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", UPDATED);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", UPDATED);
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

test("border, border-thickness-bottom", async ({ initTestBed, createNavPanelDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createNavPanelDriver()).component;

  await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-bottom-width", UPDATED);
  await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

// =============================================================================
// SCROLLERFADE TESTS
// =============================================================================

test.describe("showScrollerFade", () => {
  test("showScrollerFade is true by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="overlay">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Fade overlays should be visible
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("showScrollerFade displays fade indicators", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="overlay" showScrollerFade="true">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Fade overlays should exist (top and bottom)
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("bottom fade is visible when not at bottom", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="overlay" showScrollerFade="true">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Fade overlays should exist
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);

    // Bottom fade overlay should exist
    const bottomFade = page.locator("[class*='fadeBottom']");
    await expect(bottomFade).toBeVisible();
  });

  test("top fade appears when scrolled down", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="overlay" showScrollerFade="true">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Scroll down in NavPanel
    const panel = page.getByTestId("panel");
    await panel.evaluate((el) => {
      el.querySelector("[data-overlayscrollbars-viewport]")?.scrollTo(0, 50);
    });

    // Wait for fade to update
    await page.waitForTimeout(100);

    // Top fade overlay should exist
    const topFade = page.locator("[class*='fadeTop']");
    await expect(topFade).toBeVisible();
  });

  test("showScrollerFade works with whenMouseOver scrollStyle", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="whenMouseOver" showScrollerFade="true">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Fade overlays should exist
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("showScrollerFade works with whenScrolling scrollStyle", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel" scrollStyle="whenScrolling" showScrollerFade="true">
          <NavLink label="Link 1" to="/1" />
          <NavLink label="Link 2" to="/2" />
          <NavLink label="Link 3" to="/3" />
          <NavLink label="Link 4" to="/4" />
          <NavLink label="Link 5" to="/5" />
          <NavLink label="Link 6" to="/6" />
          <NavLink label="Link 7" to="/7" />
          <NavLink label="Link 8" to="/8" />
          <NavLink label="Link 9" to="/9" />
          <NavLink label="Link 10" to="/10" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/1"><Text>Page 1</Text></Page>
          <Page url="/2"><Text>Page 2</Text></Page>
          <Page url="/3"><Text>Page 3</Text></Page>
          <Page url="/4"><Text>Page 4</Text></Page>
          <Page url="/5"><Text>Page 5</Text></Page>
          <Page url="/6"><Text>Page 6</Text></Page>
          <Page url="/7"><Text>Page 7</Text></Page>
          <Page url="/8"><Text>Page 8</Text></Page>
          <Page url="/9"><Text>Page 9</Text></Page>
          <Page url="/10"><Text>Page 10</Text></Page>
        </Pages>
      </App>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Fade overlays should exist
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });
});

// =============================================================================
// DYNAMIC LINK TESTS
// =============================================================================

const DYNAMIC_LINKS_CODE = `
  <App var.links="{ [{ id: 1 }, { id: 2 }, { id: 3 }] }">
    <NavPanel>
      <Items data="{links}">
        <NavLink to="/link/{$item.id}" label="Item {$item.id}"/>
      </Items>
    </NavPanel>
    <Pages>
      <Page url="/">
        <Button testId="add-btn" onClick="links.push({ id: links.length + 1 })">Add Link</Button>
        <Button testId="remove-btn" onClick="links.pop()">Remove Link</Button>
      </Page>
      <Page url="/link/:id">
        <h1>Link {$routeParams.id}</h1>
      </Page>
    </Pages>
  </App>
`;

test.describe("dynamic link creation", () => {
  test("renders initial links from dynamic data", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await expect(page.getByRole("link", { name: "Item 1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 2" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 3" })).toBeVisible();
  });

  test("initial links have correct hrefs derived from item data", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await expect(page.getByRole("link", { name: "Item 1" })).toHaveAttribute("href", /\/link\/1/);
    await expect(page.getByRole("link", { name: "Item 2" })).toHaveAttribute("href", /\/link\/2/);
    await expect(page.getByRole("link", { name: "Item 3" })).toHaveAttribute("href", /\/link\/3/);
  });

  test("adds a new link when data array grows", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await expect(page.getByRole("link", { name: "Item 4" })).not.toBeAttached();

    await page.getByTestId("add-btn").click();

    await expect(page.getByRole("link", { name: "Item 4" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 4" })).toHaveAttribute("href", /\/link\/4/);
  });

  test("removes the last link when data array shrinks", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await expect(page.getByRole("link", { name: "Item 3" })).toBeVisible();

    await page.getByTestId("remove-btn").click();

    await expect(page.getByRole("link", { name: "Item 3" })).not.toBeAttached();
    await expect(page.getByRole("link", { name: "Item 1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 2" })).toBeVisible();
  });

  test("reflects multiple sequential additions", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await page.getByTestId("add-btn").click();
    await page.getByTestId("add-btn").click();

    await expect(page.getByRole("link", { name: "Item 4" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 5" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 4" })).toHaveAttribute("href", /\/link\/4/);
    await expect(page.getByRole("link", { name: "Item 5" })).toHaveAttribute("href", /\/link\/5/);
  });

  test("addition then removal restores the previous link count", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await page.getByTestId("add-btn").click();
    await expect(page.getByRole("link", { name: "Item 4" })).toBeVisible();

    await page.getByTestId("remove-btn").click();
    await expect(page.getByRole("link", { name: "Item 4" })).not.toBeAttached();
    await expect(page.getByRole("link", { name: "Item 3" })).toBeVisible();
  });

  test("can reduce links below initial count", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await page.getByTestId("remove-btn").click();
    await page.getByTestId("remove-btn").click();

    await expect(page.getByRole("link", { name: "Item 1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Item 2" })).not.toBeAttached();
    await expect(page.getByRole("link", { name: "Item 3" })).not.toBeAttached();
  });

  test("clicking an existing link navigates to the correct page", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await page.getByRole("link", { name: "Item 2" }).click();

    await expect(page.getByRole("heading", { name: "Link 2" })).toBeVisible();
  });

  test("clicking a newly added link navigates to the correct page", async ({ initTestBed, page }) => {
    await initTestBed(DYNAMIC_LINKS_CODE);

    await page.getByTestId("add-btn").click();
    await expect(page.getByRole("link", { name: "Item 4" })).toBeVisible();

    await page.getByRole("link", { name: "Item 4" }).click();

    await expect(page.getByRole("heading", { name: "Link 4" })).toBeVisible();
  });
});

// =============================================================================
// SYNCWITHCONTENT TESTS
// =============================================================================

// Build markup with enough NavLinks to overflow the NavPanel (viewport is 300px tall).
// Links 1-8 are flat; link 9 is buried inside nested NavGroups.
const SYNC_APP = `
  <App layout="vertical">
    <NavPanel testId="nav-panel" syncWithContent="true" syncScrollBehavior="instant" height="300px">
      <NavLink to="/page1"  label="Page 1"  />
      <NavLink to="/page2"  label="Page 2"  />
      <NavLink to="/page3"  label="Page 3"  />
      <NavLink to="/page4"  label="Page 4"  />
      <NavLink to="/page5"  label="Page 5"  />
      <NavLink to="/page6"  label="Page 6"  />
      <NavLink to="/page7"  label="Page 7"  />
      <NavLink to="/page8"  label="Page 8"  />
      <NavGroup label="Group A">
        <NavGroup label="Group B">
          <NavLink to="/page9" label="Page 9" testId="link9" />
        </NavGroup>
      </NavGroup>
    </NavPanel>
    <Pages fallbackPath="/page1">
      <Page url="/page1"><Text testId="content1">Content 1</Text></Page>
      <Page url="/page2"><Text testId="content2">Content 2</Text></Page>
      <Page url="/page3"><Text testId="content3">Content 3</Text></Page>
      <Page url="/page4"><Text testId="content4">Content 4</Text></Page>
      <Page url="/page5"><Text testId="content5">Content 5</Text></Page>
      <Page url="/page6"><Text testId="content6">Content 6</Text></Page>
      <Page url="/page7"><Text testId="content7">Content 7</Text></Page>
      <Page url="/page8"><Text testId="content8">Content 8</Text></Page>
      <Page url="/page9"><Text testId="content9">Content 9</Text></Page>
    </Pages>
  </App>
`;

test.describe("syncWithContent", () => {
  test.use({ viewport: { width: 1024, height: 300 } });

  test("active link is scrolled into the NavPanel viewport on navigation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(SYNC_APP);

    // Start at page1 (top of nav) — Page 1 link should already be visible
    const link1 = page.getByRole("link", { name: "Page 1" });
    await expect(link1).toBeVisible();
    await expect(link1).toBeInViewport();

    // Navigate to page8 which is off-screen below
    await page.goto(page.url().replace(/\/page\d.*$/, "/page8"));
    await expect(page.getByTestId("content8")).toBeVisible();

    const link8 = page.getByRole("link", { name: "Page 8" });
    await expect(link8).toBeInViewport();
  });

  test("syncWithContent=false does not scroll the NavPanel on navigation", async ({
    initTestBed,
    page,
  }) => {
    // Same layout but without syncWithContent
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="nav-panel" height="300px">
          <NavLink to="/page1" label="Page 1" />
          <NavLink to="/page2" label="Page 2" />
          <NavLink to="/page3" label="Page 3" />
          <NavLink to="/page4" label="Page 4" />
          <NavLink to="/page5" label="Page 5" />
          <NavLink to="/page6" label="Page 6" />
          <NavLink to="/page7" label="Page 7" />
          <NavLink to="/page8" label="Page 8" />
        </NavPanel>
        <Pages fallbackPath="/page1">
          <Page url="/page1"><Text testId="content1">Content 1</Text></Page>
          <Page url="/page2"><Text testId="content2">Content 2</Text></Page>
          <Page url="/page3"><Text testId="content3">Content 3</Text></Page>
          <Page url="/page4"><Text testId="content4">Content 4</Text></Page>
          <Page url="/page5"><Text testId="content5">Content 5</Text></Page>
          <Page url="/page6"><Text testId="content6">Content 6</Text></Page>
          <Page url="/page7"><Text testId="content7">Content 7</Text></Page>
          <Page url="/page8"><Text testId="content8">Content 8</Text></Page>
        </Pages>
      </App>
    `);

    const link1 = page.getByRole("link", { name: "Page 1" });
    await expect(link1).toBeVisible();

    await page.goto(page.url().replace(/\/page\d.*$/, "/page8"));
    await expect(page.getByTestId("content8")).toBeVisible();

    // Without syncWithContent the nav panel stays at the top — Page 8 link is NOT in viewport
    const link8 = page.getByRole("link", { name: "Page 8" });
    await expect(link8).not.toBeInViewport();
  });

  test("active link inside nested NavGroups is scrolled into view after groups expand", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(SYNC_APP);

    // Navigate directly to page9 which is inside Group A > Group B (collapsed by default)
    await page.goto(page.url().replace(/\/page\d.*$/, "/page9"));
    await expect(page.getByTestId("content9")).toBeVisible();

    // NavGroups should have expanded and the leaf link scrolled into view.
    // Use testId (not getByRole) since aria-hidden on collapsed NavGroup wrappers
    // hides children from the accessibility tree until expansion is complete.
    const link9 = page.getByTestId("link9");
    await expect(link9).toBeVisible(); // wait for NavGroups to expand
    await expect(link9).toBeInViewport();
  });
});
