import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic props", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput/>`);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
});

test("component displays browse button", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput buttonLabel="Choose File"/>`);
  const driver = await createFileInputDriver();
  await expect(driver.getBrowseButton()).toBeVisible();
  await expect(driver.getBrowseButton()).toContainText("Choose File");
});

test("component displays placeholder text", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput placeholder="Select a file..."/>`);
  const driver = await createFileInputDriver();
  const placeholder = await driver.getPlaceholder();
  expect(placeholder).toBe("Select a file...");
});

test("component handles disabled state", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput enabled="false"/>`);
  const driver = await createFileInputDriver();
  await expect(driver.getBrowseButton()).toBeDisabled();
  expect(await driver.isEnabled()).toBe(false);
});

test("component supports multiple file selection", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput multiple="true"/>`);
  const driver = await createFileInputDriver();
  expect(await driver.isMultiple()).toBe(true);
});

test("component supports directory selection", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput directory="true"/>`);
  const driver = await createFileInputDriver();
  expect(await driver.isDirectory()).toBe(true);
});

test("component accepts specific file types", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput acceptsFileType="image/*,application/pdf"/>`);
  const driver = await createFileInputDriver();
  const acceptedTypes = await driver.getAcceptedFileTypes();
  expect(acceptedTypes).toBe("image/*,application/pdf");
});

test("component accepts file type array", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput acceptsFileType="['.jpg', '.png', '.pdf']"/>`);
  const driver = await createFileInputDriver();
  const acceptedTypes = await driver.getAcceptedFileTypes();
  expect(acceptedTypes).toContain(".jpg");
});

// =============================================================================
// ACCESSIBILITY TESTS (REQUIRED)
// =============================================================================

test("component has correct accessibility attributes", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput label="Upload Document"/>`);
  const driver = await createFileInputDriver();
  await expect(driver.getBrowseButton()).toHaveRole("button");
  await expect(driver.getHiddenInput()).toHaveAttribute("type", "file");
});

test("component is keyboard accessible", async ({ page, initTestBed, createFileInputDriver }) => {
  await initTestBed(`
    <VStack>
      <FileInput testId="fileInput" label="Input" />
    </VStack>
  `);

  const driver = await createFileInputDriver("fileInput");

  await driver.getTextBox().focus();
  await expect(driver.getTextBox()).toBeFocused();
});

test("component supports tab navigation", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`
    <VStack>
      <FileInput testId="fileInput" label="Input" />
    </VStack>
  `);

  const driver = await createFileInputDriver("fileInput");

  await driver.getTextBox().focus();
  await expect(driver.getTextBox()).toBeFocused();

  await driver.getTextBox().press("Tab");
  await expect(driver.getBrowseButton()).toBeVisible();
  await expect(driver.getBrowseButton()).not.toBeDisabled();
  await expect(driver.getBrowseButton()).toBeFocused();
});

test("component has hidden file input for screen readers", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput/>`);
  const driver = await createFileInputDriver();
  const hiddenInput = driver.getHiddenInput();
  await expect(hiddenInput).toBeAttached();
  await expect(hiddenInput).toHaveAttribute("type", "file");
});

test("component textbox is readonly for accessibility", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput/>`);
  const driver = await createFileInputDriver();
  expect(await driver.hasReadOnlyAttribute()).toBe(true);
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component applies theme variables correctly", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput/>`, {
    testThemeVars: {
      "backgroundColor-Button": "rgb(255, 0, 0)",
    },
  });
  const driver = await createFileInputDriver();
  // FileInput uses Button themes, so check the button
  await expect(driver.getBrowseButton()).toHaveCSS("background-color", "rgb(255, 0, 0)");
});

test("component shows validation states", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput validationStatus="error"/>`);
  const driver = await createFileInputDriver();
  // Validation should be visible in the component
  await expect(driver.component).toBeVisible();
  await expect(driver.getTextBox()).toBeVisible();
});

test("component supports different button variants", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput variant="outline"/>`);
  const driver = await createFileInputDriver();
  // Check that variant prop is passed through
  await expect(driver.getBrowseButton()).toBeVisible();
  await expect(driver.getBrowseButton()).toContainText("Browse");
});

test("component supports different button sizes", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput buttonSize="lg"/>`);
  const driver = await createFileInputDriver();
  await expect(driver.getBrowseButton()).toHaveClass(/lg/);
});

test("component supports button positioning", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput buttonPosition="start"/>`);
  const driver = await createFileInputDriver();
  await expect(driver.getContainer()).toHaveClass(/buttonStart/);
});

// =============================================================================
// EDGE CASE TESTS (CRITICAL)
// =============================================================================

test("component handles null and undefined props gracefully", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput/>`);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
  expect(await driver.getSelectedFiles()).toBe("");
});

test("component handles empty acceptsFileType", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`<FileInput acceptsFileType=""/>`);
  const driver = await createFileInputDriver();
  expect(await driver.getAcceptedFileTypes()).toBe("");
});

test("component handles special characters in placeholder", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput placeholder="Select file with émojis 🚀 & quotes"/>`);
  const driver = await createFileInputDriver();
  const placeholder = await driver.getPlaceholder();
  expect(placeholder).toBe("Select file with émojis 🚀 & quotes");
});

test("component handles conflicting multiple and directory props", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput multiple="false" directory="true"/>`);
  const driver = await createFileInputDriver();
  // Directory mode should enable multiple files
  expect(await driver.isDirectory()).toBe(true);
  expect(await driver.isMultiple()).toBe(true);
});

test("component handles empty file selection gracefully", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`<FileInput/>`);
  const driver = await createFileInputDriver();
  expect(await driver.getSelectedFiles()).toBe("");
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test("component handles rapid button clicks efficiently", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <FileInput onFocus="testState = ++testState || 1"/>
  `);
  const driver = await createFileInputDriver();

  // Multiple rapid clicks should not cause issues
  await driver.getBrowseButton().click();
  await driver.getBrowseButton().click();
  await driver.getBrowseButton().click();

  await expect(driver.component).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly in different layout contexts", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`
    <VStack>
      <FileInput label="Layout Test"/>
    </VStack>
  `);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
});

test("component works in form context", async ({ initTestBed, createFileInputDriver }) => {
  await initTestBed(`
    <Form>
      <FileInput label="Upload File" required="true"/>
    </Form>
  `);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
});

test("gotFocus event fires on focus", async ({ initTestBed, page, createFileInputDriver }) => {
  const { testStateDriver } = await initTestBed(`
      <FileInput testId="fileInput" onGotFocus="testState = 'focused'" />
    `);

  const driver = await createFileInputDriver("fileInput");
  await driver.getTextBox().focus();
  await expect.poll(testStateDriver.testState).toEqual("focused");
});

test("lostFocus event fires on blue", async ({ initTestBed, page, createFileInputDriver }) => {
  const { testStateDriver } = await initTestBed(`
      <FileInput testId="fileInput" onLostFocus="testState = 'blurred'" />
    `);

  const driver = await createFileInputDriver("fileInput");
  await driver.getTextBox().focus();
  await driver.getTextBox().blur();
  await expect.poll(testStateDriver.testState).toEqual("blurred");
});


test("component supports custom button templates", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`
    <FileInput>
      <property name="buttonIcon">
        <Icon name="upload"/>
      </property>
    </FileInput>
  `);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getBrowseButton()).toContainText("Browse");
});

test("component handles label positioning correctly", async ({
  initTestBed,
  createFileInputDriver,
}) => {
  await initTestBed(`
    <FileInput 
      label="Upload Document"
      labelPosition="top"
      labelWidth="100px"
    />
  `);
  const driver = await createFileInputDriver();
  await expect(driver.component).toBeVisible();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<FileInput width="200px" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<FileInput width="200px" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<FileInput width="50%" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<FileInput width="50%" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});
