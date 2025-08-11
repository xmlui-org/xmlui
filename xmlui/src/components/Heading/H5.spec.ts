import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h5 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H5 testId="h5">Test Heading</H5>`);

    const driver = await createHeadingDriver("h5");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h5 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h5");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H5 testId="h5" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h5");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h5 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h5");
  });

  test("is equivalent to Heading with level='h5'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h5">Heading Content</Heading>
        <H5 testId="h5">H5 Content</H5>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h5Driver = await createHeadingDriver("h5");
    
    // Both should render as h5 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h5TagName = await h5Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h5");
    expect(h5TagName.toLowerCase()).toBe("h5");
    expect(headingTagName).toEqual(h5TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h5Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H5 testId="h5" level="h1">Should be H5</H5>`);

    const driver = await createHeadingDriver("h5");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H5");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h5 despite level="h1" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h5");
  });
});
