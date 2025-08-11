import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic props", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`<CodeBlock />`);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
});

test("component renders with Text content", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">const hello = "world";</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText("const hello = \"world\";");
});

test("component renders with children content", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <pre><code>function test() { return 42; }</code></pre>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText("function test() { return 42; }");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has proper semantic structure", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">const x = 1;</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  
  // CodeBlock should be identifiable as a code container
  await expect(driver.component).toHaveClass(/codeBlock/);
});

test.skip("copy button is keyboard accessible", async ({ initTestBed, createCodeBlockDriver, page }) => {
  // TODO: Review copy button visibility and keyboard interaction
  await initTestBed(`
    <CodeBlock>
      <property name="textToCopy">test code</property>
      <Text variant="codefence">test code</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  
  await page.context().grantPermissions(['clipboard-write', 'clipboard-read']);
  
  // Hover to show copy button
  await driver.hoverContent();
  await expect(driver.getCopyButton()).toBeVisible();
  
  // Focus and activate with keyboard
  await driver.getCopyButton().focus();
  await driver.getCopyButton().press('Enter');
  
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe("test code");
});

test("component content is accessible to screen readers", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">function accessible() { return true; }</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  
  // Code content should be readable
  const codeText = await driver.getCodeText();
  expect(codeText).toContain("function accessible() { return true; }");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component applies theme variables correctly", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`<CodeBlock />`, {
    testThemeVars: {
      "backgroundColor-CodeBlock": "rgb(255, 0, 0)",
      "borderRadius-CodeBlock": "8px",
    },
  });
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(driver.component).toHaveCSS("border-radius", "8px");
});

test.skip("copy button appears on hover", async ({ initTestBed, createCodeBlockDriver }) => {
  // TODO: Review copy button implementation and visibility patterns
  await initTestBed(`
    <CodeBlock>
      <property name="textToCopy">hover test</property>
      <Text variant="codefence">hover test</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  
  // Copy button should be hidden initially
  await expect(driver.getCopyButton()).not.toBeVisible();
  
  // Hover over content to show copy button
  await driver.hoverContent();
  await expect(driver.getCopyButton()).toBeVisible();
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles null and undefined props gracefully", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`<CodeBlock/>`);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
});

test("component handles empty content", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`<CodeBlock></CodeBlock>`);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toBeVisible();
});

test("component handles special characters in code", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">const emoji = "🚀"; const unicode = "émojis"; const quotes = '"test"';</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText('const emoji = "🚀"');
  await expect(driver.getContent()).toContainText("émojis");
});

test("component handles very long code content", async ({ initTestBed, createCodeBlockDriver }) => {
  const longCode = "const veryLongVariableName = ".repeat(100) + '"end";';
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">${longCode}</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText("end");
});

test("component handles invalid meta prop gracefully", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock meta="invalid">
      <Text variant="codefence">test code</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly in different layout contexts", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <VStack>
      <Text>Code example:</Text>
      <CodeBlock>
        <Text variant="codefence">const layout = 'test';</Text>
      </CodeBlock>
      <Text>End of example</Text>
    </VStack>
  `);
  const driver = await createCodeBlockDriver();
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText("const layout = 'test';");
});

test("component handles multiline code content", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">function example() {
  return "multiline test";
}</Text>
    </CodeBlock>
  `);
  const driver = await createCodeBlockDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.getContent()).toContainText("function example()");
  await expect(driver.getContent()).toContainText("return \"multiline test\"");
});

test("component applies global CSS class correctly", async ({ initTestBed, createCodeBlockDriver }) => {
  await initTestBed(`<CodeBlock />`);
  const driver = await createCodeBlockDriver();
  
  await expect(driver.component).toHaveClass(/global-codeBlock/);
});

test("component maintains consistent styling across themes", async ({ initTestBed, createCodeBlockDriver }) => {
  // Test light theme
  await initTestBed(`<CodeBlock />`, {
    testThemeVars: {
      "backgroundColor-CodeBlock": "rgb(248, 249, 250)",
      "border-CodeBlock": "1px solid rgb(208, 215, 222)",
    },
  });
  let driver = await createCodeBlockDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(248, 249, 250)");
  
  // Test dark theme
  await initTestBed(`<CodeBlock />`, {
    testThemeVars: {
      "backgroundColor-CodeBlock": "rgb(22, 27, 34)",
      "border-CodeBlock": "1px solid rgb(48, 54, 61)",
    },
  });
  driver = await createCodeBlockDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(22, 27, 34)");
});

// --- Smoke Tests (maintaining existing)

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createCodeBlockDriver }) => {
    await initTestBed(`<CodeBlock />`);
    await expect((await createCodeBlockDriver()).component).toBeAttached();
  });

  test("component with Text codefence renders", async ({ initTestBed, createCodeBlockDriver }) => {
    await initTestBed(`
    <CodeBlock>
      <Text variant="codefence">
        This is a test
      </Text>
    </CodeBlock>
    `);
    await expect((await createCodeBlockDriver()).component).toBeAttached();
  });
});
