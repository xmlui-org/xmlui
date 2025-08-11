import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h2 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H2 testId="h2">Test Heading</H2>`);

    const driver = await createHeadingDriver("h2");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h2 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h2");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H2 testId="h2" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h2");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h2 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h2");
  });

  test("is equivalent to Heading with level='h2'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h2">Heading Content</Heading>
        <H2 testId="h2">H2 Content</H2>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h2Driver = await createHeadingDriver("h2");
    
    // Both should render as h2 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h2TagName = await h2Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h2");
    expect(h2TagName.toLowerCase()).toBe("h2");
    expect(headingTagName).toEqual(h2TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h2Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H2 testId="h2" level="h4">Should be H2</H2>`);

    const driver = await createHeadingDriver("h2");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H2");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h2 despite level="h4" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h2");
  });
});
