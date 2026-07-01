import { expect, test } from "../../testing/fixtures";

test.describe("Drawer foundation", () => {
  test("opens and closes through component API", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="open" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer">
          <Text testId="content">Drawer content</Text>
          <Button testId="close" onClick="drawer.close()">Close</Button>
        </Drawer>
      </Fragment>
    `);

    await expect(page.getByTestId("content")).not.toBeVisible();
    await page.getByTestId("open").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await page.getByTestId("close").click();
    await expect(page.getByTestId("content")).not.toBeVisible();
  });

  test("open and close events mutate visible state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.drawerState="{'closed'}">
        <Button testId="open" onClick="drawer.open()">Open</Button>
        <Drawer id="drawer" onOpen="drawerState = 'open'" onClose="drawerState = 'closed'">
          <Text>Drawer content</Text>
        </Drawer>
        <Text testId="state">State: {drawerState}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("state")).toContainText("State: closed");
    await page.getByTestId("open").click();
    await expect(page.getByTestId("state")).toContainText("State: open");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("state")).toContainText("State: closed");
  });

  test("header template renders and drawer content can mutate state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Drawer initiallyOpen="true" var.count="{0}">
        <property name="headerTemplate">
          <Text>Drawer header</Text>
        </property>
        <Button testId="increment" onClick="count++">Increment</Button>
        <Text testId="value">Count: {count}</Text>
      </Drawer>
    `);

    await expect(page.getByText("Drawer header")).toBeVisible();
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });
});
