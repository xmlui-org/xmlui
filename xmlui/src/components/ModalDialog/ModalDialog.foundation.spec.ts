import { expect, test } from "../../testing/fixtures";

test.describe("ModalDialog foundation", () => {
  test("opens and closes through component API", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="open" onClick="modal.open()">Open</Button>
        <ModalDialog id="modal" title="Example dialog">
          <Text testId="content">Dialog content</Text>
          <Button testId="close" onClick="modal.close()">Close by API</Button>
        </ModalDialog>
      </Fragment>
    `);

    await expect(page.getByTestId("content")).not.toBeVisible();
    await page.getByTestId("open").click();
    await expect(page.getByRole("dialog", { name: "Example dialog" })).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await page.getByTestId("close").click();
    await expect(page.getByTestId("content")).not.toBeVisible();
  });

  test("open and close events mutate visible state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.state="{'closed'}">
        <Button testId="open" onClick="modal.open()">Open</Button>
        <ModalDialog id="modal" title="State dialog" onOpen="state = 'open'" onClose="state = 'closed'">
          <Text>Dialog content</Text>
        </ModalDialog>
        <Text testId="state">State: {state}</Text>
      </App>
    `);

    await expect(page.getByTestId("state")).toContainText("State: closed");
    await page.getByTestId("open").click();
    await expect(page.getByTestId("state")).toContainText("State: open");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("state")).toContainText("State: closed");
  });

  test("open parameters are exposed through $param and $params", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="open" onClick="modal.open({ message: 'Hello' }, 'second')">Open</Button>
        <ModalDialog id="modal" title="Parameterized dialog">
          <Text testId="param">Param: {$param.message}</Text>
          <Text testId="params">Second: {$params[1]}</Text>
        </ModalDialog>
      </Fragment>
    `);

    await page.getByTestId("open").click();
    await expect(page.getByTestId("param")).toContainText("Param: Hello");
    await expect(page.getByTestId("params")).toContainText("Second: second");
  });

  test("titleTemplate renders and dialog content can mutate state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{0}">
      <ModalDialog when="{true}">
        <property name="titleTemplate">
          <Text>Template title</Text>
        </property>
        <Button testId="increment" onClick="count++">Increment</Button>
        <Text testId="value">Count: {count}</Text>
      </ModalDialog>
      </App>
    `);

    await expect(page.getByRole("dialog", { name: "Template title" })).toBeVisible();
    await page.getByTestId("increment").click();
    await expect(page.getByTestId("value")).toContainText("Count: 1");
  });
});
