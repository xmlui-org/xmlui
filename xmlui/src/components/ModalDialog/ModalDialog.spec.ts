import { expect, test } from "../../testing/fixtures";

// =============================================================================
// OPEN/CLOSE TESTS
// =============================================================================

test.describe("Open/Close", () => {
  test("Imperative open - without params", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal">Hello</Text>
        </ModalDialog>
      </Fragment>
    `);

    await expect(page.getByTestId("textInModal")).not.toBeVisible();
    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal")).toBeVisible();
  });

  test("Imperative open - with param inside", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open('PARAM_VALUE')">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal">{$param}</Text>
        </ModalDialog>
      </Fragment>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal")).toHaveText("PARAM_VALUE");
  });

  test("Imperative open - with multiple param inside", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open('PARAM_VALUE1', 'PARAM_VALUE2')">open modal (imperative)</Button>
        <ModalDialog id="modal">
          <Text testId="textInModal1">{$params[0]}</Text>
          <Text testId="textInModal2">{$params[1]}</Text>
        </ModalDialog>
      </Fragment>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("textInModal1")).toHaveText("PARAM_VALUE1");
    await expect(page.getByTestId("textInModal2")).toHaveText("PARAM_VALUE2");
  });

  test("Imperative open - with param in title", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open('PARAM_VALUE')">open modal (imperative)</Button>
        <ModalDialog id="modal" title="{$param}"/>
      </Fragment>
    `);

    await page.getByTestId("button").click();
    await expect(page.getByTestId("modal").getByRole("heading")).toHaveText("PARAM_VALUE");
  });

  test("Declarative open/close", async ({ page, initTestBed }) => {
    await initTestBed(`
    <Fragment var.isOpen="{false}">
      <Button testId="button" onClick="isOpen = true">open modal</Button>
      <ModalDialog when="{isOpen}" onClose="isOpen = false" testId="modal">
        <Text testId="textInModal">Hello</Text>
      </ModalDialog>
      <Text testId="isOpen">{isOpen + ''}</Text>
    </Fragment>
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

  test("maxWidth works", async ({ page, initTestBed, createModalDialogDriver }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open modal (imperative)</Button>
        <ModalDialog id="modal" maxWidth="250px">
          <Text testId="textInModal">Hello</Text>
        </ModalDialog>
      </Fragment>
    `);

    const modal = await createModalDialogDriver("modal");

    await expect(modal.component).not.toBeVisible();
    await expect(page.getByTestId("textInModal")).not.toBeVisible();
    await page.getByTestId("button").click();
    await expect(modal.component).toBeVisible();
    await expect(modal.component).toHaveCSS("max-width", "250px");
    await expect(page.getByTestId("textInModal")).toBeVisible();
  });

  test("backgroundColor works", async ({ page, initTestBed, createModalDialogDriver }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open modal (imperative)</Button>
        <ModalDialog id="modal" backgroundColor="rgb(255, 255, 0)">
          <Text testId="textInModal">Hello</Text>
        </ModalDialog>
      </Fragment>
    `);

    const modal = await createModalDialogDriver("modal");

    await page.getByTestId("button").click();
    await expect(modal.component).toBeVisible();
    await expect(modal.component).toHaveCSS("background-color", "rgb(255, 255, 0)");
    await expect(page.getByTestId("textInModal")).toBeVisible();
  });


  test("modal is scrollable in fullScreen mode and hides background content", async ({ page, initTestBed, createModalDialogDriver }) => {
    await initTestBed(`
      <Fragment>
        <!-- Background page content that should be completely hidden by the modal -->
        <VStack testId="pageContent" height="300vh" backgroundColor="lightblue">
          <Button testId="button" onClick="modal.open()">
            open modal
          </Button>
          <Stack height="*" verticalAlignment="end">
              <Text testId="pageBottomText">
                  Should be hidden
              </Text>
          </Stack>
        </VStack>
        <ModalDialog id="modal" fullScreen="{true}">
          <VStack>
            <Text testId="textInModal">
              Content that should be scrollable
            </Text>
            <Stack
              testId="longContent"
              height="300vh"
              verticalAlignment="end">
              <Text testId="bottomText">
                Long content
              </Text>
            </Stack>
          </VStack>
        </ModalDialog>
      </Fragment>
    `);

    const modal = await createModalDialogDriver("modal");

    // Verify page content is initially visible before opening modal
    await expect(page.getByTestId("pageContent")).toBeVisible();
  
    await expect(page.getByTestId("pageEndText")).not.toBeInViewport();
    
    // Open the modal
    await page.getByTestId("button").click();
    await expect(modal.component).toBeVisible();

    
    
    // Verify modal completely covers page content - all page content should be hidden
    await expect(page.getByTestId("textInModal")).toBeVisible();
    await expect(page.getByTestId("bottomText")).not.toBeInViewport();

    await page.getByTestId("bottomText").scrollIntoViewIfNeeded();

    await expect(page.getByTestId("pageBottomText")).not.toBeInViewport();
  });
});
