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

  test("modal is scrollable in fullScreen mode and hides background content", async ({
    page,
    initTestBed,
    createModalDialogDriver,
  }) => {
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
    await initTestBed(
      `
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" variant="CustomVariant" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `,
      {
        testThemeVars: {
          "backgroundColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );
    // Open the modal
    await page.getByTestId("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const component = page.getByTestId("modal");
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.fixme("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" variant="CustomVariant" title="Modal Title">
          <Text>Modal content</Text>
        </ModalDialog>
      </Fragment>
    `,
      {
        testThemeVars: {
          "backgroundColor-ModalDialog-CustomVariant": "rgb(0, 255, 0)",
        },
      },
    );
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
    await initTestBed(
      `
      <ModalDialog testId="test" variant="CustomVariant" title="Modal Title">
        <Text>Modal content</Text>
      </ModalDialog>
    `,
      {
        testThemeVars: {
          "borderColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

    const contentPart = page.locator("[data-part-id='content']");
    const titlePart = page.locator("[data-part-id='title']");

    await expect(contentPart).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(titlePart).toBeVisible();
    await expect(contentPart).toBeVisible();
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <ModalDialog 
        testId="test" 
        variant="CustomVariant"
        animation="fadeIn"
        title="Modal Title"
      >
        <Text>Modal content</Text>
      </ModalDialog>
    `,
      {
        testThemeVars: {
          "backgroundColor-ModalDialog-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

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
    await initTestBed(
      `
      <Fragment>
        <Button testId="button" onClick="modal.open()">open</Button>
        <ModalDialog id="modal" title="Styled Title">
          <Text>Content</Text>
        </ModalDialog>
      </Fragment>
    `,
      {
        testThemeVars: {
          "textColor-title-ModalDialog": "rgb(255, 0, 0)",
          "fontSize-title-ModalDialog": "32px",
          "fontWeight-title-ModalDialog": "700",
        },
      },
    );

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

// =============================================================================
// REGRESSION TESTS
// =============================================================================

test.describe("Regression Tests", () => {
  // GitHub issue #2673: ModalDialog should unmount children when not visible
  // to prevent unnecessary network requests and hook execution
  test("should unmount children when closed via imperative API (#2673)", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.mountCount="{0}">
        <Button testId="openButton" onClick="modal.open()">Open Modal</Button>
        
        <ModalDialog id="modal">
          <Text testId="modalContent" onInit="mountCount = mountCount + 1">Modal is open (mount count: {mountCount})</Text>
        </ModalDialog>
        
        <Text testId="outsideMountCount">Mount count: {mountCount}</Text>
      </Fragment>
    `);

    // Initial state - modal is closed, mount count should be 0
    await expect(page.getByTestId("modalContent")).not.toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 0");

    // Open the modal - this should trigger onInit and increment mount count to 1
    await page.getByTestId("openButton").click();
    await expect(page.getByTestId("modalContent")).toBeVisible();
    await expect(page.getByTestId("modalContent")).toContainText("mount count: 1");
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

    // Close the modal by clicking the X button in the dialog
    const closeBtn = page.getByRole("dialog").getByRole("button", { name: "Close" });
    await closeBtn.click();
    await expect(page.getByTestId("modalContent")).not.toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

    // Open the modal again - this should increment the count to 2 (remount triggers onInit again)
    await page.getByTestId("openButton").click();
    await expect(page.getByTestId("modalContent")).toBeVisible();
    await expect(page.getByTestId("modalContent")).toContainText("mount count: 2");
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 2");
  });

  // Test to verify that the declarative 'when' approach also unmounts correctly
  test("correctly unmounts children when using 'when' prop (#2673 - declarative control)", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.isOpen="{false}" var.mountCount="{0}">
        <Button testId="openButton" onClick="isOpen = true">Open Modal</Button>
        
        <ModalDialog when="{isOpen}" onClose="isOpen = false">
          <Text testId="modalContent" onInit="mountCount = mountCount + 1">Modal is open (mount count: {mountCount})</Text>
        </ModalDialog>
        
        <Text testId="outsideMountCount">Mount count: {mountCount}</Text>
      </Fragment>
    `);

    // Initial state - modal is closed, mount count should be 0
    await expect(page.getByTestId("modalContent")).not.toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 0");

    // Open the modal - this should trigger mount and onInit
    await page.getByTestId("openButton").click();
    await expect(page.getByTestId("modalContent")).toBeVisible();
    await expect(page.getByTestId("modalContent")).toContainText("mount count: 1");
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

    // Close the modal using the X button
    const closeBtn = page.getByRole("dialog").getByRole("button", { name: "Close" });
    await closeBtn.click();
    await expect(page.getByTestId("modalContent")).not.toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

    // Open the modal again - this should increment to 2 (remount triggers onInit again)
    await page.getByTestId("openButton").click();
    await expect(page.getByTestId("modalContent")).toBeVisible();
    await expect(page.getByTestId("modalContent")).toContainText("mount count: 2");
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 2");
  });

  // Test for bug in isInitiallyOpen logic (#2673)
  test.fixme(
    "BUG: when prop blocks imperative open() method (#2673 - mixed control bug)",
    async ({ page, initTestBed }) => {
      const { testStateDriver } = await initTestBed(`
      <Fragment var.mountCount="{0}">
        <Button testId="openButton" onClick="modal.open()">Open Modal</Button>
        
        <!-- BUG: Using when="{false}" prevents the imperative open() method from working -->
        <ModalDialog id="modal" when="{false}">
          <Text testId="modalContent" onInit="mountCount = mountCount + 1">Modal is open (mount count: {mountCount})</Text>
        </ModalDialog>
        
        <Text testId="outsideMountCount">Mount count: {mountCount}</Text>
      </Fragment>
    `);

      // Modal starts closed correctly
      await expect(page.getByTestId("modalContent")).not.toBeVisible();
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 0");

      // BUG: Trying to open the modal via open() method doesn't work because when="{false}"
      // The when prop takes precedence and keeps the modal closed
      await page.getByTestId("openButton").click();
      await expect(page.getByTestId("modalContent")).toBeVisible();
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");
    },
  );

  // Comprehensive test documenting the CORRECT behavior for issue #2673
  test("documents correct unmounting behavior - children are NOT mounted when modal is closed (#2673)", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.mountCount="{0}">
        <Button testId="openButton" onClick="modal.open()">Open Modal</Button>
        
        <ModalDialog id="modal">
          <Text testId="modalContent" onInit="mountCount = mountCount + 1">Modal is open (mount count: {mountCount})</Text>
        </ModalDialog>
        
        <Text testId="outsideMountCount">Mount count: {mountCount}</Text>
        <Text testId="status">Status: Modal children should only mount when modal opens</Text>
      </Fragment>
    `);

    // VERIFICATION: Modal starts closed and children are NOT mounted
    await expect(page.getByTestId("modalContent")).not.toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 0");

    // This proves that the issue described in #2673 does NOT occur
    // Children are correctly not mounted when the modal is closed
    // No network requests or hook executions happen while modal is hidden

    await page.getByTestId("openButton").click();
    await expect(page.getByTestId("modalContent")).toBeVisible();
    await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");
  });

  // ACTUAL BUG from issue #2673: DataSource inside closed modal makes network requests
  // This test FAILS, demonstrating the bug: DataSource makes requests even when modal is closed
  // The modal children remain mounted (just hidden) so reactive components continue executing
  test(
    "BUG: DataSource inside closed modal continues making requests (#2673 - reactive datasource)",
    async ({ page, initTestBed, createTextBoxDriver }) => {
      let requestCount = 0;

      // Setup API interceptor to count requests
      await page.route("**/api/echo/**", async (route) => {
        requestCount++;
        const url = route.request().url();
        const msg = url.split("/").pop();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ message: msg, requestNumber: requestCount }),
        });
      });

      await initTestBed(
        `
      <Fragment>
        <TextBox id="msg" testId="textbox" label="Type something:" />
        
        <ModalDialog id="dialog" title="Example Dialog">
          <DataSource id="echo" url="/api/echo/{msg.value}" />
          <H2 testId="echoResult">Echoed Message: {echo.value?.message}</H2>
          <Button testId="closeBtn" label="Close Dialog" onClick="dialog.close()" />
        </ModalDialog>
        
        <Button testId="openBtn" label="Open Dialog" onClick="dialog.open()" />
        <Text testId="requestCount">Requests: {$requestCount}</Text>
      </Fragment>
    `,
        // {
        //   apiInterceptor: {
        //     initialize: "$state.requestCount = 0;",
        //     operations: {
        //       echo: {
        //         url: "/api/echo/:msg",
        //         method: "get",
        //         handler: `$state.requestCount++; return { message: $pathParams.msg, requestNumber: $state.requestCount };`,
        //       },
        //     },
        //   },
        // },
      );

      // Initial state: modal is closed, no requests should be made
      await expect(page.getByTestId("textbox")).toBeVisible();
      await page.waitForTimeout(500);
      expect(requestCount).toBe(0);

      // Type in the textbox while modal is closed
      // BUG: This triggers DataSource requests even though modal is closed
      const textBoxDrv = await createTextBoxDriver("textbox");
      await textBoxDrv.input.fill("hello");
      await page.waitForTimeout(500);

      // Expected: 0 requests (modal is closed, DataSource shouldn't be active)
      // Actual BUG: 1+ requests (DataSource is mounted and reacting to msg.value changes)
      //expect(requestCount).toBe(0);

      // Open the modal - now DataSource should make a request
      await page.getByTestId("openBtn").click();
      await page.waitForTimeout(500);

      // This request is expected (modal is open)
      //expect(requestCount).toBe(1);
      await expect(page.getByTestId("echoResult")).toContainText("hello");

      // Close the modal
      await page.getByTestId("closeBtn").click();
      await expect(page.getByTestId("echoResult")).not.toBeVisible();

      // Type more text while modal is closed
      // BUG: This will trigger more requests even though modal is closed
      await textBoxDrv.input.fill("world");
      await page.waitForTimeout(500);

      // Expected: 1 request still (modal is closed)
      // Actual BUG: 2+ requests (DataSource continues reacting)
      expect(requestCount).toBe(1);
    },
  );

  // Test the pattern from issue #2673 - ModalDialog with methods exposed at fragment level
  test.fixme(
    "should unmount children when using exposed methods pattern (#2673 - method exposure)",
    async ({ page, initTestBed }) => {
      const { testStateDriver } = await initTestBed(`
      <Fragment 
        var.mountCount="{0}"
        method.openModal="modal.open()"
        method.closeModal="modal.close()"
      >
        <Button testId="openButton" onClick="openModal()">Open Modal</Button>
        <Button testId="closeButton" onClick="closeModal()">Close Modal</Button>
        
        <ModalDialog id="modal">
          <Text testId="modalContent" onInit="mountCount = mountCount + 1">Modal is open (mount count: {mountCount})</Text>
        </ModalDialog>
        
        <Text testId="outsideMountCount">Mount count: {mountCount}</Text>
      </Fragment>
    `);

      // Initial state - modal is closed
      // BUG: The modal children might be mounted even when not visible
      await expect(page.getByTestId("modalContent")).not.toBeVisible();

      // If the bug exists, mountCount will already be 1 even though modal hasn't been opened yet
      const initialCount = await page.getByTestId("outsideMountCount").textContent();
      console.log("Initial mount count:", initialCount);

      // Expected: mount count should be 0 (children not mounted when modal is closed)
      // Bug behavior: mount count might be 1 (children mounted even when modal is closed)
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 0");

      // Open the modal via the exposed method
      await page.getByTestId("openButton").click();
      await expect(page.getByTestId("modalContent")).toBeVisible();
      await expect(page.getByTestId("modalContent")).toContainText("mount count: 1");
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

      // Close the modal via the exposed method
      await page.getByTestId("closeButton").click();
      await expect(page.getByTestId("modalContent")).not.toBeVisible();

      // Children should remain unmounted (count stays at 1)
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 1");

      // Open again - should remount and increment to 2
      await page.getByTestId("openButton").click();
      await expect(page.getByTestId("modalContent")).toBeVisible();
      await expect(page.getByTestId("modalContent")).toContainText("mount count: 2");
      await expect(page.getByTestId("outsideMountCount")).toHaveText("Mount count: 2");
    },
  );
});
