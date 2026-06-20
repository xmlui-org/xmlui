import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ initTestBed, page }) => {
    await initTestBed(`<PageMetaTitle />`);
    
    // PageMetaTitle doesn't render visible DOM elements, it only affects page title
    // Default title should be set in browser with test bed suffix
    await expect(page).toHaveTitle("XMLUI Application | test bed app");
  });

  test("component renders with value property", async ({ initTestBed, page }) => {
    await initTestBed(`<PageMetaTitle value="Custom Page Title" />`);
    
    // Custom title should be set in browser with test bed suffix
    await expect(page).toHaveTitle("Custom Page Title | test bed app");
  });

  test("component handles dynamic value changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack>
        <PageMetaTitle value="{testState || 'Initial Title'}" />
        <Button onClick="testState = 'Updated Title'">Update Title</Button>
      </VStack>
    `);
    
    // Initial title should be set
    await expect(page).toHaveTitle("Initial Title | test bed app");
    
    // Click button to update title
    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toEqual("Updated Title");
    
    // Title should be updated in browser
    await expect(page).toHaveTitle("Updated Title | test bed app");
  });

  test("component handles child content as title", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PageMetaTitle>
        Child Content Title
      </PageMetaTitle>
    `);
    
    // Child content should be used as title
    await expect(page).toHaveTitle("Child Content Title | test bed app");
  });

  test("value property takes precedence over child content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PageMetaTitle value="Value Property Title">
        Child Content That Should Be Ignored
      </PageMetaTitle>
    `);
    
    // Value property should take precedence
    await expect(page).toHaveTitle("Value Property Title | test bed app");
  });

  test("multiple PageMetaTitle components - last one wins", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <PageMetaTitle value="First Title" />
        <PageMetaTitle value="Second Title" />
        <PageMetaTitle value="Final Title" />
      </VStack>
    `);
    
    // Last component should set the final title
    await expect(page).toHaveTitle("Final Title | test bed app");
  });

  test("component updates existing page title", async ({ initTestBed, page }) => {
    // Set initial title
    await initTestBed(`<PageMetaTitle value="Initial Title" />`);
    await expect(page).toHaveTitle("Initial Title | test bed app");
    
    // Update with new component
    await initTestBed(`<PageMetaTitle value="Updated Title" />`);
    await expect(page).toHaveTitle("Updated Title | test bed app");
  });
});
