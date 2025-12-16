import { expect, test } from "../../testing/fixtures";

test.describe("Br component", () => {
  test("br is rendered", async ({ initTestBed, createHtmlTagDriver }) => {
    await initTestBed(`<br />`);
    const driver = await createHtmlTagDriver();

    await expect(driver.component).toBeAttached();
  });

  test("Br (capitalized) is rendered", async ({ initTestBed, createHtmlTagDriver }) => {
    await initTestBed(`<Br />`);
    const driver = await createHtmlTagDriver();

    await expect(driver.component).toBeAttached();
  });

  test("br renders with attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<br testId="test-break" />`);
    
    const brElement = page.getByTestId('test-break');
    await expect(brElement).toBeAttached();
    await expect(brElement).toHaveAttribute("data-testid", "test-break");
  });

  test("Br (capitalized) renders with attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Br testId="test-break-capitalized" />`);
    
    const brElement = page.getByTestId('test-break-capitalized');
    await expect(brElement).toBeAttached();
    await expect(brElement).toHaveAttribute("data-testid", "test-break-capitalized");
  });

  test("br in text content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Text testId="text-container">
        First line<br />Second line
      </Text>
    `);
    
    const container = page.getByTestId('text-container');
    await expect(container).toBeAttached();
    
    const brElement = container.locator("br");
    await expect(brElement).toBeAttached();
  });

  test("Br (capitalized) in text content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Text testId="text-container-capitalized">
        First line<Br />Second line
      </Text>
    `);
    
    const container = page.getByTestId('text-container-capitalized');
    await expect(container).toBeAttached();
    
    const brElement = container.locator("br");
    await expect(brElement).toBeAttached();
  });

  test("both br and Br can be used together", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Text testId="mixed-container">
        Line 1<br />Line 2<Br />Line 3
      </Text>
    `);
    
    const container = page.getByTestId('mixed-container');
    await expect(container).toBeAttached();
    
    const brElements = container.locator("br");
    await expect(brElements).toHaveCount(2);
  });
});
