import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders as h1 level heading", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H1 testId="h1">Test Heading</H1>`);

    const driver = await createHeadingDriver("h1");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Test Heading");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h1 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h1");
  });

  test("renders with value property", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H1 testId="h1" value="Value Property Text" />`);

    const driver = await createHeadingDriver("h1");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Value Property Text");
    await expect(driver.component).toHaveRole("heading");
    
    // Verify it renders as h1 HTML element
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h1");
  });

  test("is equivalent to Heading with level='h1'", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="heading" level="h1">Heading Content</Heading>
        <H1 testId="h1">H1 Content</H1>
      </Fragment>
    `);

    const headingDriver = await createHeadingDriver("heading");
    const h1Driver = await createHeadingDriver("h1");
    
    // Both should render as h1 elements
    const headingTagName = await headingDriver.getComponentTagName();
    const h1TagName = await h1Driver.getComponentTagName();
    
    expect(headingTagName.toLowerCase()).toBe("h1");
    expect(h1TagName.toLowerCase()).toBe("h1");
    expect(headingTagName).toEqual(h1TagName);
    
    // Both should have heading role
    await expect(headingDriver.component).toHaveRole("heading");
    await expect(h1Driver.component).toHaveRole("heading");
  });

  test("ignores level property when provided", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<H1 testId="h1" level="h3">Should be H1</H1>`);

    const driver = await createHeadingDriver("h1");
    
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Should be H1");
    await expect(driver.component).toHaveRole("heading");
    
    // Should always be h1 despite level="h3" prop (this is the expected behavior)
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h1");
  });
});
