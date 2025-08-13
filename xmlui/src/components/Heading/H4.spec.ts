import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h4 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H4 testId="h4">Test Heading</H4>`);

    const driver = await createHeadingDriver("h4");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h4 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h4");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H4 testId="h4" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h4");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h4 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h4");
  });

  test("is equivalent to Heading with level='h4'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h4">Heading Content</Heading>
        <H4 testId="h4">H4 Content</H4>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h4Driver = await createHeadingDriver("h4");
    
    // Both should render as h4 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h4TagName = await h4Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h4");
    expect(h4TagName.toLowerCase()).toBe("h4");
    expect(headingTagName).toEqual(h4TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h4Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H4 testId="h4" level="h1">Should be H4</H4>`);

    const driver = await createHeadingDriver("h4");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H4");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h4 despite level="h1" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h4");
  });
});
