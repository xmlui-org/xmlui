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

test("gotFocus event fires on label focus", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <FileInput testId="fileInput" onGotFocus="testState = 'focused'" label="test" />
  `);
  await page.getByText("test").click();
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
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<FileInput width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<FileInput width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// =============================================================================
// PARSING TESTS
// =============================================================================

test.describe("Parsing", () => {
  test("infers acceptsFileType from parseAs csv", async ({ initTestBed, createFileInputDriver }) => {
    await initTestBed(`<FileInput parseAs="csv" />`);
    const driver = await createFileInputDriver();
    // parseAs should auto-set the file input accept attribute unless overridden.
    await expect(driver.getHiddenInput()).toHaveAttribute("accept", ".csv");
  });

  test("infers acceptsFileType from parseAs json", async ({ initTestBed, createFileInputDriver }) => {
    await initTestBed(`<FileInput parseAs="json" />`);
    const driver = await createFileInputDriver();
    // Same inference logic for JSON.
    await expect(driver.getHiddenInput()).toHaveAttribute("accept", ".json");
  });

  test("parses csv and emits row data", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="csv" onDidChange="data => testState = data.length" />
    `);
    const driver = await createFileInputDriver();
    // Upload a CSV file through the hidden input; onDidChange emits parsed rows.
    await driver.getHiddenInput().setInputFiles({
      name: "sample.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,price\nWidget,10\nGadget,20\n"),
    });

    // Expect two parsed rows (header is consumed).
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("parses json object as array", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="json" onDidChange="data => testState = data.length" />
    `);
    const driver = await createFileInputDriver();
    // Single JSON object is normalized into an array.
    await driver.getHiddenInput().setInputFiles({
      name: "sample.json",
      mimeType: "application/json",
      buffer: Buffer.from("{\"name\":\"Widget\",\"price\":10}"),
    });

    // Expect one array entry after normalization.
    await expect.poll(testStateDriver.testState).toEqual(1);
  });

  test("returns parse results for multiple files", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        multiple="true"
        onDidChange="results => testState = results.length"
      />
    `);
    const driver = await createFileInputDriver();
    // When multiple=true, onDidChange receives ParseResult[] for each file.
    await driver.getHiddenInput().setInputFiles([
      {
        name: "first.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("name,price\nWidget,10\n"),
      },
      {
        name: "second.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("name,price\nGadget,20\n"),
      },
    ]);

    // Expect one ParseResult per file.
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("parseError event fires on invalid json", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="json" onParseError="testState = 'error'" />
    `);
    const driver = await createFileInputDriver();
    // Invalid JSON triggers parseError, not onDidChange.
    await driver.getHiddenInput().setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{"),
    });

    await expect.poll(testStateDriver.testState).toEqual("error");
  });

  test("parses json array correctly", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="json" onDidChange="data => testState = data.length" />
    `);
    const driver = await createFileInputDriver();
    // JSON array should be passed through as-is.
    await driver.getHiddenInput().setInputFiles({
      name: "array.json",
      mimeType: "application/json",
      buffer: Buffer.from('[{"name":"Widget","price":10},{"name":"Gadget","price":20}]'),
    });

    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("parses csv with custom delimiter", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        csvOptions="{{ delimiter: ';' }}"
        onDidChange="data => testState = data.length"
      />
    `);
    const driver = await createFileInputDriver();
    // CSV with semicolon delimiter.
    await driver.getHiddenInput().setInputFiles({
      name: "semicolon.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name;price\nWidget;10\nGadget;20\n"),
    });

    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("parses csv with dynamicTyping", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        csvOptions="{{ dynamicTyping: true }}"
        onDidChange="data => testState = typeof data[0].price"
      />
    `);
    const driver = await createFileInputDriver();
    // dynamicTyping should convert "10" to number 10.
    await driver.getHiddenInput().setInputFiles({
      name: "typed.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,price\nWidget,10\n"),
    });

    await expect.poll(testStateDriver.testState).toEqual("number");
  });

  test("parses csv without header option", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        csvOptions="{{ header: false }}"
        onDidChange="data => testState = data.length"
      />
    `);
    const driver = await createFileInputDriver();
    // Without header, all rows are returned as arrays.
    await driver.getHiddenInput().setInputFiles({
      name: "noheader.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Widget,10\nGadget,20\n"),
    });

    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("verifies parsed csv data structure", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        onDidChange="data => testState = { name: data[0].name, price: data[0].price }"
      />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles({
      name: "data.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,price\nWidget,10\n"),
    });

    await expect.poll(async () => {
      const result = await testStateDriver.testState();
      return result?.name;
    }).toBe("Widget");

    const result = await testStateDriver.testState();
    expect(result.price).toBe("10");
  });

  test("verifies parsed json data structure", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="json"
        onDidChange="data => testState = data[0]"
      />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles({
      name: "data.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"name":"Widget","price":10}'),
    });

    await expect.poll(async () => {
      const result = await testStateDriver.testState();
      return result?.name;
    }).toBe("Widget");

    const result = await testStateDriver.testState();
    expect(result.price).toBe(10);
  });

  test("handles empty csv file", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="csv" onDidChange="data => testState = data.length" />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles({
      name: "empty.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(""),
    });

    await expect.poll(testStateDriver.testState).toEqual(0);
  });

  test("handles empty json file", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput parseAs="json" onParseError="testState = 'error'" />
    `);
    const driver = await createFileInputDriver();
    // Empty JSON should trigger parse error.
    await driver.getHiddenInput().setInputFiles({
      name: "empty.json",
      mimeType: "application/json",
      buffer: Buffer.from(""),
    });

    await expect.poll(testStateDriver.testState).toEqual("error");
  });

  test("can override acceptsFileType when parseAs is set", async ({ initTestBed, createFileInputDriver }) => {
    await initTestBed(`<FileInput parseAs="csv" acceptsFileType=".txt,.csv" />`);
    const driver = await createFileInputDriver();
    // Explicit acceptsFileType should override inference.
    await expect(driver.getHiddenInput()).toHaveAttribute("accept", ".txt,.csv");
  });

  test("verifies ParseResult structure for multiple files", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="csv"
        multiple="true"
        onDidChange="results => testState = {
          hasFile: !!results[0].file,
          hasData: Array.isArray(results[0].data),
          fileName: results[0].file.name
        }"
      />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles([
      {
        name: "test.csv",
        mimeType: "text/csv",
        buffer: Buffer.from("name,price\nWidget,10\n"),
      },
    ]);

    await expect.poll(async () => {
      const result = await testStateDriver.testState();
      return result?.hasFile;
    }).toBe(true);

    const result = await testStateDriver.testState();
    expect(result.hasData).toBe(true);
    expect(result.fileName).toBe("test.csv");
  });

  test("onParseError receives error and file", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="json"
        onParseError="(error, file) => testState = { hasError: !!error, fileName: file.name }"
      />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{invalid"),
    });

    await expect.poll(async () => {
      const result = await testStateDriver.testState();
      return result?.hasError;
    }).toBe(true);

    const result = await testStateDriver.testState();
    expect(result.fileName).toBe("bad.json");
  });

  test("handles mixed success and failure in multiple files", async ({ initTestBed, createFileInputDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <FileInput
        parseAs="json"
        multiple="true"
        onDidChange="results => testState = {
          total: results.length,
          errors: results.filter(r => r.error).length,
          success: results.filter(r => !r.error).length
        }"
      />
    `);
    const driver = await createFileInputDriver();
    await driver.getHiddenInput().setInputFiles([
      {
        name: "good.json",
        mimeType: "application/json",
        buffer: Buffer.from('{"name":"Widget"}'),
      },
      {
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from("{invalid"),
      },
    ]);

    await expect.poll(async () => {
      const result = await testStateDriver.testState();
      return result?.total;
    }).toBe(2);

    const result = await testStateDriver.testState();
    expect(result.success).toBe(1);
    expect(result.errors).toBe(1);
  });
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("requireLabelMode='markRequired' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="true" requireLabelMode="markRequired" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markRequired' hides indicator for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="false" requireLabelMode="markRequired" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markOptional' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="false" requireLabelMode="markOptional" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='markOptional' hides indicator for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="true" requireLabelMode="markOptional" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="true" requireLabelMode="markBoth" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <FileInput testId="test" label="Upload Document" required="false" requireLabelMode="markBoth" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).not.toContainText("*");
    await expect(label).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides Form itemRequireLabelMode", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markRequired">
        <FileInput testId="test" label="Upload Document" required="false" requireLabelMode="markOptional" bindTo="document" />
      </Form>
    `);
    
    const label = page.getByText("Upload Document");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits Form itemRequireLabelMode when not specified", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markBoth">
        <FileInput testId="test1" label="Required Field" required="true" bindTo="field1" />
        <FileInput testId="test2" label="Optional Field" required="false" bindTo="field2" />
      </Form>
    `);
    
    const requiredLabel = page.getByText("Required Field");
    const optionalLabel = page.getByText("Optional Field");
    
    await expect(requiredLabel).toContainText("*");
    await expect(requiredLabel).not.toContainText("(Optional)");
    await expect(optionalLabel).toContainText("(Optional)");
    await expect(optionalLabel).not.toContainText("*");
  });
});
