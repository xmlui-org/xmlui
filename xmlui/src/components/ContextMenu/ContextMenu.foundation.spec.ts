import { expect, test } from "../../testing/fixtures";

test.describe("ContextMenu foundation", () => {
  test("opens at mouse position and menu item mutates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <Card testId="target" title="Right click" onContextMenu="ev => menu.openAt(ev)">
          <Text>Right click me</Text>
        </Card>
        <ContextMenu id="menu">
          <MenuItem testId="set" onClick="message = 'clicked'">Set message</MenuItem>
        </ContextMenu>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByTestId("target").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Set message" })).toBeVisible();
    await page.getByTestId("set").click();
    await expect(page.getByTestId("message")).toContainText("clicked");
    await expect(page.getByRole("menuitem", { name: "Set message" })).not.toBeVisible();
  });

  test("openAt passes $context to menu item content and handlers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <Card testId="target" title="Right click" onContextMenu="ev => menu.openAt(ev, { fileName: 'app.exe' })">
          <Text>Right click me</Text>
        </Card>
        <ContextMenu id="menu">
          <MenuItem testId="download" onClick="message = $context.fileName">Download {$context.fileName}</MenuItem>
        </ContextMenu>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByTestId("target").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Download app.exe" })).toBeVisible();
    await page.getByTestId("download").click();
    await expect(page.getByTestId("message")).toContainText("app.exe");
  });

  test("closes when clicking outside or pressing Escape", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Card testId="target" title="Right click" onContextMenu="ev => menu.openAt(ev)">
          <Text>Right click me</Text>
        </Card>
        <ContextMenu id="menu">
          <MenuItem>Item 1</MenuItem>
        </ContextMenu>
      </App>
    `);

    await page.getByTestId("target").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();

    await page.getByTestId("target").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Item 1" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menuitem", { name: "Item 1" })).not.toBeVisible();
  });

  test("re-reads $context on subsequent openAt calls", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Card testId="file1" title="File 1" onContextMenu="ev => menu.openAt(ev, { fileName: 'one.txt' })">
          <Text>Right click one</Text>
        </Card>
        <Card testId="file2" title="File 2" onContextMenu="ev => menu.openAt(ev, { fileName: 'two.txt' })">
          <Text>Right click two</Text>
        </Card>
        <ContextMenu id="menu">
          <MenuItem>Open {$context.fileName}</MenuItem>
        </ContextMenu>
      </App>
    `);

    await page.getByTestId("file1").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Open one.txt" })).toBeVisible();
    await page.keyboard.press("Escape");

    await page.getByTestId("file2").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "Open two.txt" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Open one.txt" })).not.toBeVisible();
  });

  test("shared menu surface collapses adjacent and trailing separators", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Card testId="target" title="Right click" onContextMenu="ev => menu.openAt(ev)">
          <Text>Right click me</Text>
        </Card>
        <ContextMenu id="menu">
          <MenuSeparator />
          <MenuItem>First</MenuItem>
          <MenuSeparator />
          <MenuSeparator />
          <MenuItem>Second</MenuItem>
          <MenuSeparator />
        </ContextMenu>
      </App>
    `);

    await page.getByTestId("target").click({ button: "right" });
    await expect(page.getByRole("menuitem", { name: "First" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Second" })).toBeVisible();
    await expect(page.locator('[data-xmlui-component="ContextMenu"] > [data-xmlui-component="MenuSeparator"]:visible'))
      .toHaveCount(1);
  });
});
