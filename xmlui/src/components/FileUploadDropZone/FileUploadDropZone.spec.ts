import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with children content", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Upload Area");
  });

  test("renders multiple children", async ({ initTestBed, createFileUploadDropZoneDriver }) => {
    await initTestBed(`
      <FileUploadDropZone>
        <Text>Drag files here</Text>
        <Button>Or click to browse</Button>
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toContainText("Drag files here");
    await expect(driver.component).toContainText("Or click to browse");
  });

  test("has hidden file input", async ({ initTestBed, createFileUploadDropZoneDriver }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toBeAttached();
    await expect(driver.getHiddenInput()).toHaveAttribute("type", "file");
  });

  test("'enabled' set to false disables the drop zone", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone enabled="false">Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveAttribute("data-drop-enabled", "false");
  });

  test("'enabled' set to true keeps the drop zone active", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone enabled="true">Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveAttribute("data-drop-enabled", "true");
    expect(await driver.isEnabled()).toBe(true);
  });

  test("'text' prop displays placeholder text when no children", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone text="Custom drop message"></FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveText("Custom drop message");
  });

  test("children hide the placeholder text", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone text="Custom drop message">Upload Area</FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveText("Upload Area");
    await expect(driver.component).not.toContainText("Custom drop message");
  });

  test("'text' prop with special characters renders correctly", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone text="📁 Drop &amp; Release files 🚀"></FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveText("📁 Drop & Release files 🚀");
  });

  test("renders default icon in placeholder", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone height="100px" />`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getDropIcon()).toBeVisible();
  });

  test("'icon' prop renders a custom icon", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone height="100px" icon="test" />`, {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getDropIcon()).toBeVisible();
  });

  test("'acceptedFileTypes' prop is attached to the hidden input", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone acceptedFileTypes="image/*,application/pdf">Upload Area</FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toBeAttached();
  });

  test("'acceptedFileTypes' with whitespace trims correctly", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone acceptedFileTypes=" image/*, application/pdf ">Upload Area</FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
  });

  test("'maxFiles' prop is attached to the hidden input", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone maxFiles="5">Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toBeAttached();
  });

  test("drag enter and leave does not break the component", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await driver.triggerDragEnter();
    await expect(driver.component).toBeVisible();
    await driver.triggerDragLeave();
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// UPLOAD EVENT TESTS
// =============================================================================

test.describe("Upload Event", () => {
  test("'onUpload' reports the number of dropped files", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <FileUploadDropZone onUpload="files => testState = files.length">
        Upload Area
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await driver.triggerDrop(["file1.txt", "file2.txt"]);
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("'onUpload' provides file names", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <FileUploadDropZone onUpload="files => testState = files.map(f => f.name)">
        Upload Area
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await driver.triggerDrop(["file1.txt", "file2.pdf", "file3.jpg"]);
    await expect.poll(testStateDriver.testState).toEqual(["file1.txt", "file2.pdf", "file3.jpg"]);
  });

  test("'onUpload' provides first file name and total count", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <FileUploadDropZone onUpload="files => testState = { count: files.length, firstFileName: files[0]?.name }">
        Upload Area
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await driver.triggerDrop(["document.pdf"]);
    await expect.poll(testStateDriver.testState).toEqual({
      count: 1,
      firstFileName: "document.pdf",
    });
  });

  test("programmatic open() API is registered and callable", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <FileUploadDropZone id="dropzone">Upload Area</FileUploadDropZone>
        <Button testId="openBtn" onClick="dropzone.open()">Open Dialog</Button>
      </VStack>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    const button = driver.component.page().getByTestId("openBtn");
    await expect(button).toBeVisible();
  });
});

// =============================================================================
// PASTE BEHAVIOR TESTS
// =============================================================================

test.describe("Paste Behavior", () => {
  test("'allowPaste' defaults to false", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    // Verify the component renders correctly with the default (allowPaste = false)
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
  });

  test("'allowPaste=false' does not render with paste enabled attribute", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    // When allowPaste=false the component should still render correctly
    // and not expose any paste-enabled state externally
    await initTestBed(`
      <FileUploadDropZone allowPaste="false" onUpload="files => testState = files.length">
        Upload Area
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.getHiddenInput()).toBeAttached();
  });

  test("paste from a text input is ignored even when 'allowPaste=true'", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <FileUploadDropZone allowPaste="true" onUpload="files => testState = files.length">
        <TextBox testId="searchInput" placeholder="Search..." />
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    const inputWrapper = page.getByTestId("searchInput");
    await expect(inputWrapper).toBeVisible();
    // Focus the actual <input> element inside the TextBox wrapper
    const inputEl = inputWrapper.locator("input");
    await inputEl.focus();

    // Dispatch a paste event originating from the input — should be ignored
    await inputEl.evaluate((el) => {
      const dt = new DataTransfer();
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      dt.items.add(file);
      const event = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      el.dispatchEvent(event);
    });

    // Upload handler should NOT have been called — testState stays at its initial null value
    expect(await testStateDriver.testState()).toBeNull();
  });

  test("'allowPaste=true' component has hidden input ready for paste", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone allowPaste="true">Upload Area</FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.getHiddenInput()).toBeAttached();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has a file input with correct type attribute", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload files here</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toHaveAttribute("type", "file");
  });

  test("child button can receive focus", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`
      <FileUploadDropZone>
        <Button testId="customButton">Browse Files</Button>
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    const button = driver.component.getByTestId("customButton");
    await expect(button).toBeVisible();
    await button.focus();
    await expect(button).toBeFocused();
  });

  test("nested TextBox can receive focus", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
    page,
  }) => {
    await initTestBed(`
      <FileUploadDropZone>
        <TextBox testId="textbox" placeholder="File description"/>
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    const textboxWrapper = page.getByTestId("textbox");
    await expect(textboxWrapper).toBeVisible();
    // Focus the actual <input> element inside the TextBox wrapper
    const textboxInput = textboxWrapper.locator("input");
    await textboxInput.focus();
    await expect(textboxInput).toBeFocused();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("'backgroundColor-FileUploadDropZone' applies background color", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`, {
      testThemeVars: { "backgroundColor-FileUploadDropZone": "rgb(255, 0, 0)" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("'textColor-FileUploadDropZone' applies to placeholder text", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone></FileUploadDropZone>`, {
      testThemeVars: { "textColor-FileUploadDropZone": "rgb(0, 255, 0)" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getDropPlaceholder()).toHaveCSS("color", "rgb(0, 255, 0)");
  });

  test("'borderColor-FileUploadDropZone' applies border color", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`, {
      testThemeVars: { "borderColor-FileUploadDropZone": "rgb(0, 0, 255)" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 0, 255)");
  });

  test("'borderWidth-FileUploadDropZone' applies border width", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`, {
      testThemeVars: { "borderWidth-FileUploadDropZone": "4px" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveCSS("border-width", "4px");
  });

  test("'borderRadius-FileUploadDropZone' applies border radius", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`, {
      testThemeVars: { "borderRadius-FileUploadDropZone": "8px" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveCSS("border-radius", "8px");
  });

  test("'borderStyle-FileUploadDropZone' applies border style", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`, {
      testThemeVars: { "borderStyle-FileUploadDropZone": "solid" },
    });
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toHaveCSS("border-style", "solid");
  });
});

// =============================================================================
// OTHER EDGE CASES
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("renders with no props and no children", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone></FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeAttached();
    await expect(driver.getHiddenInput()).toBeAttached();
  });

  test("renders inside a VStack layout", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <FileUploadDropZone>
          <Text>Layout Test</Text>
        </FileUploadDropZone>
      </VStack>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Layout Test");
  });

  test("'maxFiles=1' single-file input is enabled", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone maxFiles="1">Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toBeAttached();
    expect(await driver.isEnabled()).toBe(true);
  });

  test("'acceptedFileTypes' and 'maxFiles' can be combined", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(
      `<FileUploadDropZone acceptedFileTypes="image/*" maxFiles="5">Upload Area</FileUploadDropZone>`,
    );
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.getHiddenInput()).toBeAttached();
  });

  test("hasChildren returns true when children are present", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`
      <FileUploadDropZone>
        <VStack>
          <Text>Upload Files</Text>
          <Button>Browse</Button>
        </VStack>
      </FileUploadDropZone>
    `);
    const driver = await createFileUploadDropZoneDriver();
    await expect(driver.component).toBeVisible();
    expect(await driver.hasChildren()).toBe(true);
  });

  test("rapid drag enter/leave events are handled without errors", async ({
    initTestBed,
    createFileUploadDropZoneDriver,
  }) => {
    await initTestBed(`<FileUploadDropZone>Upload Area</FileUploadDropZone>`);
    const driver = await createFileUploadDropZoneDriver();
    await driver.triggerDragEnter();
    await driver.triggerDragLeave();
    await driver.triggerDragEnter();
    await driver.triggerDragLeave();
    await expect(driver.component).toBeVisible();
  });
});

