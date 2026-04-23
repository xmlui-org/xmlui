import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("opens with open() API", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text testId="drawerContent">Hello from drawer</Text>
        </Drawer>
      </Fragment>
    `);

    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
  });

  test("closes with close() API", async ({ page, initTestBed }) => {
    // closeBtn is placed inside the drawer so the backdrop does not block it
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" closeButtonVisible="false">
          <Text testId="drawerContent">Hello</Text>
          <Button testId="closeBtn" onClick="drawer.close()">Close via API</Button>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
    await page.getByTestId("closeBtn").click();
    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
  });

  test("isOpen() returns correct value", async ({ page, initTestBed }) => {
    // checkBtn is placed inside the drawer so the backdrop does not block it when open
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" closeButtonVisible="false">
          <Text>Content</Text>
          <Button testId="checkBtn" onClick="testState = drawer.isOpen()">Check</Button>
        </Drawer>
      </Fragment>
    `);

    // Check before opening (button is not visible yet — use API check via external state)
    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("initiallyOpen opens drawer on first render", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Drawer initiallyOpen="true">
          <Text testId="drawerContent">Initially open</Text>
        </Drawer>
      </Fragment>
    `);

    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
  });

  test("initiallyOpen defaults to closed", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Drawer>
        <Text testId="drawerContent">Hidden initially</Text>
      </Drawer>
    `);

    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
  });

  test("close button closes the drawer", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text testId="drawerContent">Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
  });

  test("closeButtonVisible=false hides the close button", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" closeButtonVisible="false">
          <Text testId="drawerContent">Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).not.toBeVisible();
  });

  test("closeButtonVisible=true shows the close button", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" closeButtonVisible="true">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });

  test("hasBackdrop=true shows backdrop overlay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" hasBackdrop="true">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // The backdrop overlay has aria-hidden="true" and data-state="open"
    const backdrop = page.locator("[aria-hidden='true'][data-state='open']");
    await expect(backdrop).toBeVisible();
  });

  test("closeOnClickAway=true closes drawer when clicking outside", async ({
    page,
    initTestBed,
  }) => {
    // Use position="right" so we can reliably click the left area (outside the drawer)
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="right" closeOnClickAway="true" hasBackdrop="false">
          <Text testId="drawerContent">Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
    // Click the far-left area, well outside the right-side drawer (320px wide)
    await page.mouse.click(100, 300);
    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
  });

  test("closeOnClickAway=false keeps drawer open when clicking outside", async ({
    page,
    initTestBed,
  }) => {
    // Use position="right" so we can reliably click the left area (outside the drawer)
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="right" closeOnClickAway="false" closeButtonVisible="true" hasBackdrop="false">
          <Text testId="drawerContent">Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("drawerContent")).toBeVisible();
    // Click the far-left area, well outside the right-side drawer (320px wide)
    await page.mouse.click(100, 300);
    await expect(page.getByTestId("drawerContent")).toBeVisible();
  });

  test("renders drawer from correct edge for all positions", async ({ page, initTestBed }) => {
    // left
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="left">
          <Text testId="drawerContent">Left drawer</Text>
        </Drawer>
      </Fragment>
    `);
    await page.getByTestId("openBtn").click();
    let dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("left", "0px");

    // right
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="right">
          <Text testId="drawerContent">Right drawer</Text>
        </Drawer>
      </Fragment>
    `);
    await page.getByTestId("openBtn").click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("right", "0px");

    // top
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="top">
          <Text testId="drawerContent">Top drawer</Text>
        </Drawer>
      </Fragment>
    `);
    await page.getByTestId("openBtn").click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("top", "0px");

    // bottom
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="bottom">
          <Text testId="drawerContent">Bottom drawer</Text>
        </Drawer>
      </Fragment>
    `);
    await page.getByTestId("openBtn").click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveCSS("bottom", "0px");
  });

  test("renders children inside the drawer panel", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text testId="child1">First child</Text>
          <Text testId="child2">Second child</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("child1")).toBeVisible();
    await expect(page.getByTestId("child2")).toBeVisible();
  });

  test("backgroundColor prop overrides theme variable", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" backgroundColor="rgb(255, 255, 0)">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(255, 255, 0)");
  });
});

// =============================================================================
// HEADER TEMPLATE TESTS
// =============================================================================

test.describe("Header Template", () => {
  test("headerTemplate renders custom content in the header", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <property name="headerTemplate">
            <Text testId="headerText">My Header</Text>
          </property>
          <Text testId="bodyText">Body content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("headerText")).toBeVisible();
    await expect(page.getByTestId("bodyText")).toBeVisible();
  });

  test("headerTemplate content appears before close button", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" closeButtonVisible="true">
          <property name="headerTemplate">
            <Text testId="headerText">Navigation</Text>
          </property>
          <Text>Body</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByTestId("headerText")).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });
});

// =============================================================================
// EVENTS TESTS
// =============================================================================

test.describe("Events", () => {
  test("onOpen fires when drawer opens", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" onOpen="testState = 'opened'">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("opened");
  });

  test("onClose fires when drawer closes via close button", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" onClose="testState = 'closed'">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect.poll(testStateDriver.testState).toEqual("closed");
  });

  test("onClose fires when drawer closes via close() API", async ({ page, initTestBed }) => {
    // closeBtn is placed inside the drawer so the backdrop does not block it
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" onClose="testState = 'closed'" closeButtonVisible="false">
          <Text>Content</Text>
          <Button testId="closeBtn" onClick="drawer.close()">Close via API</Button>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("closeBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("closed");
  });

  test("onClose fires when clicking outside with closeOnClickAway=true", async ({
    page,
    initTestBed,
  }) => {
    // Use position="right" so we can reliably click the left area (outside the drawer)
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="right" onClose="testState = 'closed'" closeOnClickAway="true" hasBackdrop="false">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Wait for the open animation to fully settle so Radix's pointer-down-outside
    // listener is registered before we click outside.
    await expect(dialog).toHaveAttribute("data-state", "open");
    // Click the far-left area, well outside the right-side drawer (320px wide)
    await page.mouse.click(100, 300);
    await expect.poll(testStateDriver.testState).toEqual("closed");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("renders the drawer as a dialog role", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("Escape key closes the drawer", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text testId="drawerContent">Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    // Wait for the close button (auto-focused by Radix) to be ready
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("drawerContent")).not.toBeVisible();
  });

  test("close button has accessible label", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
    `);

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("backgroundColor-Drawer applies background color", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
      `,
      { testThemeVars: { "backgroundColor-Drawer": "rgb(255, 0, 0)" } },
    );

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("padding-Drawer applies padding to header and body edges", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <property name="headerTemplate">
            <Text testId="headerContent">Header</Text>
          </property>
          <Text testId="bodyContent">Content</Text>
        </Drawer>
      </Fragment>
      `,
      { testThemeVars: { "padding-Drawer": "32px" } },
    );

    await page.getByTestId("openBtn").click();
    // Header: top + horizontal padding, no bottom
    const header = page.getByTestId("headerContent").locator("..").locator("..");
    await expect(header).toHaveCSS("padding-top", "32px");
    await expect(header).toHaveCSS("padding-left", "32px");
    await expect(header).toHaveCSS("padding-right", "32px");
    await expect(header).toHaveCSS("padding-bottom", "0px");
    // Body: bottom + horizontal padding, no top (gap handles spacing)
    const body = page.getByTestId("bodyContent").locator("..");
    await expect(body).toHaveCSS("padding-top", "0px");
    await expect(body).toHaveCSS("padding-left", "32px");
    await expect(body).toHaveCSS("padding-right", "32px");
    await expect(body).toHaveCSS("padding-bottom", "32px");
  });

  test("gap-Drawer controls space between header and body", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <property name="headerTemplate">
            <Text testId="headerContent">Header</Text>
          </property>
          <Text testId="bodyContent">Content</Text>
        </Drawer>
      </Fragment>
      `,
      { testThemeVars: { "gap-Drawer": "20px" } },
    );

    await page.getByTestId("openBtn").click();
    const body = page.getByTestId("bodyContent").locator("..");
    await expect(body).toHaveCSS("margin-top", "20px");
  });

  test("borderRadius-Drawer applies border radius", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="right">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
      `,
      { testThemeVars: { "borderRadius-Drawer": "16px" } },
    );

    await page.getByTestId("openBtn").click();
    // right-side drawer has `border-radius: $borderRadius 0 0 $borderRadius` so check top-left
    await expect(page.getByRole("dialog")).toHaveCSS("border-top-left-radius", "16px");
  });

  test("width-Drawer applies panel width (left position)", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="openBtn" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" position="left">
          <Text>Content</Text>
        </Drawer>
      </Fragment>
      `,
      { testThemeVars: { "width-Drawer": "400px", "maxWidth-Drawer": "100%" } },
    );

    await page.getByTestId("openBtn").click();
    await expect(page.getByRole("dialog")).toHaveCSS("width", "400px");
  });
});
