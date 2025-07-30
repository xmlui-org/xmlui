import { expect, test } from "../../testing/fixtures";

// =============================================================================
// OPEN/CLOSE TESTS
// =============================================================================

test.describe("Open/Close", () => {
  test("Imperative open - without params", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Button testId="button" onClick="modal.open()">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal">Hello</Text>
        </ModalDialog>
      </App>
    `);

    await expect(page.getByTestId("textInModal")).not.toBeVisible();
    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal")).toBeVisible();
  });

  test("Imperative open - with param inside", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Button testId="button" onClick="modal.open('PARAM_VALUE')">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal">{$param}</Text>
        </ModalDialog>
      </App>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal")).toHaveText("PARAM_VALUE");
  });

  test("Imperative open - with multiple param inside", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Button testId="button" onClick="modal.open('PARAM_VALUE1', 'PARAM_VALUE2')">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal1">{$params[0]}</Text>
          <Text testId="textInModal2">{$params[1]}</Text>
        </ModalDialog>
      </App>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal1")).toHaveText("PARAM_VALUE1");
    await expect(page.getByTestId("textInModal2")).toHaveText("PARAM_VALUE2");
  });

  test("Imperative open - with param in title", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Button testId="button" onClick="modal.open('PARAM_VALUE')">open modal (imperative)</Button>
        <ModalDialog id="modal" title="{$param}"/>
      </App>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("modal").getByRole("heading")).toHaveText("PARAM_VALUE");
  });

  test("Declarative open/close", async ({ page, initTestBed }) => {
    await initTestBed(`
    <App var.isOpen="{false}">
      <Button testId="button" onClick="isOpen = true">open modal</Button>
      <ModalDialog when="{isOpen}" onClose="isOpen = false" testId="modal">
        <Text testId="textInModal">Hello</Text>
      </ModalDialog>
      <Text testId="isOpen">{isOpen + ''}</Text>
    </App>
  `);

    await expect(page.getByTestId("textInModal")).not.toBeVisible();
    await expect(page.getByTestId("isOpen")).toHaveText("false");
    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal")).toBeVisible();
    await expect(page.getByTestId("isOpen")).toHaveText("true");
    //click modal close button
    await page.getByTestId("modal").getByRole("button").click();
    await expect(page.getByTestId("textInModal")).not.toBeVisible();
    await expect(page.getByTestId("isOpen")).toHaveText("false");
  });
});
