import { expect, test } from "../../testing/fixtures";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("displays menuitems after click", async ({ initTestBed, page }) => {
    await initTestBed(`
        <NavGroup label="Pages">
          <NavLink label="Page 1" />
          <NavGroup label="subpages">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
    await page.getByRole("button", { name: "Pages", exact: true }).click();

    await expect(page.getByRole("menuitem")).toHaveCount(3);
    await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "subpages" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Page 4" })).toBeVisible();

    await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
    await expect(page.getByRole("menuitem", { name: "inner page 3" })).not.toBeVisible();
  });

  test("disabled navgroup can't open", async ({ initTestBed, page }) => {
    await initTestBed(`
        <NavGroup label="Pages" enabled="false">
          <NavLink label="Page 1" />
          <NavGroup label="subpages">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
    const pagesBtn = page.getByRole("button", { name: "Pages", exact: true });

    await expect(pagesBtn).toBeDisabled();
    await pagesBtn.click({ force: true });

    await expect(page.getByRole("menuitem", { name: "Page 1" })).not.toBeVisible();
    await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
  });

  test("component trigger has correct aria labels", async ({ initTestBed, page }) => {
    await initTestBed(`<NavGroup testId="navGroup" label="NavGroup"/>`);
    const button = page.getByTestId("navGroup");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
  });

  test("expanded in vertical layout to show link of current page", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel>
          <NavGroup label="Current-upper">
            <NavGroup label="Current">
              <NavLink label="link-to-current-page" to="/" />
            </NavGroup>
          </NavGroup>
        </NavPanel>
      </App>`);
    await expect(page.getByText("link-to-current-page")).toBeVisible();
  });
});

test("nested disabled navgroup can't open", async ({ initTestBed, page }) => {
  await initTestBed(`
        <NavGroup label="Pages" >
          <NavLink label="Page 1" />
          <NavGroup label="subpages" enabled="false">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
  const pagesBtn = page.getByRole("button", { name: "Pages", exact: true });
  await pagesBtn.click();

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  const subpagesBtn = page.getByRole("menuitem", { name: "subpages" });

  await expect(subpagesBtn).toBeDisabled();

  await subpagesBtn.click({ force: true });

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
});

test("initiallyExpanded works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <NavGroup label="Pages" initiallyExpanded="true">
      <NavLink label="Page 1" />
      <NavGroup label="subpages">
        <NavLink label="inner page 2" />
        <NavLink label="inner page 3" />
      </NavGroup>
      <NavLink label="Page 4" />
    </NavGroup>
  `);

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
});

test("nested initiallyExpanded works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack testId="stack">
      <NavGroup label="Pages" initiallyExpanded="true">
        <NavLink label="Page 1" />
        <NavGroup label="subpages" initiallyExpanded="true">
          <NavLink label="inner page 2" />
          <NavLink label="inner page 3" />
        </NavGroup>
        <NavLink label="Page 4" />
      </NavGroup>
    </Stack>
  `);

  const stack = page.getByTestId("stack");
  await expect(stack).toBeVisible();

  const items = page.getByRole("menuitem");
  await expect(items).toHaveCount(3);
  expect(items.nth(0)).toHaveText("Page 1");
  expect(items.nth(1)).toHaveText("subpages");
  expect(items.nth(2)).toHaveText("Page 4");
});

test("expands even without label", async ({ initTestBed, page }) => {
  await initTestBed(`
    <NavGroup >
      <NavLink label="Page 1" />
      <NavGroup label="subpages">
        <NavLink label="inner page 2" />
        <NavLink label="inner page 3" />
      </NavGroup>
      <NavLink label="Page 4" />
    </NavGroup>
  `);

  await expect(page.getByRole("menuitem", { name: "Page 1" })).not.toBeVisible();
  await page.getByRole("button").click();
  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();
});

test.describe("icon props", () => {
  test("icon appears", async ({ initTestBed, page }) => {
    const { testIcons } = await initTestBed(
      `<App layout="vertical">
        <NavPanel>
          <NavGroup icon="bell" label="NavGroup">
            <NavLink label="link" to="/" />
          </NavGroup>
        </NavPanel>
      </App>`,
    );
    await expect(testIcons.bellIcon).toBeVisible();
  });

  test("iconHorizontal shows in horizontal layout submenu", async ({ initTestBed, page }) => {
    const { testIcons } = await initTestBed(
      `
      <App layout="horizontal">
        <NavPanel>
          <NavGroup label="Send To">
            <NavGroup icon="users" label="Team"
              iconHorizontalExpanded="bell" iconHorizontalCollapsed="eye">
              <NavLink label="Jane" />
            </NavGroup>
          </NavGroup>
        </NavPanel>
      </App>
    `,
    );

    const bell = testIcons.bellIcon;
    const eye = testIcons.eyeIcon;

    await expect(bell).not.toBeVisible();
    await expect(eye).not.toBeVisible();

    await page.getByRole("button", { name: "Send to" }).click();

    await expect(bell).not.toBeVisible();
    await expect(eye).toBeVisible();

    await page.getByRole("menuitem", { name: "Team" }).hover();

    await expect(bell).toBeVisible();
    await expect(eye).not.toBeVisible();
  });

  test("iconVertical shows in horizontal layout top lvl navgroup", async ({
    initTestBed,
    page,
  }) => {
    const { testIcons } = await initTestBed(
      `
      <App layout="horizontal">
        <NavPanel>
          <NavGroup icon="users" label="Team"
            iconVerticalExpanded="bell" iconVerticalCollapsed="eye">
            <NavLink label="Jane" />
          </NavGroup>
        </NavPanel>
      </App>
    `,
    );

    const bell = testIcons.bellIcon;
    const eye = testIcons.eyeIcon;

    await expect(bell).not.toBeVisible();
    await expect(eye).toBeVisible();

    await page.getByText("Team").click();

    await expect(bell).toBeVisible();
    await expect(eye).not.toBeVisible();
  });

  test("iconVertical shows in vertical layout submenu", async ({ initTestBed, page }) => {
    const { testIcons } = await initTestBed(
      `
      <App layout="vertical">
        <NavPanel>
          <NavGroup label="Send To">
            <NavGroup icon="users" label="Team"
              iconVerticalExpanded="bell" iconVerticalCollapsed="eye">
              <NavLink label="Jane" />
            </NavGroup>
          </NavGroup>
        </NavPanel>
      </App>
    `,
    );

    const bell = testIcons.bellIcon;
    const eye = testIcons.eyeIcon;

    await expect(bell).not.toBeVisible();

    await page.getByText("Send to").click();

    await expect(bell).not.toBeVisible();
    await expect(eye).toBeVisible();

    await page.getByText("Team").click();

    await expect(bell).toBeVisible();
    await expect(eye).not.toBeVisible();
  });
});

// =============================================================================
// DRAWER INTERACTION TESTS
// =============================================================================

test.describe("Drawer Interaction", () => {
  test("clicking NavGroup toggle in drawer does not close drawer", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel>
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text value="Home" />
          </Page>
          <Page url="/page1">
            <Text value="Page 1" />
          </Page>
          <Page url="/page2">
            <Text value="Page 2" />
          </Page>
        </Pages>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await hamburgerButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // finst the first element in the dialog with a text of "Pages"
    const navGroupToggle = dialog.getByRole("button", { name: "Pages" });
    await navGroupToggle.click();
    await page.waitForTimeout(200);
    await expect(dialog).toBeVisible();
    // There must be a text "Page1"
    await expect(dialog).toContainText("Page 1");
    await expect(dialog).toContainText("Page 2");
  });

  test("clicking NavLink in drawer closes drawer", async ({ initTestBed, page }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader />
        <NavPanel>
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text value="Home" />
          </Page>
          <Page url="/page1">
            <Text value="Page 1 Content" />
          </Page>
          <Page url="/page2">
            <Text value="Page 2" />
          </Page>
        </Pages>
      </App>
    `);

    // Open drawer
    const hamburgerButton = page.locator('[data-part-id="hamburger"]');
    await hamburgerButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Expand NavGroup
    const navGroupToggle = dialog.getByRole("button", { name: "Pages" });
    await navGroupToggle.click();
    await page.waitForTimeout(200);

    // Click a NavLink to navigate
    await dialog.getByRole("link", { name: "Page 1" }).click();

    // Verify navigation occurred
    await expect(page.getByText("Page 1 Content")).toBeVisible();

    // Verify drawer is closed
    await expect(dialog).not.toBeVisible();
  });
});
