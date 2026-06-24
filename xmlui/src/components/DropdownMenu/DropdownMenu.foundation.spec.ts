import { expect, test } from "../../testing/fixtures";

test.describe("DropdownMenu foundation", () => {
  test("opens items from the trigger and closes after item click", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <DropdownMenu label="Menu">
          <MenuItem testId="first" onClick="message = 'first'">First item</MenuItem>
          <MenuItem>Second item</MenuItem>
        </DropdownMenu>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "First item" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Second item" })).toBeVisible();

    await page.getByTestId("first").click();
    await expect(page.getByTestId("message")).toContainText("first");
    await expect(page.getByRole("menuitem", { name: "First item" })).not.toBeVisible();
  });

  test("component API open/close and triggerTemplate work", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Button testId="api-open" onClick="menu.open()">Open by API</Button>
        <DropdownMenu id="menu">
          <property name="triggerTemplate">
            <Button testId="trigger">Custom trigger</Button>
          </property>
          <MenuItem>API item</MenuItem>
        </DropdownMenu>
        <MenuItem testId="api-close" onClick="menu.close()">Close by API</MenuItem>
      </App>
    `);

    await page.getByTestId("api-open").click();
    await expect(page.getByRole("menuitem", { name: "API item" })).toBeVisible();
    await page.getByTestId("api-close").click();
    await expect(page.getByRole("menuitem", { name: "API item" })).not.toBeVisible();
    await page.getByTestId("trigger").click();
    await expect(page.getByRole("menuitem", { name: "API item" })).toBeVisible();
  });

  test("SubMenuItem opens nested items and nested item click mutates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <DropdownMenu label="Menu">
          <SubMenuItem label="More">
            <MenuItem testId="nested-alpha" onClick="message = 'nested alpha'">Nested alpha</MenuItem>
            <MenuItem>Nested beta</MenuItem>
          </SubMenuItem>
        </DropdownMenu>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "More" }).hover();
    await expect(page.getByRole("menuitem", { name: "Nested alpha" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Nested beta" })).toBeVisible();

    await page.getByTestId("nested-alpha").click();
    await expect(page.getByTestId("message")).toContainText("nested alpha");
    await expect(page.getByRole("menuitem", { name: "Nested alpha" })).not.toBeVisible();
  });

  test("shared menu surface collapses top-level adjacent and trailing separators", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <DropdownMenu label="Menu">
          <MenuSeparator />
          <MenuItem>First</MenuItem>
          <MenuSeparator />
          <MenuSeparator />
          <MenuItem>Second</MenuItem>
          <MenuSeparator />
        </DropdownMenu>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("menuitem", { name: "First" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Second" })).toBeVisible();
    await expect(page.locator('[data-xmlui-component="MenuSeparator"]:visible')).toHaveCount(1);
  });

  test("shared menu surface collapses adjacent separators inside SubMenuItem", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <DropdownMenu label="Menu">
          <SubMenuItem label="More">
            <MenuItem>Nested first</MenuItem>
            <MenuSeparator />
            <MenuSeparator />
            <MenuSeparator />
            <MenuItem>Nested second</MenuItem>
          </SubMenuItem>
        </DropdownMenu>
      </App>
    `);

    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("menuitem", { name: "More" }).hover();
    await expect(page.getByRole("menuitem", { name: "Nested first" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Nested second" })).toBeVisible();
    await expect(page.locator('[data-xmlui-component="SubMenuContent"] [data-xmlui-component="MenuSeparator"]:visible'))
      .toHaveCount(1);
  });
});
