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

  test("Preserves $item context variable from Table Column", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Table data='{[
        {id: 1, company: "Acme Corp", order: 1},
      ]}'>
        <Column>
          <ModalDialog id="dialog" testId="dialog" title="{$item.company}">
            <Text testId="modal-text">{JSON.stringify($item)}</Text>
          </ModalDialog>
          <Button testId="btn-{$itemIndex}" onClick="dialog.open()">{$item.company}</Button>
        </Column>
      </Table>
    `);

    // Test first row
    await page.getByTestId("btn-0").click();
    const modal = page.getByTestId("dialog");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Acme Corp");
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

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" tooltip="Tooltip text" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `);
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    
    const component = page.locator("[data-part-id='content']");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" tooltipMarkdown="**Bold text**" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `);
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByTestId("modal")).toBeVisible();
    
    const component = page.locator("[data-part-id='content']");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test.fixme("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" variant="CustomVariant" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `, {
      testThemeVars: {
        "backgroundColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const component = page.getByTestId("modal");
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.fixme("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" variant="CustomVariant" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `, {
      testThemeVars: {
        "backgroundColor-ModalDialog-CustomVariant": "rgb(0, 255, 0)",
      },
    });
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const component = page.getByTestId("modal");
    await expect(component).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" animation="fadeIn" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `);
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    
    const component = page.getByTestId("modal");
    await expect(component).toBeVisible();
  });

  test("can select part: 'title'", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `);
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const titlePart = page.locator("[data-part-id='title']");
    await expect(titlePart).toBeVisible();
    await expect(titlePart).toHaveText("Modal Title");
  });

  test("can select part: 'content'", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `);
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    
    const contentPart = page.locator("[data-part-id='content']");
    await expect(contentPart).toBeVisible();
    await expect(contentPart.getByText("Modal content")).toBeVisible();
  });

  test.fixme("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`
      <ModalDialog testId="test" variant="CustomVariant" title="Modal Title">
        <Text>Modal content</Text>
      </ModalDialog>
    `, {
      testThemeVars: {
        "borderColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const contentPart = page.locator("[data-part-id='content']");
    const titlePart = page.locator("[data-part-id='title']");
    
    await expect(contentPart).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(titlePart).toBeVisible();
    await expect(contentPart).toBeVisible();
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <ModalDialog 
        testId="test" 
        variant="CustomVariant"
        animation="fadeIn"
        title="Modal Title"
      >
        <Text>Modal content</Text>
      </ModalDialog>
    `, {
      testThemeVars: {
        "backgroundColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const contentPart = page.locator("[data-part-id='content']");
    const titlePart = page.locator("[data-part-id='title']");
    
    // Verify variant applied
    await expect(contentPart).toHaveCSS("background-color", "rgb(255, 0, 0)");
    
    // Verify parts are visible
    await expect(titlePart).toBeVisible();
    await expect(contentPart).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies title theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" title="Styled Title">
          <Text>Content</Text>
        </ModalDialog>
      </Fragment>
    `, {
      testThemeVars: {
        "textColor-title-ModalDialog": "rgb(255, 0, 0)",
        "fontSize-title-ModalDialog": "32px",
        "fontWeight-title-ModalDialog": "700",
      },
    });

    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    // The style is applied to the header element inside the title part
    const titleHeader = page.locator("[data-part-id='title'] header");
    await expect(titleHeader).toBeVisible();
    
    await expect(titleHeader).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(titleHeader).toHaveCSS("font-size", "32px");
    await expect(titleHeader).toHaveCSS("font-weight", "700");
  });
});
