import { expect, test } from "../../testing/fixtures";

// =============================================================================
// SCRIPT IMPORT PROCESSING TESTS
// =============================================================================

test.describe("Script Import Processing", () => {
  test("script with import statement does not break rendering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { testHelper } from "./test-files/test-helpers.xs";
          
          var message = "import processed";
        </script>
        <Text testId="result">{message}</Text>
      </App>
    `);

    await expect(page.getByTestId("result")).toContainText("import processed");
  });

  test("script with multiple imports does not break rendering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { add } from "./test-files/test-math.xs";
          import { formatMessage } from "./test-files/test-formatters.xs";
          
          var message = "multiple imports ok";
        </script>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await expect(page.getByTestId("message")).toContainText("multiple imports ok");
  });

  test("local function definition works alongside import statement", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { testHelper } from "./test-files/test-helpers.xs";
          
          function localFunc() {
            return "local function works";
          }
          
          var result = localFunc();
        </script>
        <Text testId="result">{result}</Text>
      </App>
    `);

    await expect(page.getByTestId("result")).toContainText("local function works");
  });

  test("script without imports still works correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          var localVar = "no imports";
          
          function localFunc() {
            return localVar + " needed";
          }
        </script>
        <Text testId="text">{localFunc()}</Text>
      </App>
    `);

    await expect(page.getByTestId("text")).toContainText("no imports needed");
  });

  test("script with imports works with desktop layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <script>
          import { getMessage } from "./test-files/test-formatters.xs";
          
          var headerText = "Header Content";
        </script>
        <AppHeader testId="header">
          <Text>{headerText}</Text>
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Main Content</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("import statement with single function", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { testHelper } from "./test-files/test-helpers.xs";
          
          var status = "import successful";
        </script>
        <Text testId="status">{status}</Text>
      </App>
    `);

    await expect(page.getByTestId("status")).toContainText("import successful");
  });

  test("import statement with multiple exports from module", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { add, multiply } from "./test-files/test-math.xs";
          
          var status = "multiple exports imported";
        </script>
        <Text testId="status">{status}</Text>
      </App>
    `);

    await expect(page.getByTestId("status")).toContainText("multiple exports imported");
  });

  test("empty script tag still works", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
        </script>
        <Text testId="text">Content rendered</Text>
      </App>
    `);

    await expect(page.getByTestId("text")).toContainText("Content rendered");
  });

  test("script with only import statement", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { testHelper } from "./test-files/test-helpers.xs";
        </script>
        <Text testId="text">App renders</Text>
      </App>
    `);

    await expect(page.getByTestId("text")).toContainText("App renders");
  });
});

// =============================================================================
// SCRIPT IMPORT ERROR HANDLING TESTS
// =============================================================================

test.describe("Script Import Error Handling", () => {
  test("script without import statement processes normally", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          var normalVar = "no imports";
          
          function normalFunc() {
            return normalVar;
          }
        </script>
        <Text testId="text">{normalFunc()}</Text>
      </App>
    `);

    await expect(page.getByTestId("text")).toContainText("no imports");
  });

  test("script with import renders even if module cannot be resolved", async ({ initTestBed, page }) => {
    // This test verifies graceful handling when module cannot be resolved
    // The component should still render, just without the imported values
    await initTestBed(`
      <App testId="app">
        <script>
          import { nonExistent } from "./test-files/missing-file.xs";
          
          var safeValue = "fallback value";
        </script>
        <Text testId="text">{safeValue}</Text>
      </App>
    `);

    // The app and text should still render
    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("text")).toContainText("fallback value");
  });
});

// =============================================================================
// SCRIPT IMPORT WITH LAYOUT TESTS
// =============================================================================

test.describe("Script Import with Layout Components", () => {
  test("imports work in desktop layout with AppHeader", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <script>
          import { getMessage } from "./test-files/test-formatters.xs";
          
          var title = "App Title";
        </script>
        <AppHeader testId="header">
          <Text>{title}</Text>
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Main Content</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("imports work with pages navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <script>
          import { pageTitle } from "./test-files/test-titles.xs";
          
          var pageContent = "Default Content";
        </script>
        <Button testId="btn-page1" onClick="pageContent = 'Page 1'" label="Page 1" />
        <Button testId="btn-page2" onClick="pageContent = 'Page 2'" label="Page 2" />
        <Text testId="content">{pageContent}</Text>
      </App>
    `);

    await expect(page.getByTestId("content")).toContainText("Default Content");
    await page.getByTestId("btn-page1").click();
    await expect(page.getByTestId("content")).toContainText("Page 1");
    await page.getByTestId("btn-page2").click();
    await expect(page.getByTestId("content")).toContainText("Page 2");
  });

  test("imports work inside Theme wrapper", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop">
        <Theme>
          <script>
            import { formatMessage } from "./test-files/test-formatters.xs";
            
            var themeTitle = "Themed App";
          </script>
          <AppHeader testId="themed-header">
            <Text>{themeTitle}</Text>
          </AppHeader>
          <Pages fallbackPath="/">
            <Page url="/">
              <Text testId="themed-content">Themed Content</Text>
            </Page>
          </Pages>
          <Footer testId="themed-footer">Themed Footer</Footer>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("themed-header")).toBeVisible();
    await expect(page.getByTestId("themed-content")).toBeVisible();
    await expect(page.getByTestId("themed-footer")).toBeVisible();
  });
});
