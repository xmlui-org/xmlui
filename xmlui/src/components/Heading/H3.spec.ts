import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h3 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H3 testId="h3">Test Heading</H3>`);

    const driver = await createHeadingDriver("h3");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h3 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h3");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H3 testId="h3" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h3");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h3 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h3");
  });

  test("is equivalent to Heading with level='h3'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h3">Heading Content</Heading>
        <H3 testId="h3">H3 Content</H3>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h3Driver = await createHeadingDriver("h3");
    
    // Both should render as h3 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h3TagName = await h3Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h3");
    expect(h3TagName.toLowerCase()).toBe("h3");
    expect(headingTagName).toEqual(h3TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h3Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H3 testId="h3" level="h1">Should be H3</H3>`);

    const driver = await createHeadingDriver("h3");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H3");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h3 despite level="h1" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h3");
  });
});
