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
    <NavGroup label="Pages" initiallyExpanded="true">
      <NavLink label="Page 1" />
      <NavGroup label="subpages" initiallyExpanded="true">
        <NavLink label="inner page 2" />
        <NavLink label="inner page 3" />
      </NavGroup>
      <NavLink label="Page 4" />
    </NavGroup>
  `);

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).toBeVisible();
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
    await initTestBed(
      `<App layout="vertical">
        <NavPanel>
          <NavGroup icon="bell" label="NavGroup">
            <NavLink label="link" to="/" />
          </NavGroup>
        </NavPanel>
      </App>`,
      {
        resources: {
          "icon.bell": "/resources/bell.svg",
        },
      },
    );
    await expect(page.getByTestId("bell-svg")).toBeVisible();
  });

  test("iconHorizontal shows in horizontal layout submenu", async ({ initTestBed, page }) => {
    await initTestBed(
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
      {
        resources: {
          "icon.bell": "/resources/bell.svg",
          "icon.eye": "/resources/eye.svg",
        },
      },
    );

    const bell = page.getByTestId("bell-svg");
    const eye = page.getByTestId("eye-svg");

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
    await initTestBed(
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
      {
        resources: {
          "icon.bell": "/resources/bell.svg",
          "icon.eye": "/resources/eye.svg",
        },
      },
    );

    const bell = page.getByTestId("bell-svg");
    const eye = page.getByTestId("eye-svg");

    await expect(bell).not.toBeVisible();
    await expect(eye).toBeVisible();

    await page.getByText("Team").click();

    await expect(bell).toBeVisible();
    await expect(eye).not.toBeVisible();
  });

  test("iconVertical shows in vertical layout submenu", async ({ initTestBed, page }) => {
    await initTestBed(
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
      {
        resources: {
          "icon.bell": "/resources/bell.svg",
          "icon.eye": "/resources/eye.svg",
        },
      },
    );

    const bell = page.getByTestId("bell-svg");
    const eye = page.getByTestId("eye-svg");

    await expect(bell).not.toBeVisible();

    await page.getByText("Send to").click();

    await expect(bell).not.toBeVisible();
    await expect(eye).toBeVisible();

    await page.getByText("Team").click();

    await expect(bell).toBeVisible();
    await expect(eye).not.toBeVisible();
  });
});
