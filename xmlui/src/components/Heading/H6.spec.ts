import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h6 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H6 testId="h6">Test Heading</H6>`);

    const driver = await createHeadingDriver("h6");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h6 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h6");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H6 testId="h6" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h6");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h6 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h6");
  });

  test("is equivalent to Heading with level='h6'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h6">Heading Content</Heading>
        <H6 testId="h6">H6 Content</H6>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h6Driver = await createHeadingDriver("h6");
    
    // Both should render as h6 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h6TagName = await h6Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h6");
    expect(h6TagName.toLowerCase()).toBe("h6");
    expect(headingTagName).toEqual(h6TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h6Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H6 testId="h6" level="h1">Should be H6</H6>`);

    const driver = await createHeadingDriver("h6");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H6");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h6 despite level="h1" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h6");
  });
});
